<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\ClientCampaign;
use App\UserCampaign;
use App\Media;
use App\Client;
use DB;

class ClientCampaignController extends Controller
{
    // public function __construct() {
    //   	$this->middleware('auth:api');
    // }

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
		$campaign->client_id = 1; // >>>>>>>>>> change this to user id
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
	
	public function campaign_show($id) {
		$campaign = ClientCampaign::find($id);

		if($campaign) {
			$userData = UserCampaign::where('campaign_id', '=', $id)->get();

			return response()->json([
				'status' => 'success',
				'message' => [
					'campaign' => $campaign,
					'userData' => $userData
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
