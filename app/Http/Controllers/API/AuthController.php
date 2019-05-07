<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\User;
use Hash;

class AuthController extends Controller
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
      $validator = Validator::make($request->all(),[
        'name' => 'required|string|max:255',
        'username' => 'required|string|max:100',
        'birthdate' => 'required|date',
        'location' => 'required',
        'email' => 'required|email',
        'password' => 'required',
        'contact_number' => 'required'
      ]);

      if($validator->fails()){
        return response()->json($validator->errors()->all(), 400);
      }

      $request['password']=Hash::make($request['password']);
      $user = User::create($request->toArray());

      $token = $user->createToken('tapads')->accessToken;
      return response()->json(['token' => $token], 200);
    }
}
