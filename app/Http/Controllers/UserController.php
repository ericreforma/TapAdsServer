<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

// traits
use App\Traits\Firebase\ClientFirebaseController;

use App\User;
use App\Client;
use App\Chat;
use App\Media;
use App\Vehicle;
use App\UserVehiclePhoto;
use App\UserVehicle;
use App\UserVehicleUpdate;
use App\UserCampaign;
use App\UserRating;
use App\UserTrip;
use App\UserTripMap;
use App\UserBankDetails;
use App\UserWithdrawal;
use App\ClientCampaign;
use App\ClientCampaignLocation;
use App\UserCurrentLocation;
use App\FirebaseData;
use App\UserVehicleRequest;

use Input;
use Storage;
use Hash;
use DB;
use Carbon\Carbon;

class UserController extends Controller
{
	use ClientFirebaseController;
	/**
		 * Create a new controller instance.
		 *
		 * @return void
		 */

	public function __construct()  {
		$this->middleware('auth:api');
	}

	public function logout (Request $request, $unique_id) {
		$user = $request->user();
		$firebase = FirebaseData::where('owner', '=', 0)
		->where('owner_id', '=', $user->id)
		->where('unique_id' ,'=', $unique_id)
		->delete();
		
		$token = $request->user()->token();
		$token->revoke();

		$response = 'You have been succesfully logged out!';
		return response($response, 200);
	}

	public function details(Request $request){
		$media = [];
		$user = $request->user();

		$bank_details = $user->bank_details;
		if($bank_details) {
			$firstPart = substr($bank_details->account_number, 0, 7);
			$secondPart = substr($bank_details->account_number, 7);
			// $user->account_number = $firstPart.''.implode(array_fill(0, strlen($secondPart), 'x'), "");v
			$user->account_number = $bank_details->account_number;
		} else {
			$user->account_number = '';
		}
		$ratings = $user->ratings;
		$user->vehicles = $user->vehicles();

		foreach($user->vehicles as $v){
			$vehicle_photo_id = UserVehiclePhoto::where('user_vehicle_id',$v->id)
			->select('media_id')
			->get()
			->toArray();
			$v->vehicle = Vehicle::where('id',$v->vehicle_id)->first();
			$v->photo = Media::whereIn('id',$vehicle_photo_id)->get();

			$v->campaigns = UserCampaign::where('user_vehicle_id', $v->id)
			->leftJoin('client_campaign as cc', 'cc.id', 'user_campaign.campaign_id')
			->select('cc.name', 'cc.id')
			->get();
		};

		$user_media = Media::whereIn('id', [$request->user()->media_id, $request->user()->license_media_id])->get();
		$user->profilePicture = '';
		$user->licenseImage = '';
		foreach($user_media as $um) {
			if($um->id == $request->user()->media_id) {
				$user->profilePicture = $um->url;
			} else if($um->id == $request->user()->license_media_id) {
				$user->licenseImage = $um->url;
			}
		}
		
		return response()->json($user);
	}

	public function update_notification(Request $request) {
		$user = $request->user();
		if($request->all) {
			$this->chat_unseen($user->id)->update();
			$this->campaign_unseen($user->id)->update();
			$this->payment_unseen($user->id)->update();
			return response()->json(0);
		} else {
			$cid = isset($request->cid) ? $request->cid : false;
			$chat_count = $this->chat_unseen_count($user->id);
			$campaign_count = $this->campaign_unseen_count($user->id);
			$payment_count = $this->payment_unseen_count($user->id);
			$notif_count = $chat_count + $campaign_count + $payment_count;

			if($request->chat) {
				$notif_count -= $chat_count;
				$this->chat_unseen_update($user->id, $cid);
			}

			if($request->campaign) {
				$notif_count -= $campaign_count;
				$this->campaign_unseen_update($user->id, $cid);
			}
			
			if($request->payment) {
				$notif_count -= $payment_count;
				$this->payment_unseen_update($user->id, $cid);
			}
			
			return response()->json($notif_count);
		}
	}

