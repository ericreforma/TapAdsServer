<?php

namespace App\Http\Controllers\Campaign;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\ClientCampaign;
use App\ClientCampaignLocation;
use App\UserCampaign;
use App\Media;
use App\Client;
use App\Vehicle;

class UserCampaignController extends Controller
{
	public function __construct() {
		$this->middleware('auth:api');
    }
    
	public function browse(Request $request){
		$user = $request->user();
		$registered_campaigns = $user->registered_campaigns;
		if($request->rec){
			$userVehicles = $user->vehicles;
			$vehicleIds = array_unique($userVehicles->pluck('vehicle_id')->all());
			$type = array_unique($userVehicles->pluck('type')->all());
			$classification = Vehicle::whereIn('id', $vehicleIds)->pluck('classification');

			$campaigns = ClientCampaign::
			whereIn('vehicle_classification', $classification)
			->whereIn('vehicle_type', $type)
			->whereNotIn('id', $registered_campaigns->pluck('campaign_id')->all())
			->inRandomOrder()
			->limit(5)
			->get();

			if(count($campaigns) === 0) {
				$campaigns = ClientCampaign::
				whereNotIn('id', $registered_campaigns->pluck('campaign_id')->all())
				->inRandomOrder()
				->limit(5)
				->get();
			} 
		} else {
			$campaigns = ClientCampaign::
			where('vehicle_classification',$request->cl)
			->whereNotIn('id', $registered_campaigns->pluck('campaign_id')->all())
			->latest()
			->paginate(4);
		}

		foreach ($campaigns as $key=>$c) {
			$slots_used = UserCampaign::
			where('campaign_id', $c->id)
			->where('request_status', 1)
			->where('end', 0)
			->count();
			
			if($slots_used < $c->slots) {
				$c->slots_used = $slots_used;
	
				$media = Media::find($c->media_id);
				$c->photo = $media ? $media->url : null;
	
				$c->client = Client::find($c->client_id);
	
				$location = ClientCampaignLocation::whereIn('id', $c->location_id)->get();
				if(count($location) !== 0) {
					$c->location = implode(', ', $location->pluck('name')->all());
				}
			} else {
				unset($campaigns[$key]);
			}
		}

		return response()->json($campaigns);
	}

	public function recommendedPage(Request $request) {
		$user = $request->user();
		$userVehicles = $user->vehicles;
		$vehicleIds = array_unique($userVehicles->pluck('vehicle_id')->all());
		$type = array_unique($userVehicles->pluck('type')->all());
		$classification = Vehicle::whereIn('id', $vehicleIds)->pluck('classification');
		$registered_campaigns = $user->registered_campaigns;

		$campaigns = ClientCampaign::
		whereIn('vehicle_classification', $classification)
		->whereIn('vehicle_type', $type)
		->whereNotIn('id', $registered_campaigns->pluck('campaign_id')->all())
		->paginate(7);

		if(count($campaigns) === 0) {
			$campaigns = ClientCampaign::
			whereNotIn('id', $registered_campaigns->pluck('campaign_id')->all())
			->inRandomOrder()
			->paginate(7);
		}

		foreach($campaigns as $key=>$c) {
			$slots_used = UserCampaign::
			where('campaign_id', $c->id)
			->where('request_status', 1)
			->where('end', 0)
			->count();

			if($slots_used < $c->slots) {
				$c->slots_used = $slots_used;
	
				$media = Media::find($c->media_id);
				$c->photo = $media ? $media->url : null;
	
				$c->client = Client::find($c->client_id);
	
				$location = ClientCampaignLocation::whereIn('id', $c->location_id)->get();
				if(count($location) !== 0) {
					$c->location = implode(', ', $location->pluck('name')->all());
				}
			} else {
				unset($campaigns[$key]);
			}
		}

		return response()->json($campaigns);
	}
}
