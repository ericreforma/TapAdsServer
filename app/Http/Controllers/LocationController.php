<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\ClientCampaignLocation;

class LocationController extends Controller
{
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
}
