<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\UserCampaign;
use App\ClientCampaign;
use App\User;
use App\UserTrip;
use DB;

class DashboardController extends Controller
{
	public function __construct() {
		$this->middleware('auth:web_api');
	}
    
  public function dashboard_data(Request $request) {
		$user = $request->user();

		$users = DB::table('user_campaign as uc')
		->leftJoin('users as u', 'u.id', 'uc.user_id')
		->leftJoin('media as m', 'm.id', 'u.media_id')
		->leftJoin(
			DB::raw('
				(
					SELECT
						SUM(amount) as amount,
						user_id
					FROM user_withdrawal
					GROUP BY user_id
				) as uw
			'), 'uw.user_id', 'uc.user_id'
		)
		->where('uc.client_id', $user->id)
		->where('uc.request_status', '=', 1)
		->select(
			'u.id',
			'u.name',
			'u.username',
			'm.url',
			DB::raw('ifnull(uw.amount, 0) as amount'),
			DB::raw('SUM(uc.campaign_traveled) as campaign_traveled'),
			DB::raw('SUM(uc.trip_traveled) as trip_traveled')
		)
		->groupBy(
			'u.id',
			'u.name',
			'u.username',
			'm.url',
			'uw.amount'
		)
		->orderBy('campaign_traveled', 'DESC')
		->get();

		$return_value = (object)[
			'client' => $user,
			'users' => $users
		];

		return response()->json($return_value);
	}

	public function dashboard_graph(Request $request) {
		$user = $request->user();
		$date_from = $request->date_from;
		$date_to = $request->date_to;

		$data = DB::table('user_trip as ut')
		->leftJoin('client_campaign as cc', 'cc.id', 'ut.campaign_id')
		->where('cc.client_id', $user->id)
		->whereDate('ut.started', '>=', $date_from)
		->whereDate('ut.started', '>=', $date_from)
		->where('ut.started', '<=', $date_to)
		->whereNotNull('ut.ended')
		->select(
			'ut.started',
			'ut.campaign_traveled',
			'ut.trip_traveled'
		)
		->get();

		return response()->json($data);
	}
}