	public function get_notification(Request $request) {
		$user = $request->user();
		$notif_count = $this->chat_unseen_count($user->id);
		$notif_count += $this->campaign_unseen_count($user->id);
		$notif_count += $this->payment_unseen_count($user->id);
		return response()->json($notif_count);
	}

	public function campaign_list(Request $request){
		$user = $request->user();

		$mycampaign = $user->campaigns;
		foreach ($mycampaign as $c) {
			$campaignDetails = ClientCampaign::find($c->campaign_id);
			$location = ClientCampaignLocation::whereIn('id', $campaignDetails->location_id)->get();
			if(count($location) !== 0) {
				$campaignDetails->location = implode(', ', $location->pluck('name')->all());
			
				$media = Media::find($campaignDetails->media_id);
				$campaignDetails->photo = $media ? $media->url : null;
			}
			$c->campaignDetails = $campaignDetails;

			$c->client = Client::find($c->campaignDetails->client_id);
			$c->trips = UserTrip::where('user_campaign_id',$c->id)
			->where('trip_traveled', '>', 0)
			->get();
			$c->messages = Chat::where('client_id', '=', $c->campaignDetails->client_id)
			->where('user_id', '=', $user->id)
			->where('sender', '=', 1)
			->where('seen', '=', 0)
			->orderBy('created_at', 'DESC')
			->get();
			$c->payments = UserWithdrawal::where('campaign_id', '=', $c->campaign_id)
			->where('user_id', '=', $user->id)
			->orderBy('created_at', 'asc')
			->get();
			$c->vehicleMonthlyUpdate = UserVehicleUpdate::where('campaign_id', $c->campaign_id)
			->leftJoin('media as m', 'm.id', 'user_vehicle_update.media_id')
			->where('user_id', $user->id)
			->select('user_vehicle_update.*', 'm.url')
			->orderBy('created_at', 'DESC')
			->get();
			
			$c->vehicle = UserVehicle::where('user_vehicle.id', '=', $c->user_vehicle_id)
			->leftJoin('vehicle as v', 'v.id', 'user_vehicle.vehicle_id')
			->select(
				'user_vehicle.*',
				'v.manufacturer',
				'v.model',
				'v.classification'
			)
			->first();
		}

		return response()->json($mycampaign);
	}

	public function campaign_add(Request $request){
		$user = $request->user();
		$cid = $request->campaign_id;

		$campaign = ClientCampaign::find($cid);
		if($campaign) {
			$uc_instance = UserCampaign::where('campaign_id', $cid)
			->where('request_status', '!=', 2)
			->where('end', '=', 0)
			->get();

			$user_campaign = $uc_instance->where('user_id', '=', $user->id)->count();
			if($user_campaign === 0) {
				$slots_used = $uc_instance->where('request_status', '=', 1)->count();

				if($slots_used < $campaign->slots) {
					$userCampaign = new UserCampaign;
					$userCampaign->client_id = $request->client_id;
					$userCampaign->campaign_id = $request->campaign_id;
					$userCampaign->user_id = $user->id;
					$userCampaign->user_vehicle_id = $request->user_vehicle_id;
					$userCampaign->save();
	
					return response()->json([
						'status' => 'success',
						'message' => 'added on list'
					]);
				}

				return response()->json([
					'status' => 'error',
					'message' => 'No remaining slot for this campaign'
				]);
			}

			return response()->json([
				'status' => 'error',
				'message' => 'Already on the list'
			]);
		}

		return response()->json([
			'status' => 'error',
			'message' => 'Campaign does not exist'
		]);
	}

	public function campaign_trip_update(Request $request){
		$myCampaign = UserCampaign::find($request->input('trip.user_campaign_id'));

		$myCampaign->campaign_traveled = $myCampaign->campaign_traveled + $request->input('trip.campaign_traveled');
		$myCampaign->trip_traveled = $myCampaign->trip_traveled + $request->input('trip.trip_traveled');
		$myCampaign->save();
	}

