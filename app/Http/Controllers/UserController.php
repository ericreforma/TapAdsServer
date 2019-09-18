<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use App\Client;
use App\Chat;
use App\Media;
use App\Vehicle;
use App\UserVehiclePhoto;
use App\UserVehicle;
use App\UserCampaign;
use App\UserRating;
use App\UserTrip;
use App\UserTripMap;
use App\ClientCampaign;
use App\UserCurrentLocation;

use Input;
use Storage;
use Hash;

use DB;
use Carbon\Carbon;

class UserController extends Controller
{
	/**
		 * Create a new controller instance.
		 *
		 * @return void
		 */

	public function __construct()  {
		$this->middleware('auth:api');
	}

	public function logout (Request $request) {

		$token = $request->user()->token();
		$token->revoke();

		$response = 'You have been succesfully logged out!';
		return response($response, 200);
	}

	public function details(Request $request){
		$media = [];
		$user = $request->user();
		$ratings = $user->ratings;

		foreach($user->vehicles as $v){
			$vehicle_photo_id = UserVehiclePhoto::
				where('user_vehicle_id',$v->id)
				->select('media_id')
				->get()
				->toArray();

			$v->vehicle = Vehicle::where('id',$v->vehicle_id)->first();
			$v->photo = Media::whereIn('id',$vehicle_photo_id)->get();
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
		$user->notificationCount = $this->chat_notification_count($user->id) + $this->campaign_notification_count($user->id);
		return response()->json($user);
	}

	public function campaign_list(Request $request){
		$user = $request->user();

		$mycampaign = $user->campaigns;
		foreach ($mycampaign as $c) {
			$c->campaignDetails = ClientCampaign::find($c->campaign_id);
			$c->client = Client::find($c->campaignDetails->client_id);
			$c->trips = UserTrip::where('user_campaign_id',$c->id)->get();
		}

		return response()->json($mycampaign);
	}

	public function campaign_add(Request $request){

		$mycampaign = UserCampaign::where('campaign_id', $request->campaign_id)->count();

		if($mycampaign == 0){
			$user = $request->user();

			$userCampaign = new UserCampaign;
			$userCampaign->campaign_id = $request->campaign_id;
			$userCampaign->user_id = $user->id;
			$userCampaign->user_vehicle_id = $request->user_vehicle_id;
			$userCampaign->save();

			return response()->json(['status' => 'success', 'message' => 'added on list']);
		} else {
			return response()->json(['status' => 'error', 'message' => 'Already on list']);
		}
	}

	public function campaign_trip_update(Request $request){
		$myCampaign = UserCampaign::find($request->input('trip.user_campaign_id'));

		$myCampaign->campaign_traveled = $myCampaign->campaign_traveled + $request->input('trip.campaign_traveled');
		$myCampaign->trip_traveled = $myCampaign->trip_traveled + $request->input('trip.trip_traveled');
		$myCampaign->save();
	}

	public function addToFavorites(Request $request){

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

		$trip = UserTrip::find($trip_id);

		$trip->ended = Carbon::now()->format('Y-m-d H:i:s');
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
		$userCampaign->campaign_traveled = $userCampaign->campaign_traveled + $request->input('trip.campaign_traveled');
		$userCampaign->trip_traveled = $userCampaign->trip_traveled + $request->input('trip.trip_traveled');
		$userCampaign->save();
	}

	public function trip_map_add(Request $request){
		$tripmap = json_decode($request->trip_map, true);

		return $tripmap['user_id'];
		$userLocation = UserCurrentLocation::firstOrCreate(
			['user_trip_id' => $tripmap['user_trip_id']],
			[
				'campaign_id' => $tripmap['campaign_id'],
				'user_id' => $tripmap['user_id'],
				'campaign_id' => $tripmap['campaign_id'],
				'user_campaign_id' => $tripmap['user_campaign_id'],
				'latitude' => $tripmap['latitude'],
				'longitude' => $tripmap['longitude'],
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

	public function websocketUserData(Request $request) {
		$returnData = (object)[
			'id' => $request->user()->id
		];
		return response()->json($returnData);
	}

	public function websocketMessageSent(Request $request) {
		$chat = new Chat;
		$chat->user_id = $request->user()->id;
		$chat->client_id = $request->uid;
		$chat->message = $request->message;
		$chat->type = $request->type;
		$chat->sender = 0;
		$chat->save();
		$chat = Chat::find($chat->id);

		return response()->json([
			'status' => 'success',
			'message' => [
				'chat' => $chat
			]
		]);
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

	public function get_all_vehicle(Request $request) {
		$vehicles = Vehicle::all();
		return response()->json($vehicles);
	}

	public function create_vehicle(Request $request) {
		$user_vehicle = new UserVehicle;
		$user_vehicle->user_id = $request->user()->id;
		$user_vehicle->vehicle_id = Input::get('vehicleId');
		$user_vehicle->color = Input::get('uploadColor');
		$user_vehicle->type = Input::get('activeTypeVehicle');
		$user_vehicle->save();

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
		}

		return response()->json(true);
	}

	public function notification_content(Request $request) {
		$user = $request->user();
		$notification_content = DB::table('client')
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
												WHERE user_id = '.$request->user()->id.'
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
									DB::raw('1 as action')
								)
								->get()
								->toArray();
		$campaign = DB::table('client as c')
					->leftJoin('client_campaign as cc', 'cc.client_id', 'c.id')
					->leftJoin('user_campaign as uc', 'uc.campaign_id', 'cc.id')
					->where('uc.user_id', '=', $request->user()->id)
					->where('uc.seen', '=', 0)
					->where('uc.request_status', '!=', 0)
					->select(
						'c.id',
						'c.business_name as client',
						'uc.request_status',
						'uc.created_at',
						DB::raw('2 as action')
					)
					->get()
					->toArray();
		$payment = [];
		$data = array_merge($notification_content, $campaign, $payment);
		usort($data, array($this, 'date_sort'));
		return response()->json($data);
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

	private function chat_notification_count($id) {
		return count(
			Chat::where('user_id', '=', $id)
				->select('client_id')
				->where('seen', '=', 0)
				->where('sender', '=', 1)
				->groupBy('client_id')
				->get()
		);
	}

	private function campaign_notification_count($id) {
		return count(
			UserCampaign::where('user_id', '=', $id)
						->select('campaign_id')
						->where('seen', '=', 0)
						->where('request_status', '!=', 0)
						->groupBy('campaign_id')
						->get()
		);
	}
}
