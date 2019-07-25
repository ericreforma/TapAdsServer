<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use App\Client;
use App\Media;
use App\UserVehiclePhoto;
use App\Vehicle;
use App\UserCampaign;
use App\UserVehicle;
use App\UserRating;
use App\ClientCampaign;
use App\UserTrip;
use App\UserTripMap;
use App\UserCurrentLocation;

use DB;
use Carbon\Carbon;

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

  public function campaign_list(Request $request){
    $user = $request->user();

    $mycampaign = $user->campaigns;
    foreach ($mycampaign as $c) {
      $c->campaignDetails = ClientCampaign::find($c->campaign_id);
      $c->client = Client::find($c->campaignDetails->client_id);
      $c->trips = UserTrip::where('user_campaign_id',$c->id)->get();
    }

    return response()->json($mycampaign);
  }

  public function campaign_add(Request $request){

    $mycampaign = UserCampaign::where('campaign_id', $request->campaign_id)->count();

    if($mycampaign == 0){
      $user = $request->user();

      $userCampaign = new UserCampaign;
      $userCampaign->campaign_id = $request->campaign_id;
      $userCampaign->user_id = $user->id;
      $userCampaign->user_vehicle_id = $request->user_vehicle_id;
      $userCampaign->save();

      return response()->json(['status' => 'success', 'message' => 'added on list']);
    } else {

      return response()->json(['status' => 'error', 'message' => 'Already on list']);
    }
  }

  public function campaign_trip_update(Request $request){
    $myCampaign = UserCampaign::find($request->input('trip.user_campaign_id'));

    $myCampaign->campaign_traveled = $myCampaign->campaign_traveled + $request->input('trip.campaign_traveled');
    $myCampaign->trip_traveled = $myCampaign->trip_traveled + $request->input('trip.trip_traveled');
    $myCampaign->save();
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

  public function trip_create(Request $request){
    $user = $request->user();
    $userTrip = new UserTrip;
    $userTrip->campaign_id = $request->campaign_id;
    $userTrip->user_id = $user->id;
    $userTrip->user_campaign_id = $request->user_campaign_id;
    $userTrip->started = Carbon::now()->format('Y-m-d H:i:s');

    $userTrip->save();

    return response()->json(['status' => 'saved', 'trip' => $userTrip ]);
  }
  public function trip_end(Request $request){
    $trip_id = $request->input('trip.trip_id');

    $trip = UserTrip::find($trip_id);

    $trip->ended = Carbon::now()->format('Y-m-d H:i:s');
    $trip->campaign_traveled = $request->input('trip.campaign_traveled');
    $trip->trip_traveled = $request->input('trip.trip_traveled');
    $trip->location_start_address =$request->input('trip.location_start_address');
    $trip->location_start_long = $request->input('trip.location_start_longitude');
    $trip->location_start_lat = $request->input('trip.location_start_latitude');
    $trip->location_end_address =$request->input('trip.location_end_address');
    $trip->location_end_long = $request->input('trip.location_end_longitude');
    $trip->location_end_lat = $request->input('trip.location_end_latitude');
    $trip->save();

    $userCampaign = UserCampaign::find($request->input('trip.user_campaign_id'));
    $userCampaign->campaign_traveled = $userCampaign->campaign_traveled + $request->input('trip.campaign_traveled');
    $userCampaign->trip_traveled = $userCampaign->trip_traveled + $request->input('trip.trip_traveled');
    $userCampaign->save();
  }

  public function trip_map_add(Request $request){
    $tripmap = json_decode($request->trip_map, true);

    return $tripmap['user_id'];
    $userLocation = UserCurrentLocation::firstOrCreate(
      ['user_trip_id' => $tripmap['user_trip_id']],
      [
        'campaign_id' => $tripmap['campaign_id'],
        'user_id' => $tripmap['user_id'],
        'campaign_id' => $tripmap['campaign_id'],
        'user_campaign_id' => $tripmap['user_campaign_id'],
        'latitude' => $tripmap['latitude'],
        'longitude' => $tripmap['longitude'],
        'speed' => $tripmap['speed'],
        'timestamp' => Carbon::createFromTimestamp($tripmap['timestamp'])->format('Y-m-d H:i:s'),
      ]
    );

    $trip_map = new UserTripMap;
    $trip_map->user_trip_id = $tripmap['user_trip_id'];
    $trip_map->campaign_id = $tripmap['campaign_id'];
    $trip_map->user_id = $tripmap['user_id'];
    $trip_map->user_campaign_id = $tripmap['user_campaign_id'];
    $trip_map->client_id = $tripmap['client_id'];
    $trip_map->counted = $tripmap['counted'];
    $trip_map->latitude = $tripmap['latitude'];
    $trip_map->longitude = $tripmap['longitude'];
    $trip_map->distance = $tripmap['distance'];
    $trip_map->speed = $tripmap['speed'];

    $trip_map->save();
    return response()->json(1);
  }


}
