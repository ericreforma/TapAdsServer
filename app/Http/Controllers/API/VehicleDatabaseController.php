<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Vehicle;

class VehicleDatabaseController extends Controller
{
    //
    public function get_all_vehicle() {
		$vehicles = Vehicle::all();
		return response()->json($vehicles);
    }
}
