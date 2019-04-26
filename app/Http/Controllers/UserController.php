<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;

class UserController extends Controller
{
  /**
     * Create a new controller instance.
     *
     * @return void
     */
  public function __construct()
  {
      $this->middleware('auth:api');
  }
  public function details(Request $request){
      return response()->json($request->user());
  }
}