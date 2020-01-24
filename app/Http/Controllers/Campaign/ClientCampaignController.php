<?php

namespace App\Http\Controllers\Campaign;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

// traits
use App\Traits\Firebase\FirebaseController;

use App\ClientCampaign;
use App\ClientCampaignLocation;
use App\UserCampaign;
use App\UserRating;
use App\UserVehicle;
use App\UserVehiclephoto;
use App\UserTrip;
use App\Media;
use App\Client;
use App\User;
use App\Vehicle;
use App\FirebaseData;

use Carbon\Carbon;

use DB;
use Storage;

class ClientCampaignController extends Controller
{
	use FirebaseController;

	public function __construct() {
		$this->middleware('auth:web_api');
	}

	public function campaign_list(Request $request) {
		$user = $request->user();
		$campaigns = $user->campaigns;
		foreach ($campaigns as $key => $value) {
			$campaign_location = ClientCampaignLocation::whereIn('id', $value->location_id)
			->select('name')
			->get()
			->toArray();
			$value->location = join(', ', $campaign_location[0]);
			$value->slots_remaining = $value->slots - UserCampaign::where('campaign_id', '=', $value->id)
			->where('request_status', '!=', 0)
			->count();
		}

		return response()->json($campaigns);
	}

	public function campaign_request(Request $request) {
		$user = $request->user();
		$campaigns = $user->campaign_request;
		foreach ($campaigns as $key => $value) {
			$value->vehicle_photos = UserVehicle::find($value->user_vehicle_id)->photos;
			$value->user_ratings = UserRating::where('user_id', '=', $value->user_id)->get();
		}

		return response()->json($campaigns);
	}

	public function campaign_store(Request $request) {
		$user = $request->user(); 

		$file_type = explode(';', $request->campaign_image)[0];
		$file_ext = explode('/', $file_type)[1];
		$filename = md5(strftime(time())) . '.' . $file_ext;
		$imageBase64 = explode('base64,', $request->campaign_image)[1];
		$image = Storage::disk('campaigns')->put($filename, base64_decode($imageBase64));
		$url = 'images/campaigns/'.$filename;
		$media = $this->save_media($filename, $user->id, 2, $url);
		
		$campaign = new ClientCampaign;
		$campaign->client_id = $user->id;
		$campaign->name = $request->name;
		$campaign->description = $request->description;
		$campaign->location = $request->location;
		$campaign->location_id = $request->location_id;
		$campaign->media_id = $media->id;
		$campaign->vehicle_classification = $request->vehicle_classification;
		$campaign->vehicle_type = $request->vehicle_type;
		$campaign->vehicle_stickerArea = $request->vehicle_stickerArea;
		$campaign->slots = $request->slots;
		$campaign->duration_from = $request->duration_from;
		$campaign->duration_to = $request->duration_to;
		$campaign->vehicle_update_date = $request->vehicle_update_date;
		$campaign->pay_basic = $request->pay_basic;
		$campaign->pay_basic_km = $request->pay_basic_km;
		$campaign->completion_bonus = $request->completion_bonus;
		$campaign->save();

		if($campaign) {
			return response()->json([
				'status' => 'success',
				'message' => 'Campaign saved!'
			]);
		} else {
			return response()->json([
				'status' => 'error',
				'message' => 'Saving campaign failed'
			]);
		}
	}

