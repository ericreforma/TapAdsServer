<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Client;
use App\ClientCampaign;
use App\ClientCampaignLocation;
use App\UserCampaign;
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
				->where('user_campaign.status','=',0)
				->where('user_campaign.seen','=',0);
			})->join('users as user','user.id','=','user_campaign.user_id')
			->select('user.name as user_name','user_campaign.status as status','client_campaign.name as campaign_name','client_campaign.id as campaign_id','user_campaign.created_at as timestamp')
			->orderBy('timestamp','DESC')
			->get();
		// foreach($notifs as $nt){
		// 	switch($nt->status){
		// 		case 0:
		// 			$nt->status = "pending";
		// 		break;
		// 		case 1:
		// 			$nt->status = "approved";
		// 		break;
		// 		case 2:
		// 			$nt->status = "rejected";
		// 		break;
		// 		default:
		// 			$nt->status = "invalid";
		// 		break;
		// 	}
		// }
		// dd($interested_notifs);
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
}
