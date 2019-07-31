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

	public function getMyCampaigns (Request $request){
		$client_id = $request->user()->id;

		// DB::table('client_campaign')->where('client_campaign.client_id',$client_id)
		// ->join('client_campaign_location', 'client_campaign.location_id', '=', 'friends.friend_id');

		$mycampaigns = ClientCampaign::where('client_id',$client_id)
		// ->select('name','created_at','location','slots')
		->get();

		foreach($mycampaigns as $mc){
			switch($mc->vehicle_type){
				case 0:
					$mc->vehicle_type = 'Private';
				break;
				case 1:
					$mc->vehicle_type = 'Public';
				break;
				case 2:
					$mc->vehicle_type = 'Mixed';
				break;
				default:
					$mc->vehicle_type = 'Mixed';
				break;
			}
			$location="";
			$loc_arr = $mc->location_id;
			foreach ($loc_arr as $locid) {
				$mc->location_id=$locid;
				$loc = ClientCampaignLocation::where('id',$locid)->select('name')->first();
				$location .= $loc->name." , ";
			}
			$location = rtrim(trim($location), ',');
			$mc->location_id=$location;
			$slots_avail = UserCampaign::where('campaign_id',$mc->id)->count();
			$mc->slots = $slots_avail." of ".$mc->slots;
		}
		$mycampaigns->toArray();
		return response()->json($mycampaigns);
	}
	
    public function websocketClientData(Request $request) {
        $returnData = (object)[
            'id' => $request->user()->id
        ];

        return response()->json($returnData);
    }

}