	public function campaign_dashboard(Request $request, $id) {
		$user = $request->user();
		$campaign = $user->client_campaign($id);

		if($campaign) {
			$campaign->users = $user->user_campaign($id);
			$campaign->location = ClientCampaignLocation::whereIn('id', $campaign->location_id)->get();
			foreach($campaign->users as $u) {
				$u->ratings = UserRating::where('user_id', '=', $u->user_id)->get();
			}
			
			$users = DB::table('user_campaign as uc')
			->leftJoin('users as u', 'u.id', 'uc.user_id')
			->leftJoin('media as m', 'm.id', 'u.media_id')
			->leftJoin(
				DB::raw('
					(
						SELECT
							SUM(amount) as amount,
							user_id
						FROM user_withdrawal
						GROUP BY user_id
					) as uw
				'), 'uw.user_id', 'uc.user_id'
			)
			->where('uc.client_id', $user->id)
			->where('uc.request_status', '=', 1)
			->where('uc.campaign_id', $id)
			->select(
				'u.id',
				'u.name',
				'u.username',
				'm.url',
				DB::raw('ifnull(uw.amount, 0) as amount'),
				DB::raw('SUM(campaign_traveled) as campaign_traveled'),
				DB::raw('SUM(trip_traveled) as trip_traveled')
			)
			->groupBy(
				'u.id',
				'u.name',
				'u.username',
				'm.url',
				'uw.amount'
			)
			->get();

			return response()->json([
				'campaign' => $campaign,
				'users' => $users
			]);
		} else {
			return response()->json([
				'status' => 'error',
				'message' => 'Campaign id does not exist'
			], 404);
		}
	}

	public function campaign_graph(Request $request) {
		$user = $request->user();
		$date_from = $request->date_from;
		$date_to = $request->date_to;
		$cid = $request->cid;

		$data = DB::table('user_trip as ut')
		->leftJoin('client_campaign as cc', 'cc.id', 'ut.campaign_id')
		->where('cc.client_id', $user->id)
		->whereDate('ut.started', '>=', $date_from)
		->whereDate('ut.started', '>=', $date_from)
		->where('ut.started', '<=', $date_to)
		->where('cc.id', '=', $cid)
		->whereNotNull('ut.ended')
		->select(
			'ut.started',
			'ut.campaign_traveled',
			'ut.trip_traveled'
		)
		->get();

		return response()->json($data);
	}

	public function getMyCampaigns (Request $request) {
		$client_id = $request->user()->id;
		$mycampaigns = ClientCampaign::where('client_id','=',$client_id)
									->leftJoin('media as m','m.id','client_campaign.media_id')
									// ->leftJoin('user_campaign as uc','uc.campaign_id','client_campaign.id')
									->select(
										'm.url as campaign_image',
										'client_campaign.vehicle_classification',
										DB::raw('(CASE client_campaign.vehicle_type 
										WHEN 0 THEN "Private" 
										WHEN 1 THEN "Public"
										ELSE "Mixed"
										END) AS vehicle_type
										'),
										'client_campaign.pay_basic',
										'client_campaign.pay_basic_km',
										'client_campaign.pay_additional',
										'client_campaign.pay_additional_km',
										'client_campaign.id',
										'client_campaign.location_id',
										//  DB::raw('(SELECT JSON_ARRAY(client_campaign.location_id)) AS location_ids'),
										'client_campaign.name as campaign_name',
										'client_campaign.created_at as created_at',
										'client_campaign.slots as slots_total',
										DB::raw("(SELECT COUNT(*) FROM user_campaign WHERE client_campaign.id = user_campaign.campaign_id) as slots_used")
									)
									->get();
		$location_ids = array();
		foreach($mycampaigns as $mc){
			$location_ids = array_unique(array_merge($location_ids , $mc->location_id));
		}								
		$locations = ClientCampaignLocation::whereIn('id',$location_ids)->select('name as location_name','id as location_index')->get()->toArray();
		$mycampaigns = $mycampaigns->toArray();
		$arr_response = array('campaigns'=> $mycampaigns ,'locations'=>$locations);
		return response()->json($arr_response);
	}

	public function getMyCampaignRequests(Request $request) {
		$client_id = $request->user()->id;
		$requests = DB::table('client_campaign as cc')
			->join(
			'user_campaign as uc', function($join) use ($client_id){
				$join->on('uc.campaign_id','=','cc.id')
				->where('cc.client_id','=',$client_id);
			})
			->leftJoin('users as user','user.id','=','uc.user_id')
			->select(
				'user.name as user_name',
				DB::raw('
					(
						CASE uc.request_status 
						WHEN 0 THEN "Pending"
						WHEN 1 THEN "Approved"
						WHEN 2 THEN "Rejected"
						ELSE "Invalid"
						END
					) as status'
				),
				'uc.user_id as user_id',
				'cc.name as campaign_name',
				'cc.id as campaign_id',
				'uc.created_at as timestamp',
				DB::raw("(SELECT url FROM media WHERE cc.media_id = media.id) as campaign_image"),
				DB::raw("(SELECT url FROM media WHERE user.media_id = media.id) as user_image")
			)
			->orderBy('timestamp','DESC')
			->get();

		return response()->json($requests);
	}

	public function campaign_request_update(Request $request) {
		$uid = $request->user_id;
		$campaign_name = $request->campaign_name;
		$status = $request->status;
		$user_campaign_id = $request->user_campaign_id;
		$campaign_id = $request->campaign_id;

		$user = $request->user();
		$user->url = $user->media->url;

		$campaign_count = UserCampaign::where('end', '=', 0)
		->where('request_status', '=', 1)
		->where('campaign_id', '=', $campaign_id)
		->count();

		$campaign = ClientCampaign::find($campaign_id);

		if($campaign) {
			if($campaign->slots > $campaign_count || $status === 2) {
				$UserCampaignUpdate = UserCampaign::find($user_campaign_id)
				->update([
					'request_status' => $status,
					'seen' => 0,
					'request_status_updated' => Carbon::now()->format('Y-m-d H:i:s')
				]);
	
				$firebase = FirebaseData::where('owner', '=', 0)
				->where('owner_id', '=', $uid)
				->get();
	
				if(count($firebase) !== 0) {
					$message = $status === 1 ? 'accepted' : 'rejected';
					$this->sendNotification(
						[
							'receiverData' => $firebase,
							'title' => $user->business_name,
							'body' => $campaign_name,
							'name' => 'Campaign',
							'page' => 'MyCampaign'
						],
						$user,
						$status,
						'campaign request '.$message
					);
				}
	
				return response()->json([
					'status' => true,
					'message' => 'Request Status Updated'
				]);
			}
			
			return response()->json([
				'status' => false,
				'message' => 'Campaign slot is full'
			]);
		}
		
		return response()->json([
			'status' => false,
			'message' => 'Campaign does not exist'
		]);
	}

	public function campaign_user_data_update(Request $request) {
		$user = $request->user();
		$data = $request->formData;
		$cid = $request->cid;

		foreach($data as $d) {
			$campaign = UserCampaign::where('id', $d['user_campaign_id'])
			->update([ $d['column_name'] => $d['value'] ]);
			
			$campaign->location = ClientCampaignLocation::whereIn('id', $campaign->location_id)->get();
			foreach($campaign->users as $u) {
				$u->ratings = UserRating::where('user_id', '=', $u->user_id)->get();
			}
		}
		
		$users = $user->user_campaign($cid);
		return response()->json($users);
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
}
