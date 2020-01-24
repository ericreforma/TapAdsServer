<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

// traits
use App\Traits\Firebase\FirebaseController;

use App\Client;
use App\ClientCampaign;
use App\ClientCampaignLocation;
use App\UserCampaign;
use App\UserTripMap;
use App\UserWithdrawal;
use App\FirebaseData;
use App\User;
use App\UserRating;
use App\UserVehicle;

use Carbon\Carbon;
use Hash;
use DB;

class ClientController extends Controller
{
	use FirebaseController;

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct() {
		$this->middleware('auth:web_api');
	}

	/**
	 * Show the application dashboard.
	 *
	 * @return \Illuminate\Contracts\Support\Renderable
	 */
	public function index() {
		return view('home');
	}

	public function details(Request $request) {
		$client = $request->user();

		return response()->json($client);
	}

	public function logout(Request $request, $unique_id) {
		$user = $request->user();
		$firebase = FirebaseData::where('owner', '=', 1)
		->where('owner_id', '=', $user->id)
		->where('unique_id' ,'=', $unique_id)
		->delete();

		$token = $request->user()->token();
		$token->revoke();

		$response = 'You have been succesfully logged out!';
		return response($response, 200);
	}

	public function getMyNotifications(Request $request) {
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

	public function campaignGetLiveMap(Request $request) {
		$client = $request->user();
		$campaign = ClientCampaign::find($request->campaign_id);

		$userTrips = UserTripMap::select('latitude','longitude')
											->get();
		return $userTrips;
	}

	public function push_notification(Request $request) {
		$user = $request->user();
		$uid = $request->user_id;
		$reset_page = $request->reset_page;
		$title =  $request->username ?  $user->business_name : $request->title;
		$body = $request->body;
		$args = $request->args;
		$second_body = $request->second_body;
		$page = $request->page;
		$user->url = $user->media->url;

		$firebase = FirebaseData::where('owner', '=', 0)
		->where('owner_id', '=', $uid)
		->get();

		if(count($firebase) !== 0) {
			$this->sendNotification(
				[
					'receiverData' => $firebase,
					'title' => $title,
					'body' => $body,
					'page' => $page,
					'name' => 'Custom',
					'args' => $args,
					'add_data' => [
						'reset' => $reset_page
					]
				],
				$user,
				false,
				$second_body
			);
		}

		return response()->json(true);
	}

	public function user_profile(Request $request, $id) {
		$userData = User::leftJoin('media as m', 'm.id', 'users.media_id')
		->where('users.id', '=', $id)
		->select(
			'users.*',
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
}
