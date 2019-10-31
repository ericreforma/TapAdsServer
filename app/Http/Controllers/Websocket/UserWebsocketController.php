<?php

namespace App\Http\Controllers\Websocket;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use Carbon\Carbon;
use Input;
use DB;

class UserWebsocketController extends Controller
{
	public function __construct()  {
		$this->middleware('auth:api');
	}
	
	public function check_auth(Request $request) {
		$user = $request->user();
		return response()->json($user);
	}
}
