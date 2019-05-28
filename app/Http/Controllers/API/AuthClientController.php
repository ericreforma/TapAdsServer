<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Client;
use Hash;

class AuthClientController extends Controller
{
	public function __construct(){
		auth()->setDefaultDriver('web');
	}

	public function index(){
		return redirect('/login');
		//return response()->json(['account_needed' => 'login'], 401);
	}

    public function login(Request $request){

		$credentials = [
			'email' => $request->email,
			'password' => $request->password
		];

		if (auth()->attempt($credentials)) {
			$token = auth()->user()->createToken('tapads')->accessToken;
			return response()->json(['token' => $token], 200);
		} else {
			return response()->json(['error' => 'UnAuthorised'], 401);
		}
    }

    
    public function register (Request $request){
		$validator = Validator::make($request->all(),[
			'name' => 'required|string|max:255',
			'business_name' => 'required|string|max:255',
			'business_nature' => 'required|string|max:255',
			'email' => 'required|email',
			'password' => 'required',
			'contact_number' => 'required'
		]);

		if($validator->fails()){
			return response()->json($validator->errors()->all(), 400);
		}

		$request['password']=Hash::make($request['password']);
		$user = Client::create($request->toArray());

		$token = $user->createToken('tapads')->accessToken;
		return response()->json(['token' => $token], 200);
    }
}
