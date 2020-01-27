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

use Carbon\Carbon;
use DB;

class UserCampaignController extends Controller
{
	public function __construct() {
		$this->middleware('auth:api');
	}
    
	public function browse(Request $request) {
		$user = $request->user();
		$registered_campaigns = $user->registered_campaigns;
		if($request->rec){
			$userVehicles = $user->vehicles();
			$vehicleIds = array_unique($userVehicles->pluck('vehicle_id')->all());
			$type = array_unique($userVehicles->pluck('type')->all());
			$classification = Vehicle::whereIn('id', $vehicleIds)->pluck('classification');

			$campaigns = ClientCampaign::leftJoin(
				DB::raw(
					'(
						SELECT count(*) as slots_used, campaign_id
							FROM user_campaign
							WHERE request_status = 1
							AND end = 0
							GROUP BY campaign_id
					) as uc'
				), 'uc.campaign_id', 'client_campaign.id'
			)
			->leftJoin('media as m', 'm.id', 'client_campaign.media_id')
			->whereIn('client_campaign.vehicle_classification', $classification)
			->whereIn('client_campaign.vehicle_type', $type)
			->whereRaw(
				'client_campaign.slots > (
					SELECT
						IFNULL(count(*), 0)
					FROM user_campaign as uc
					WHERE request_status = 1
					AND end = 0
					AND uc.campaign_id = client_campaign.id
				)'
			)
			->whereNotIn('client_campaign.id', $registered_campaigns->pluck('campaign_id')->all())
			->where('client_campaign.duration_from', '<=', Carbon::today())
			->where('client_campaign.duration_to', '>=', Carbon::today())
			->select(
				'client_campaign.*',
				'm.url as photo',
				DB::raw('IFNULL(uc.slots_used, 0) as slots_used')
			)
			->inRandomOrder()
			->limit(5)
			->get();

			if(count($campaigns) === 0) {
				$campaigns = ClientCampaign::leftJoin(
					DB::raw(
						'(
							SELECT count(*) as slots_used, campaign_id
								FROM user_campaign
								WHERE request_status = 1
								AND end = 0
								GROUP BY campaign_id
						) as uc'
					), 'uc.campaign_id', 'client_campaign.id'
				)
				->leftJoin('media as m', 'm.id', 'client_campaign.media_id')
				->whereRaw(
					'client_campaign.slots > (
						SELECT
							IFNULL(count(*), 0)
						FROM user_campaign as uc
						WHERE request_status = 1
						AND end = 0
						AND uc.campaign_id = client_campaign.id
					)'
				)
				->whereNotIn('client_campaign.id', $registered_campaigns->pluck('campaign_id')->all())
				->where('client_campaign.duration_from', '<=', Carbon::today())
				->where('client_campaign.duration_to', '>=', Carbon::today())
				->select(
					'client_campaign.*',
					'm.url as photo',
					DB::raw('IFNULL(uc.slots_used, 0) as slots_used')
				)
				->inRandomOrder()
				->limit(5)
				->get();
			}
		} else {
			$campaigns = ClientCampaign::leftJoin(
				DB::raw(
					'(
						SELECT count(*) as slots_used, campaign_id
							FROM user_campaign
							WHERE request_status = 1
							AND end = 0
							GROUP BY campaign_id
					) as uc'
				), 'uc.campaign_id', 'client_campaign.id'
			)
			->leftJoin('media as m', 'm.id', 'client_campaign.media_id')
			->where('client_campaign.vehicle_classification', $request->cl)
			->whereRaw(
				'client_campaign.slots > (
					SELECT
						IFNULL(count(*), 0)
					FROM user_campaign as uc
					WHERE request_status = 1
					AND end = 0
					AND uc.campaign_id = client_campaign.id
				)'
			)
			->whereNotIn('client_campaign.id', $registered_campaigns->pluck('campaign_id')->all())
			->where('client_campaign.duration_from', '<=', Carbon::today())
			->where('client_campaign.duration_to', '>=', Carbon::today())
			->select(
				'client_campaign.*',
				'm.url as photo',
				DB::raw('IFNULL(uc.slots_used, 0) as slots_used')
			)
			->latest()
			->paginate(4);
		}

		foreach ($campaigns as $key=>$c) {
			$c->client = Client::find($c->client_id);

			$location = ClientCampaignLocation::whereIn('id', $c->location_id)->get();
			if(count($location) !== 0) {
				$c->location = implode(', ', $location->pluck('name')->all());
			}
		}

		return response()->json($campaigns);
	}

	public function recommendedPage(Request $request) {
		$user = $request->user();
		$userVehicles = $user->vehicles();
		$vehicleIds = array_unique($userVehicles->pluck('vehicle_id')->all());
		$type = array_unique($userVehicles->pluck('type')->all());
		$classification = Vehicle::whereIn('id', $vehicleIds)->pluck('classification');
		$registered_campaigns = $user->registered_campaigns;

		$campaigns = ClientCampaign::leftJoin(
			DB::raw(
				'(
					SELECT count(*) as slots_used, campaign_id
						FROM user_campaign
						WHERE request_status = 1
						AND end = 0
						GROUP BY campaign_id
				) as uc'
			), 'uc.campaign_id', 'client_campaign.id'
		)
		->leftJoin('media as m', 'm.id', 'client_campaign.media_id')
		->whereIn('client_campaign.vehicle_classification', $classification)
		->whereIn('client_campaign.vehicle_type', $type)
		->whereRaw(
			'client_campaign.slots > (
				SELECT
					IFNULL(count(*), 0)
				FROM user_campaign as uc
				WHERE request_status = 1
				AND end = 0
				AND uc.campaign_id = client_campaign.id
			)'
		)
		->whereNotIn('client_campaign.id', $registered_campaigns->pluck('campaign_id')->all())
		->where('client_campaign.duration_from', '<=', Carbon::today())
		->where('client_campaign.duration_to', '>=', Carbon::today())
		->select(
			'client_campaign.*',
			'm.url as photo',
			DB::raw('IFNULL(uc.slots_used, 0) as slots_used')
		)
		->paginate(7);

		if(count($campaigns) === 0) {
			$campaigns = ClientCampaign::leftJoin(
				DB::raw(
					'(
						SELECT count(*) as slots_used, campaign_id
							FROM user_campaign
							WHERE request_status = 1
							AND end = 0
							GROUP BY campaign_id
					) as uc'
				), 'uc.campaign_id', 'client_campaign.id'
			)
			->leftJoin('media as m', 'm.id', 'client_campaign.media_id')
			->whereRaw(
				'client_campaign.slots > (
					SELECT
						IFNULL(count(*), 0)
					FROM user_campaign as uc
					WHERE request_status = 1
					AND end = 0
					AND uc.campaign_id = client_campaign.id
				)'
			)
			->whereNotIn('client_campaign.id', $registered_campaigns->pluck('campaign_id')->all())
			->where('client_campaign.duration_from', '<=', Carbon::today())
			->where('client_campaign.duration_to', '>=', Carbon::today())
			->select(
				'client_campaign.*',
				'm.url as photo',
				DB::raw('IFNULL(uc.slots_used, 0) as slots_used')
			)
			->inRandomOrder()
			->paginate(7);
		}

		foreach($campaigns as $key=>$c) {
			$c->client = Client::find($c->client_id);

			$location = ClientCampaignLocation::whereIn('id', $c->location_id)->get();
			if(count($location) !== 0) {
				$c->location = implode(', ', $location->pluck('name')->all());
			}
		}

		return response()->json($campaigns);
	}
}
