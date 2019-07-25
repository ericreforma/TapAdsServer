<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\User;
use Hash;
use Carbon\Carbon;

class AuthUserController extends Controller
{
    public function __construct(){
      auth()->setDefaultDriver('api_auth');
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

      $data = json_decode($request->userData, true);
      $messages = [
        'required' => ':attribute',
      ];

      $validator = Validator::make($data,[
        'name' => 'required|string|max:255',
        'username' => 'required|string|max:100',
        'birthdate' => 'required|date',
        'location' => 'required',
        'email' => 'required|email',
        'password' => 'required',
        'contact_number' => 'required'
      ], $messages);

      if($validator->fails()){
        return response()->json($validator->errors()->all(), 400);
      }
      $data['email_verified_at'] = Carbon::now()->format('Y-m-d H:i:s');

      $data['password']=Hash::make($data['password']);
      $user = User::create($data);

      $token = $user->createToken('tapads')->accessToken;
      return response()->json(['token' => $token], 200);
    }
}
