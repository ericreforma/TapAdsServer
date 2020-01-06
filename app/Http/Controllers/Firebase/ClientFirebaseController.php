<?php

namespace App\Http\Controllers\Firebase;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\FirebaseData;

class ClientFirebaseController extends Controller
{
	public function __construct() {
		$this->middleware('auth:web_api');
	}

	public function updateToken(Request $request) {
		$user = $request->user();
		$firebaseData = FirebaseData::updateOrCreate(
			[
				'owner' => 1,
				'owner_id' => $user->id,
				'unique_id' => $request->uniqueId
			],[
				'token' => $request->token
			]
		);

		if($firebaseData) {
			return response()->json($firebaseData);
		} else {
			return response()->json(["message" => "server error"], 500);
		}
	}

	public function getToken(Request $request) {
		$user = $request->user();
	}
}