	public function campaign_favorite(Request $request, $cid){
		$user = $request->user();
		$userCampaign = UserCampaign::find($cid);
		$userCampaign->favorite = abs($userCampaign->favorite - 1);
		$userCampaign->save();

		$mycampaign = $user->campaigns;
		foreach ($mycampaign as $c) {
			$c->campaignDetails = ClientCampaign::find($c->campaign_id);
			$c->client = Client::find($c->campaignDetails->client_id);
			$c->trips = UserTrip::where('user_campaign_id',$c->id)->get();
			$c->messages = Chat::where('client_id', '=', $c->campaignDetails->client_id)
								->where('user_id', '=', $user->id)
								->where('sender', '=', 1)
								->where('seen', '=', 0)
								->orderBy('created_at', 'DESC')
								->get();
		}

		return response()->json($mycampaign);
	}

	public function submitUserRating(Request $request) {
		$rating            = new UserRating;
		$rating->user_id   = $request->userId;
		$rating->client_id = $request->user()->id;
		$rating->rate      = $request->rate;
		$rating->comment   = $request->comment;
		$rating->save();

		if($rating) {
			return response()->json([
				'status'  => 'success',
				'message'    => 'Rating saved!'
			]);
		} else {
			return response()->json([
				'status'  => 'error',
				'message' => 'Error occured! Try again later.'
			]);
		}
	}

	public function viewProfile($id) {
		$userData = User::leftJoin('media as m', 'm.id', 'users.media_id')
						->where('users.id', '=', $id)
						->select(
							'users.id',
							'users.name',
							'users.media_id',
							'users.birthdate',
							'users.contact_number',
							'users.location',
							'users.email',
							'users.created_at',
							'users.updated_at',
							'm.url'
						)
						->first();
		$userCampaigns = UserCampaign::where('user_id', '=', $id)
									->leftJoin('client_campaign as cc', 'cc.id', 'user_campaign.campaign_id')
									->leftJoin('client as c', 'c.id', 'cc.client_id')
									->leftJoin('media as mclient', 'mclient.id', 'c.media_id')
									->leftJoin('media as mcampaign', 'mcampaign.id', 'cc.media_id')
									->select(
										'user_campaign.*',
										'cc.name as campaign_name',
										'cc.description as campaign_description',
										'cc.client_id',
										'c.business_name',
										'c.business_nature',
										'mclient.url as media_client_url',
										'mcampaign.url as media_campaign_url'
									)
									->get();
		$userRating = UserRating::leftJoin('client as c', 'c.id', 'user_rating.client_id')
								->where('user_id', '=', $id)
								->leftJoin('media as m', 'm.id', 'c.media_id')
								->select(
									'user_rating.*',
									'c.business_name',
									'c.business_nature',
									'm.url'
								)
								->get();
		$userVehicle = UserVehicle::where('user_id', '=', $id)->get();

		if($userData) {
			return response()->json([
				'status'  => 'success',
				'message' => [
					'userData' 		=> $userData,
					'userCampaigns' => $userCampaigns,
					'userRating' 	=> $userRating,
					'userVehicle'	=> $userVehicle
				]
			]);
		} else {
			return response()->json([
				'status'  => 'error',
				'message' => 'Error occured! Try again later.'
			]);
		}
	}

	public function trip_create(Request $request){
		$user = $request->user();
		$userTrip = new UserTrip;
		$userTrip->campaign_id = $request->campaign_id;
		$userTrip->user_id = $user->id;
		$userTrip->user_campaign_id = $request->user_campaign_id;
		$userTrip->started = Carbon::now()->format('Y-m-d H:i:s');

		$userTrip->save();

		return response()->json(['status' => 'saved', 'trip' => $userTrip ]);
	}

