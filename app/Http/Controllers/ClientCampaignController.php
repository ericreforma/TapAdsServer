<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\ClientCampaign;
use App\ClientCampaignLocation;
use App\UserCampaign;
use App\UserRating;
use App\Media;
use App\Client;
use App\User;
use DB;

class ClientCampaignController extends Controller
{
	public function __construct() {
		$this->middleware('auth:api');
	}

	public function campaigns(Request $request){
		if($request->rec){
			$campaigns = ClientCampaign::inRandomOrder()->limit(5)->get();
		} else {
			$campaigns = ClientCampaign::
			where('vehicle_classification',$request->cl)
			->latest()
			->paginate(4);
		}

		foreach ($campaigns as $c) {
			$c->slots_used = 0;
			$c->photo = Media::where('id',$c->media_id)
			->select('url')
			->get()
			->toArray();

			$c->client = Client::where('id',$c->client_id)
			->get()
			->toArray();
		}

		return response()->json($campaigns);
	}

	public function campaign_store(Request $request){
		$campaign = new ClientCampaign;
		$campaign->client_id = $request->user()->id;
		$campaign->name = $request->name;
		$campaign->description = $request->description;
		$campaign->location_id = $request->location_id;
		$campaign->vehicle_classification = $request->vehicle_classification;
		$campaign->vehicle_type = $request->vehicle_type;
		$campaign->vehicle_stickerArea = $request->vehicle_stickerArea;
		$campaign->slots = $request->slots;
		$campaign->pay_basic = $request->pay_basic;
		$campaign->pay_basic_km = $request->pay_basic_km;
		$campaign->pay_additional = $request->pay_additional;
		$campaign->pay_additional_km = $request->pay_additional_km;
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
	
	public function campaign_show(Request $request, $id) {
		$campaign = ClientCampaign::where('client_campaign.id', '=', $id)
															->leftJoin('media as m', 'm.id', 'client_campaign.media_id')
															->select('client_campaign.*', 'm.url')
															->first();

		if($campaign) {
			$userData = UserCampaign::where('campaign_id', '=', $id)
									->leftJoin('users as u', 'u.id', 'user_campaign.user_id')
									->leftJoin('media as m', 'm.id', 'u.media_id')
									->select(
										'user_campaign.*',
										'u.name',
										'u.username',
										'u.media_id',
										'u.birthdate',
										'u.contact_number',
										'u.location',
										'u.email',
										'm.url'
									)
									->get();

			$userRating = UserRating::whereIn('user_id', $userData->pluck('user_id')->all())
									->where('client_id', '=', $request->user()->id)
									->get();

			$geoLocation = ClientCampaignLocation::whereIn('id', $campaign->location_id)->get();

			return response()->json([
				'status' => 'success',
				'message' => [
					'campaign' => $campaign,
					'userData' => $userData,
					'totalUser' => User::count(),
					'geoLocation' => $geoLocation,
					'userRating' => $userRating
				]
			]);
		} else {
			return response()->json([
				'status' => 'error',
				'message' => 'Campaign id does not exist'
			]);
		}
	}

	public function getMyCampaigns (Request $request){
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

	public function getMyCampaignRequests(Request $request){
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
						CASE uc.status 
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
				'uc.updated_at as timestamp',
				DB::raw("(SELECT url FROM media WHERE cc.media_id = media.id) as campaign_image"),
				DB::raw("(SELECT url FROM media WHERE user.media_id = media.id) as user_image")
			)
			->orderBy('timestamp','DESC')
			->get();

		return response()->json($requests);
	}
	public function UserStatusCampaignUpdate(Request $request){
		$uid = $request->user_id;
		$cid = $request->campaign_id;
		$status = $request->status;
		try {
		$UserCampaignUpdate = UserCampaign::where('user_id',$uid)
		->where('campaign_id',$cid)
		->update(['status'=>$status]);
		}catch (\Illuminate\Database\QueryException $e) {
			return response()->json([
				'status' => 'error',
				'message' => 'There is an error updating request status, Please try again.'
			]);
		}
		return response()->json([
			'status' => 'success',
			'message' => 'Request Status Updated'
		]);
	}
}
