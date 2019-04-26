<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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

    public function logout (Request $request) {

      $token = $request->user()->token();
      $token->revoke();

      $response = 'You have been succesfully logged out!';
      return response($response, 200);

    }

    public function register (Request $request){


    }
}