	public function trip_end(Request $request){
		$trip_id = $request->input('trip.trip_id');
		$date_now = Carbon::now()->format('Y-m-d H:i:s');

		$trip = UserTrip::find($trip_id);
		$trip->ended = $date_now;
		$trip->campaign_traveled = $request->input('trip.campaign_traveled');
		$trip->trip_traveled = $request->input('trip.trip_traveled');
		$trip->location_start_address =$request->input('trip.location_start_address');
		$trip->location_start_long = $request->input('trip.location_start_longitude');
		$trip->location_start_lat = $request->input('trip.location_start_latitude');
		$trip->location_end_address =$request->input('trip.location_end_address');
		$trip->location_end_long = $request->input('trip.location_end_longitude');
		$trip->location_end_lat = $request->input('trip.location_end_latitude');
		$trip->save();

		$userCampaign = UserCampaign::find($request->input('trip.user_campaign_id'));
		$total_campaign_traveled = $userCampaign->campaign_traveled + $request->input('trip.campaign_traveled');
		$userCampaign->campaign_traveled = $total_campaign_traveled;
		if($userCampaign->campaign->pay_basic_km <= $total_campaign_traveled) {
			if($userCampaign->completed != 1) {
				$userCampaign->completed = 1;
			}
		}
		$userCampaign->trip_traveled = $userCampaign->trip_traveled + $request->input('trip.trip_traveled');
		$userCampaign->save();
	}

	public function trip_map_add(Request $request){
		$tripmap = json_decode($request->trip_map, true);
		
		$userLocation = UserCurrentLocation::updateOrCreate(
			[
				'user_trip_id' => $tripmap['user_trip_id']
			],
			[
				'client_id' => $tripmap['client_id'],
				'campaign_id' => $tripmap['campaign_id'],
				'user_id' => $tripmap['user_id'],
				'campaign_id' => $tripmap['campaign_id'],
				'user_campaign_id' => $tripmap['user_campaign_id'],
				'latitude' => $tripmap['latitude'],
				'longitude' => $tripmap['longitude'],
				'heading' => $tripmap['heading'],
				'speed' => $tripmap['speed'],
				'timestamp' => Carbon::createFromTimestamp($tripmap['timestamp'])->format('Y-m-d H:i:s'),
			]
		);

		$trip_map = new UserTripMap;
		$trip_map->user_trip_id = $tripmap['user_trip_id'];
		$trip_map->campaign_id = $tripmap['campaign_id'];
		$trip_map->user_id = $tripmap['user_id'];
		$trip_map->user_campaign_id = $tripmap['user_campaign_id'];
		$trip_map->client_id = $tripmap['client_id'];
		$trip_map->counted = $tripmap['counted'];
		$trip_map->latitude = $tripmap['latitude'];
		$trip_map->longitude = $tripmap['longitude'];
		$trip_map->distance = $tripmap['distance'];
		$trip_map->speed = $tripmap['speed'];
		$trip_map->save();

		return response()->json(1);
	}

	public function trip_info(Request $request, $tid) {
		$user_trip_map = UserTripMap::where('user_trip_id', $tid)->get();
		return response()->json($user_trip_map);
	}

	public function earnings_history(Request $request) {
		$user = $request->user();
		$campaigns = $user->campaigns;
		$withdraws = UserWithdrawal::whereIn('user_withdrawal.campaign_id', $campaigns->pluck('campaign_id')->all())
								->where('user_withdrawal.user_id', '=', $user->id)
								->leftJoin('client_campaign as cc', 'cc.id', 'user_withdrawal.campaign_id')
								->select(
									'user_withdrawal.*',
									'cc.name'
								)
								->orderBy('user_withdrawal.created_at', 'DESC')
								->get();
		return response()->json($withdraws);
	}

	public function getUserTrip(Request $request) {
		$uid = $request->uid;
		$cid = $request->cid;
		$date = $request->date;
		$action_choice = $request->actionChoice; // all users is false, true if single
		
		if($action_choice) { // all
			$user_trip = UserTrip::where('campaign_id', '=', $cid)
								->where('user_id', '=', $uid)
								->get();
		} else { // single
			$user_trip = UserTrip::where('campaign_id', '=', $cid)->get();
		}
		$user_trip_map = UserTripMap::whereIn('user_trip_id', $user_trip->pluck('id')->all())->get();

		return response()->json([
			'status'  => 'success',
			'message' => [
				'userTrip'    => $user_trip,
				'userTripMap' => $user_trip_map
			]
		]);
	}

