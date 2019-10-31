<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Notifications\ClientPasswordResetRequest;
use App\Client;
use App\PasswordReset;
use Hash;

class ClientPasswordResetController extends Controller
{
	/**
	 * Create token password reset
	 *
	 * @param  [string] email
	 * @return [string] message
	 */
	public function create(Request $request)
	{
		$request->validate([
			'email' => 'required|string|email',
		]);

		$user = Client::where('email', $request->email)->first();
		if(!$user) {
			return response()->json([
				'message' => "We can't find a user with that e-mail address."
			], 404);
		}

		$passwordReset = PasswordReset::updateOrCreate(
			[
				'email' => $user->email,
				'owner' => 1,
			],[
				'email' => $user->email,
				'owner' => 1, //1 for client, 0 for user
				'token' => str_random(60)
			]
		);
		if($user && $passwordReset) {
			$user->notify(
				new ClientPasswordResetRequest($passwordReset->token)
			);
		}

		return response()->json([
			'message' => 'We have e-mailed your password reset link!'
		]);
	}
	/**
	 * Find token password reset
	 *
	 * @param  [string] $token
	 * @return [string] message
	 * @return [json] passwordReset object
	 */
	public function find($token)
	{
		$passwordReset = PasswordReset::where([
			['token', $token],
			['owner', 1]
		])->first();

		if(!$passwordReset) {
			return response()->json([
				'message' => 'This password reset token is invalid.'
			], 404);
		}

		if(Carbon::parse($passwordReset->updated_at)->addMinutes(720)->isPast()) {
			$passwordReset->delete();
			return response()->json([
				'message' => 'This password reset token is invalid.'
			], 404);
		}

		return response()->json($passwordReset);
	}
		/**
	 * Reset password
	 *
	 * @param  [string] email
	 * @param  [string] password
	 * @param  [string] password_confirmation
	 * @param  [string] token
	 * @return [string] message
	 * @return [json] user object
	 */
	public function reset(Request $request)
	{
		$request->validate([
			'email' => 'required|string|email',
			'password' => 'required|string|confirmed',
			'token' => 'required|string'
		]);

		$passwordReset = PasswordReset::where([
			['token', $request->token],
			['email', $request->email],
			['owner', 1]
		])->first();
		if(!$passwordReset) {
			return response()->json([
				'message' => 'This password reset token is invalid.'
			], 404);
		}

		$user = Client::where('email', $passwordReset->email)->first();
		if (!$user) {
			return response()->json([
					'message' => "We can't find a user with that e-mail address."
			], 404);
		}

		$user->password = Hash::make($request->password);
		$user->save();

		$passwordReset->delete();

		return response()->json($user);
	}
}
