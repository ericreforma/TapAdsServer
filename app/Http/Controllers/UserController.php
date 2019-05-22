<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use stdClass;
class UserController extends Controller
{
  /**
     * Create a new controller instance.
     *
     * @return void
     */
  public function __construct()  {
      $this->middleware('auth:api');
  }

  public function logout (Request $request) {

    $token = $request->user()->token();
    $token->revoke();

    $response = 'You have been succesfully logged out!';
    return response($response, 200);
  }

  public function details(Request $request){

      $user = $request->user();
      $user->ratings;
      // $user->vehicles;
      //
      // foreach($user->vehicles as $v){
      //   $v->photos;
      // };

      return response()->json($user);
  }


}
