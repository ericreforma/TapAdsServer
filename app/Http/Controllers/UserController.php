<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use App\Client;
use App\Media;
use App\UserVehiclePhoto;
use App\Vehicle;
use App\UserCampaign;
use App\UserRating;
use App\ClientCampaign;

class UserController extends Controller
{
  /**
     * Create a new controller instance.
     *
     * @return void
     */

  // public function __construct()  {
  //     $this->middleware('auth:api');
  // }

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
    $rating->client_id = 3; // change this to current user ID
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
}
