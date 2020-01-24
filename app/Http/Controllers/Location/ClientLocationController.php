<?php

namespace App\Http\Controllers\Location;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\ClientCampaign;
use App\UserCurrentLocation;

use DB;

class ClientLocationController extends Controller
{
	public function __construct() {
		$this->middleware('auth:web_api');
	}

	public function user_live_location(Request $request) {
    $user = $request->user();
    if($request->cid) {
			$campaign = ClientCampaign::find($request->cid);
			if($campaign) {
				$user_location = DB::table('user_current_location as ucl')
				->whereRaw('ucl.id IN (
					SELECT MAX(ucl1.id)
						FROM user_current_location AS ucl1
						GROUP BY ucl1.user_id
					)'
				)
				->leftJoin('users as u', 'u.id', 'ucl.user_id')
				->leftJoin('media as m', 'm.id', 'u.media_id')
				->leftJoin('client_campaign as cc', 'cc.id', 'ucl.campaign_id')
				->where('ucl.campaign_id', '=', $request->cid)
				->select(
					'ucl.*',
					'u.name as user_name',
					'cc.name as campaign_name',
					'm.url as user_photo'
				)
				->get();
			} else {
				return response()->json([
					'code' => 'cid not exist',
					'message' => 'Campaign ID does not exist'
				], 404);
			}
    } else {
			$user_location = DB::table('user_current_location as ucl')
			->whereRaw('ucl.id IN (
				SELECT MAX(ucl1.id)
					FROM user_current_location AS ucl1
					GROUP BY ucl1.user_id
				)'
			)
			->leftJoin('users as u', 'u.id', 'ucl.user_id')
			->leftJoin('media as m', 'm.id', 'u.media_id')
			->leftJoin('client_campaign as cc', 'cc.id', 'ucl.campaign_id')
			->select(
				'ucl.*',
				'u.name as user_name',
				'cc.name as campaign_name',
				'm.url as user_photo'
			)
			->get();
    }

		return response()->json($user_location);
	}
}
