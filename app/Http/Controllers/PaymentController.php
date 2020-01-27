<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Traits\Firebase\FirebaseController;

use App\ClientCampaign;
use App\UserWithdrawal;
use App\FirebaseData;
use App\ClientCampaignLocation;
use App\UserTrip;

use Carbon\Carbon;
use Hash;
use DB;

class PaymentController extends Controller
{
	use FirebaseController;

	public function __construct() {
		$this->middleware('auth:web_api');
	}

	public function payment_users(Request $request, $cid) {
		$user = $request->user();
		$campaign = $user->client_campaign($cid);
		$campaign->location = ClientCampaignLocation::whereIn('id', $campaign->location_id)->get();
		$users = $user->user_campaign_approved($cid);

		$return_value = (object)[
			'campaign' => $campaign,
			'users' => $users
		];

		return response()->json($return_value);
	}

	public function payment_user_data(Request $request) {
		$user = $request->user();
		$campaign = ClientCampaign::find($request->cid);
		list($date_from, $date_to) = explode('/', $request->date);

		$user_trip = UserTrip::where('campaign_id', $request->cid)
		->whereNotNull('ended')
		->where('started', '>=', $date_from)
		->where('started', '<=', $date_to)
		->select(
			'user_id as id',
			DB::raw('(
				'.$campaign->pay_basic_km.' - SUM(campaign_traveled)
			) as remaining_distance'),
			DB::raw('SUM(campaign_traveled) as campaign_traveled'),
			DB::raw('SUM(trip_traveled) as trip_traveled')
		)
		->groupBy('user_id')
		->get();

		foreach($user_trip as $ut) {
			$ut->amount_paid = UserWithdrawal::
			where('campaign_id', $campaign->id)
			->where('user_id', $ut->id)
			->where('date_from', '>=', $date_from)
			->where('date_to', '<=', $date_to)
			->whereNull('bonus')
			->sum('amount');
		}
		
		return response()->json($user_trip);
	}

	public function payment_user_update(Request $request) {
		$cid = $request->cid;
		$users = $request->users;
		$amount = $request->amount;
		$bonus = $request->bonus;
		list($date_from, $date_to) = explode('/', $request->date);
		$row_data = array(
			'user_id' => 0,
			'campaign_id' => $cid,
			'amount' => $amount,
			'date_from' => $date_from,
			'date_to' => $date_to,
			'bonus' => $bonus ? 1 : null,
			'status' => 1,
			'seen' => 0,
		);
		$user = $request->user();
		$user->url = $user->media->url;

		$campaign = ClientCampaign::where('client_id', '=', $user->id)
		->where('id', '=', $cid)
		->first();

		if($campaign) {
			$data_to_send = [];
			foreach($users as $u) {
				$row_data['user_id'] = $u;
				$data_to_send[] = $row_data;
			}
			UserWithdrawal::insert($data_to_send);

			$firebase = FirebaseData::where('owner', '=', 0)
			->whereIn('owner_id', '=', $users)
			->get();

			if(count($firebase) !== 0) {
				$message = $status === 1 ? 'accepted' : 'rejected';
				$this->sendNotification(
					[
						'receiverData' => $firebase,
						'title' => $user->business_name,
						'body' => $campaign->name,
						'page' => 'Profile',
						'name' => 'Payment'
					],
					$user,
					$status,
					'withdrawal request '.$message
				);
			}
			
			return response()->json(true);
		} else {
			return response()->json(['message' => 'unauthorized'], 401);
		}
	}
}
