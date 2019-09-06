<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Client;
use App\ClientCampaign;
use App\ClientCampaignLocation;
use App\UserCampaign;
use App\UserTripMap;
use Carbon\Carbon;
use Hash;
use DB;

class ClientController extends Controller
{
	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('auth:web_api');
	}

	/**
	 * Show the application dashboard.
	 *
	 * @return \Illuminate\Contracts\Support\Renderable
	 */
	public function index()
	{
		return view('home');
	}

	public function details(Request $request){
		$client = $request->user();

		return response()->json($client);
	}

	public function logout (Request $request) {

		$token = $request->user()->token();
		$token->revoke();

		$response = 'You have been succesfully logged out!';
		return response($response, 200);
	}

	public function getMyNotifications (Request $request){
		$client_id = $request->user()->id;

		$notifs = DB::table('client_campaign')
			->join('user_campaign', function($join) use ($client_id){
				$join->on('user_campaign.campaign_id','=','client_campaign.id')
				->where('client_campaign.client_id','=',$client_id)
				->where('user_campaign.request_status','=',0)
				->where('user_campaign.seen','=',0);
			})->join('users as user','user.id','=','user_campaign.user_id')
			->leftJoin('media as m', 'm.id', 'user.media_id')
			->select(
				'user.name as user_name',
				'user_campaign.request_status as status',
				'client_campaign.name as campaign_name',
				'client_campaign.id as campaign_id',
				'user_campaign.created_at as timestamp',
				'm.url as profile_picture'
			)
			->orderBy('timestamp','DESC')
			->get();
			
		//media ids
		$notifs->toArray();
		return response()->json($notifs);
	}

    public function websocketClientData(Request $request) {
        $returnData = (object)[
            'id' => $request->user()->id
		];
		
		return response()->json($returnData);
	}

	public function campaignGetLiveMap(Request $request){
		$client = $request->user();
		$campaign = ClientCampaign::find($request->campaign_id);

		$userTrips = UserTripMap::select('latitude','longitude')
											->get();
		return $userTrips;
	}



}