	public function update_details(Request $request) {
		User::find($request->user()->id)
			->update([
				'name'			 => Input::get('name'),
				'username' 		 => Input::get('username'),
				'email' 		 => Input::get('email'),
				'contact_number' => Input::get('contact_number'),
				'birthdate'		 => Input::get('birthdate'),
				'location'		 => Input::get('location')
			]);
		return response()->json(User::find($request->user()->id));
	}

	public function update_photo(Request $request) {
		list($fileType, $fileExt) = explode('/', Input::get('type'));
		$filename = md5(strftime(time())) . '.' . $fileExt;
		$image = Storage::disk('user')->put($filename, base64_decode(Input::get('file')));
		$url = 'images/user_picture/'.$filename;
		$media = $this->save_media($filename, $request->user()->id, 1, $url);
		$user = User::where('id', '=', $request->user()->id)
		->update([
			'media_id' => $media->id
		]);

		return response()->json([
			'imageResponse' => $image,
			'media' => $media
		]);
	}

	public function update_license(Request $request) {
		list($fileType, $fileExt) = explode('/', Input::get('type'));
		$filename = md5(strftime(time())) . '.' . $fileExt;
		$image = Storage::disk('license')->put($filename, base64_decode(Input::get('file')));
		$url = 'images/license/'.$filename;
		$media = $this->save_media($filename, $request->user()->id, 1, $url);
		$user = User::where('id', '=', $request->user()->id)
					->update([
						'license_media_id' => $media->id
					]);
		return response()->json([
			'imageResponse' => $image,
			'media' => $media
		]);
	}

	public function update_password(Request $request) {
		if(Hash::check(Input::get('curPass'), $request->user()->password)) {
			$newPassword = Hash::make(Input::get('newPass'));
			$user = User::where('id', '=', $request->user()->id)
						->update([ 'password' => $newPassword ]);
			return response()->json(User::find($request->user()->id));
		} else {
			return response()->json(false);
		}
	}

	public function update_bank_details(Request $request) {
		$user = $request->user();
		$bank_details = $user->bank_details;
		if(Hash::check(Input::get('password'), $user->password)) {
			if($bank_details) { //update bank details
				UserBankDetails::where('user_id', '=', $user->id)
								->update([ 'account_number' => Input::get('accountNumber') ]);
			} else { //create bank details
				$newBankDetails = new UserBankDetails;
				$newBankDetails->user_id = $user->id;
				$newBankDetails->account_number = Input::get('accountNumber');
				$newBankDetails->save();
			}
			return response()->json(true);
		} else {
			return response()->json(false);
		}
	}

	public function update_cars_monthly(Request $request) {
		list($fileType, $fileExt) = explode('/', Input::get('type'));
		$filename = md5(strftime(time())) . '.' . $fileExt;
		$image = Storage::disk('cars_update')->put($filename, base64_decode(Input::get('file')));
		$url = 'images/cars_update/'.$filename;
		$media = $this->save_media($filename, $request->user()->id, 1, $url);
		$user = $request->user();

		$userVehicleUpdate = new UserVehicleUpdate;
		$userVehicleUpdate->campaign_id = Input::get('campaignId');
		$userVehicleUpdate->user_id = $user->id;
		$userVehicleUpdate->client_id = Input::get('clientId');
		$userVehicleUpdate->media_id = $media->id;
		$userVehicleUpdate->created_at = Carbon::now()->format('Y-m-d H:i:s');
		$userVehicleUpdate->save();

		$userVehicleUpdate->url = $media->url;
		return response()->json($userVehicleUpdate);
	}

