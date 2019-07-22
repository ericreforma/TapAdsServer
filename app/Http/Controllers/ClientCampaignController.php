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

	public function browse(Request $request){
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
}
