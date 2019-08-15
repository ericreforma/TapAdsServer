<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\ClientCampaignLocation;

use App\User;
use App\ClientCampaign;
use App\UserTrip;
use App\UserTripMap;
use App\UserCampaign;
use DB;

class LocationController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware('auth');
    }
    
    public function geo_location_new(Request $request) {
        $validate = ClientCampaignLocation::where('name', '=', $request->name)->first();

        if($validate) {
            return response()->json([
                'status' => 'error',
                'message' => 'Geo location name already exists'
            ]);
        } else {
            $new_location = new ClientCampaignLocation;
            $new_location->name = $request->name;
            $new_location->json_coordinates = $request->coordinates;
            $new_location->save();
    
            return response()->json([
                'status' => 'success',
                'message' => [
                    'message' => 'Geo Location Created Successfully',
                    'geo_location' => $new_location
                ]
            ]);
        }
    }

    public function geo_location_get(Request $request) {
        $geo_location = ClientCampaignLocation::all();
        return response()->json([
            'status' => 'success',
            'message' => [
                'geo_location' => $geo_location
            ]
        ]);
    }

    public function for_location_data(Request $request) {
        $campaigns = ClientCampaign::where('client_id', '=', $request->user()->id)->get();
        $campaignIDs = $campaigns->pluck('id')->all();
        $users = DB::table('user_campaign as uc')
                ->leftJoin('users as u', 'u.id', 'uc.user_id')
                ->leftJoin('media as m', 'm.id', 'u.media_id')
                ->whereIn('uc.campaign_id', $campaignIDs)
                ->select(
                    'u.*',
                    'm.url',
                    'uc.campaign_id',
                    'uc.distance_traveled'
                )
                ->orderBy('u.id', 'ASC')
                ->get();
        $locationIDs = $campaigns->pluck('location_id')->all();
        $mergedLIDs = array_unique(array_merge(...$locationIDs));
        $campaignLocations = ClientCampaignLocation::whereIn('id', $mergedLIDs)->get();

        return response()->json([
            'status'  => 'success',
            'message' => [
                'campaigns'    => $campaigns,
                'users'        => $users,
                'geoLocations' => $campaignLocations
            ]
        ]);
    }
}
