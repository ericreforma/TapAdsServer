<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Client;
use Hash;

class ClientController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:web_api');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('home');
    }

    public function details(Request $request){
      $client = $request->user();

      return response()->json($client);
    }

    
    public function logout (Request $request) {

      $token = $request->user()->token();
      $token->revoke();

      $response = 'You have been succesfully logged out!';
      return response($response, 200);
    }


}