	public function update_request_pnumber(Request $request) {
		$user_vehicle_id = $request->uvid;
		$plate_number = $request->pnumber;
		$user = $request->user();

		$user_vehicle = UserVehicle::where('id', $user_vehicle_id)
		->where('user_id', $user->id)
		->first();

		if($user_vehicle) {
			$user_vehicle_request = new UserVehicleRequest;
			$user_vehicle_request->user_vehicle_id = $user_vehicle_id;
			$user_vehicle_request->plate_number = $plate_number;
			$user_vehicle_request->save();
	
			$client = Client::where('admin', 1)->first();
	
			if($client) {
				$firebase = FirebaseData::where('owner', '=', 1)
				->where('owner_id', '=', $client->id)
				->get();
	
				if(count($firebase) !== 0) {
					$this->clientSendNotification(
						[
							'receiverData' => $firebase, //receiver data
							'title' => $user->name,
							'body' => 'Plate number edit request'
						],
						$user
					);
				}
			}
	
			return response()->json([
				'status'  => true,
				'message' => 'Request for vehicle update sent'
			]);
		}
		
		return response()->json([
			'status'  => false,
			'message' => 'User unauthorized to change vehicle info'
		]);
	}

	public function update_vehicle_photo(Request $request) {
		$new_vehicle_photos = $request->new_vehicle_photos;
		$delete_vehicle_photos = $request->delete_vehicle_photos;
		$user_vehicle_id = $request->user_vehicle_id;
		$user = $request->user();

		$user_vehicle = UserVehicle::where('id', $user_vehicle_id)
		->where('user_id', $user->id)
		->first();

		if($user_vehicle) {
			$new_user_vehicle_photo = [];
			foreach($new_vehicle_photos as $key=>$v) {
				list($fileType, $fileExt) = explode('/', $v['type']);
				$filename = md5(strftime(time())) . $key . '.' . $fileExt;
				$image = Storage::disk('cars')->put($filename, base64_decode($v['data']));
				$url = 'images/cars/'.$filename;
				$media = $this->save_media($filename, $user->id, 1, $url);
				$user_vehicle_photo = new UserVehiclePhoto;
				$user_vehicle_photo->user_vehicle_id = $user_vehicle_id;
				$user_vehicle_photo->media_id = $media->id;
				$user_vehicle_photo->save();
				$new_user_vehicle_photo[] = $media;
			}

			if(count($delete_vehicle_photos) !== 0)
				UserVehiclePhoto::whereIn('media_id', $delete_vehicle_photos)->delete();

			return response()->json([
				'status'  => true,
				'message' => 'Editing photo successful',
				'data' => $new_user_vehicle_photo
			]);
		}
		
		return response()->json([
			'status'  => false,
			'message' => 'User unauthorized to change vehicle info'
		]);
	}

	public function remove_photo(Request $request) {
		$user = $request->user();
		$update = User::where('id', '=', $user->id)->update([ 'media_id' => 0 ]);
		$user = User::find($user->id);
		return response()->json([
			'imageResponse' => $update,
			'media' => (object)[
				'url' => '',
				'created_at' => $user->updated_at
			]
		]);
	}

	public function remove_license(Request $request) {
		$user = $request->user();
		$update = User::where('id', '=', $user->id)->update([ 'license_media_id' => 0 ]);
		$user = User::find($user->id);
		return response()->json([
			'imageResponse' => $update,
			'media' => (object)[
				'url' => '',
				'created_at' => $user->updated_at
			]
		]);
	}

	public function remove_account(Request $request) {
		if(Hash::check(Input::get('curPass'), $request->user()->password)) {
			$user = User::where('id', '=', $request->user()->id)
						->update([ 'deleted' => 1 ]);
			return response()->json($user);
		} else {
			return response()->json(false);
		}
	}

	public function verify_password(Request $request) {
		if(Hash::check(Input::get('password'), $request->user()->password)) {
			return response()->json(true);
		} else {
			return response()->json(false);
		}
	}

