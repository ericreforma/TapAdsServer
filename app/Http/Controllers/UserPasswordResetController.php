<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Notifications\UserPasswordResetRequest;
use App\User;
use App\PasswordReset;
use Hash;

class UserPasswordResetController extends Controller
{
	/**
	 * Create token password reset
	 *
	 * @param  [string] email
	 * @return [string] message
	 */
	public function create(Request $request) {
		$request->validate([
			'email' => 'required|string|email',
		]);

		$user = User::where('email', $request->email)->first();
		if(!$user) {
			return response()->json([
				'message' => "We can't find a user with that e-mail address."
			], 404);
		}

		$code = $this->get_random_char(6);
		$passwordReset = PasswordReset::updateOrCreate(
			[
				'email' => $user->email,
				'owner' => 0,
			],[
				'email' => $user->email,
				'owner' => 0, //1 for client, 0 for user
				'token' => $code
			]
		);
		if($user && $passwordReset) {
			$user->notify(
				new UserPasswordResetRequest($passwordReset->token)
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
	public function find($token, $email) {
		$passwordReset = PasswordReset::whereRaw("BINARY token = '$token'")
		->where('owner', '=', 0)
		->where('email', '=', $email)
		->first();

		if(!$passwordReset) {
			return response()->json([
				'message' => 'The code you entered is invalid.'
			], 404);
		}

		if(Carbon::parse($passwordReset->updated_at)->addMinutes(720)->isPast()) {
			$passwordReset->delete();
			return response()->json([
				'message' => 'The code you entered is invalid.'
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
	public function reset(Request $request) {
		$request->validate([
			'email' => 'required|string|email',
			'password' => 'required|string|confirmed',
			'token' => 'required|string'
		]);

		$passwordReset = PasswordReset::where([
			['token', $request->token],
			['email', $request->email],
			['owner', 0]
		])->first();
		if(!$passwordReset) {
			return response()->json([
				'message' => 'This password reset token is invalid.'
			], 404);
		}

		$user = User::where('email', $passwordReset->email)->first();
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

	private function get_random_char($random_string_length) {
		$characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		$string = '';
		$max = strlen($characters) - 1;
		for ($i = 0; $i < $random_string_length; $i++) {
			$string .= $characters[random_int(0, $max)];
		}
		return $string;
	}
}
