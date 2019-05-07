<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('json.response')->group(function(){

  Route::post('login', 'API\AuthController@login');
  Route::post('register', 'API\AuthController@register');

  Route::middleware('auth:api')->prefix('user')->group(function(){
    // USER details
    Route::get('/', 'UserController@details');
    Route::get('logout', 'UserController@logout');

    
  });

});