	public function get_all_vehicle(Request $request) {
		$vehicles = Vehicle::all();
		return response()->json($vehicles);
	}

	public function withdraw(Request $request) {
		$user = $request->user();
		$campaign_id = Input::get('campaignId');
		$amount = Input::get('amount');

		$user_withdrawal = new UserWithdrawal;
		$user_withdrawal->user_id = $user->id;
		$user_withdrawal->campaign_id = $campaign_id;
		$user_withdrawal->amount = $amount;
		$user_withdrawal->save();

		return response()->json(true);
	}

	public function create_vehicle(Request $request) {
		if(Input::get('newVehicle')) {
			$vehicle = new Vehicle;
			$vehicle->manufacturer = Input::get('newVehicle.manufacturer');
			$vehicle->model = Input::get('newVehicle.model');
			$vehicle->year = Input::get('newVehicle.year');
			$vehicle->classification = Input::get('newVehicle.class');
			$vehicle->save();
		}

		$user_vehicle = new UserVehicle;
		$user_vehicle->user_id = $request->user()->id;
		$user_vehicle->vehicle_id = Input::get('vehicleId') ? Input::get('vehicleId') : $vehicle->id;
		$user_vehicle->color = Input::get('uploadColor');
		$user_vehicle->plate_number = Input::get('plateNumber');
		$user_vehicle->type = Input::get('activeTypeVehicle');
		$user_vehicle->save();

		$new_user_vehicle = $user_vehicle;
		$new_user_vehicle->vehicle = Input::get('vehicleId') ? Vehicle::find(Input::get('vehicleId')) : $vehicle;
		$new_user_vehicle_photo = [];

		foreach(Input::get('vehicleToUpload') as $key=>$v) {
			list($fileType, $fileExt) = explode('/', $v['type']);
			$filename = md5(strftime(time())) . $key . '.' . $fileExt;
			$image = Storage::disk('cars')->put($filename, base64_decode($v['data']));
			$url = 'images/cars/'.$filename;
			$media = $this->save_media($filename, $request->user()->id, 1, $url);
			$user_vehicle_photo = new UserVehiclePhoto;
			$user_vehicle_photo->user_vehicle_id = $user_vehicle->id;
			$user_vehicle_photo->media_id = $media->id;
			$user_vehicle_photo->save();
			$new_user_vehicle_photo[] = $media;
		}

		$new_user_vehicle->photo = $new_user_vehicle_photo;
		return response()->json($new_user_vehicle);
	}

