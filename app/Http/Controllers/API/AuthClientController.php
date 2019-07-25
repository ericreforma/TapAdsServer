<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Client;
use App\Media;
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
			//return response()->json(['error' => 'UnAuthorised'], 401);
			return response()->json(['error' => 'UnAuthorised']);
		}
  }


  public function register (Request $request){
		$validator = Validator::make($request->all(),[
			'name' => 'required|string|max:255',
			'business_name' => 'required|string|max:255',
			'business_nature' => 'required|string|max:255',
			'email' => 'required|email|unique:client,email',
			'password' => 'required',
			'contact_number' => 'required|regex:/(09)[0-9]{9}/'
		]);

		if($validator->fails()){
			return response()->json(['errors'=>$validator->errors()],422);
		}

		$request['password']=Hash::make($request['password']);

		$media_id = 1;
		$user = Client::create([
			'name' => $request->name,
			'business_name' => $request->business_name,
			'business_nature' => $request->business_nature,
			'email' => $request->email,
			'password' => $request->password,
			'contact_number' => $request->contact_number,
			'media_id' => $media_id
		]);
		$token = $user->createToken('tapads')->accessToken;
		return response()->json(['token' => $token], 200);
  }
}
