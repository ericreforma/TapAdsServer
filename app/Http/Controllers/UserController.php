<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use App\Client;
use App\Chat;
use App\Media;
use App\UserVehiclePhoto;
use App\Vehicle;
use App\UserCampaign;
use App\UserVehicle;
use App\UserRating;
use App\UserTrip;
use App\UserTripMap;
use App\ClientCampaign;
use DB;

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

      $v->vehicle = Vehicle::where('id',$v->vehicle_id)->get();
      $v->photo = Media::whereIn('id',$vehicle_photo_id)->get();
    };

    $user_media = Media::where('id', $request->user()->media_id)->first();
    $user->profilePicture = $user_media ? $user_media->url : null;

    return response()->json($user);
  }

  public function getMyCampaigns(Request $request){
    $user = $request->user();

    $mycampaign = $user->campaigns;
    foreach ($mycampaign as $c) {
      $c->campaignDetails = ClientCampaign::find($c->campaign_id);
      $c->client = Client::find($c->campaignDetails->client_id);
    }

    return response()->json($mycampaign);
  }

  public function addMyCampaigns(Request $request){

    $mycampaign = UserCampaign::where('campaign_id', $request->campaign_id)->count();

    if($mycampaign == 0){
      $user = $request->user();

      $userCampaign = new UserCampaign;
      $userCampaign->campaign_id = $request->campaign_id;
      $userCampaign->user_id = $user->id;
      $userCampaign->user_vehicle_id = $request->user_vehicle_id;
      $userCampaign->distance_traveled = 0;
      $userCampaign->completed = 0;
      $userCampaign->favorite = 0;
      $userCampaign->save();

      return response()->json(['status' => 'success', 'message' => 'added on list']);
    } else {

      return response()->json(['status' => 'error', 'message' => 'Already on list']);
    }
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
          'userData' 			=> $userData,
					'userCampaigns' => $userCampaigns,
					'userRating' 		=> $userRating,
					'userVehicle'		=> $userVehicle
        ]
      ]);
    } else {
      return response()->json([
        'status'  => 'error',
        'message' => 'Error occured! Try again later.'
      ]);
    }
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

  public function getUserTrip(Request $request, $cid, $uid) {
    $user_trip = UserTrip::where('campaign_id', '=', $cid)
                        ->where('user_id', '=', $uid)
                        ->get();
    $user_trip_map = UserTripMap::whereIn('user_trip_id', $user_trip->pluck('id')->all())->get();

    return response()->json([
      'status'  => 'success',
      'message' => [
        'userTrip'    => $user_trip,
        'userTripMap' => $user_trip_map
      ]
    ]);
  }
}