	public function notification_content(Request $request) {
		$user = $request->user();

		$chat = DB::table('client')
			->where('c.seen', '=', 0)
			->where('c.sender', '=', 1)
			->leftJoin(
				DB::raw('
					(
						SELECT c1.*
						FROM chat as c1
						INNER JOIN (
							SELECT client_id, max(created_at) as max_timestamp
							FROM chat
							WHERE user_id = '.$user->id.'
							GROUP BY client_id
						) as c2
						ON c1.client_id = c2.client_id
						AND c1.created_at = c2.max_timestamp
						ORDER BY created_at DESC
					) as c
				'), 'c.client_id', 'client.id'
			)
			->select(
				'client.id',
				'client.business_name as client',
				'c.created_at',
				'c.seen',
				DB::raw('1 as action')
			)
			->get()
			->toArray();
		if(count($chat) > 0) {
			$chatSeenUpdate = Chat::where('user_id', '=', $user->id)
				->where('seen', '=', 0)
				->where('sender', '=', 1)
				->update([ 'seen' => 1 ]);
		}

		$campaign = DB::table('client as c')
			->leftJoin('client_campaign as cc', 'cc.client_id', 'c.id')
			->leftJoin('user_campaign as uc', 'uc.campaign_id', 'cc.id')
			->where('uc.user_id', '=', $user->id)
			->where('uc.seen', '=', 0)
			->where('uc.request_status', '!=', 0)
			->select(
				'c.id',
				'c.business_name as client',
				'uc.request_status',
				'uc.created_at',
				'uc.seen',
				DB::raw('2 as action')
			)
			->get()
			->toArray();
		if(count($campaign) > 0) {
			$campaignSeenUpdated = UserCampaign::where('user_id', $user->id)
				->where('request_status', '!=', 0)
				->where('seen', '=', 0)
				->update([ 'seen' => 1 ]);
		}

		$payment = DB::table('client as c')
			->leftJoin('client_campaign as cc', 'cc.client_id', 'c.id')
			->leftJoin('user_withdrawal as uw', 'uw.campaign_id', 'cc.id')
			->where('uw.user_id', '=', $user->id)
			->where('uw.seen', '=', 0)
			->where('uw.status', '!=', 0)
			->select(
				'c.id',
				'c.business_name as client',
				'uw.status as request_status',
				'uw.created_at',
				'uw.seen',
				DB::raw('3 as action')
			)
			->get()
			->toArray();
		if(count($payment) > 0) {
			$paymentSeenUpdate = UserWithdrawal::where('user_id', $user->id)
				->where('status', '!=', 0)
				->where('seen', '=', 0)
				->update([ 'seen' => 1 ]);
		}

		$data = array_merge($chat, $campaign, $payment);
		usort($data, array($this, 'date_sort'));

		return response()->json([
			'notif' => $data
		]);
	}

	public function get_location(Request $request) {
		$locations = ClientCampaignLocation::whereIn('id', Input::get('id'))->get();
		return response()->json($locations);
	}

	private static function date_sort($a, $b) {
		return strtotime($a->created_at) - strtotime($b->created_at);
	}

	private function save_media($filename, $id, $owner, $url) {
		list($fName, $ext) = explode('.', $filename);
		$media = new Media;
		$media->owner_id = $id;
		$media->owner = $owner;
		$media->filename = $fName;
		$media->extension = $ext;
		$media->type = 0;
		$media->url = $url;
		$media->save();
		return $media;
	}

	private function chat_unseen_count($id) {
		return count(
			Chat::where('user_id', '=', $id)
			->select('client_id')
			->where('seen', '=', 0)
			->where('sender', '=', 1)
			->groupBy('client_id')
			->get()
		);
	}

	private function chat_unseen_update($id, $cid) {
		if($cid) {
			return Chat::where('user_id', $id)
			->where('client_id', $cid)
			->where('sender', '=', 1)
			->where('seen', '=', 0)
			->update(['seen' => 1]);
		} else {
			return Chat::where('user_id', $id)
			->where('sender', '=', 1)
			->where('seen', '=', 0)
			->update(['seen' => 1]);
		}
	}

	private function campaign_unseen_count($id) {
		return count(
			UserCampaign::where('user_id', '=', $id)
			->select('campaign_id')
			->where('seen', '=', 0)
			->where('request_status', '!=', 0)
			->groupBy('campaign_id')
			->get()
		);
	}
	
	private function campaign_unseen_update($id, $cid) {
		if($cid) {
			return UserCampaign::where('user_id', '=', $id)
			->where('campaign_id', '=', $cid)
			->where('seen', '=', 0)
			->where('request_status', '!=', 0)
			->update(['seen' => 1]);
		} else {
			return UserCampaign::where('user_id', '=', $id)
			->where('seen', '=', 0)
			->where('request_status', '!=', 0)
			->update(['seen' => 1]);
		}
	}

	private function payment_unseen_count($id) {
		return count(
			UserWithdrawal::where('user_id', '=', $id)
			->where('seen', '=', 0)
			->where('status', '!=', 0)
			->get()
		);
	}

	private function payment_unseen_update($id) {
		$payment = UserWithdrawal::where('user_id', '=', $id)
		->where('seen', '=', 0)
		->where('status', '!=', 0)
		->pluck('id')
		->toArray();
		return $payment;

		// return UserWithdrawal::whereIn('id', $payment_ids)
		// ->update(['seen' => 1]);
	}
}
