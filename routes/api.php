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

  // USER
  Route::prefix('user')->group(function(){


    Route::post('login', 'API\AuthUserController@login')->name('user_login');
    Route::post('register', 'API\AuthUserController@register')->name('user_register');

    Route::middleware('auth:api')->group(function(){
      // USER details
      Route::get('/', 'UserController@details');
      Route::get('logout', 'UserController@logout')->name('user_logout');

      // My campaigns
      Route::get('/campaign/list','UserController@campaign_list');
      Route::post('/campaign/add','UserController@campaign_add');
      // Campaigns
      Route::get('/campaign/browse','ClientCampaignController@browse');

      // Trip
      Route::post('/campaign/trip/add','UserController@trip_create');
      Route::post('/campaign/trip/map','UserController@trip_map_add');
      Route::post('/campaign/trip/end', 'UserController@trip_end');

    });

  });

  // CLIENT
  Route::prefix('client')->group(function(){

      Route::get('home', 'API\AuthClientController@index');
      Route::post('/login', 'API\AuthClientController@login');
      Route::post('/register', 'API\AuthClientController@register');

      Route::middleware('auth:web_api')->group(function(){

        Route::get('/','ClientController@details');
        Route::get('/campaigns','ClientController@getMyCampaigns');
        Route::get('logout', 'UserController@logout')->name('user_logout');

        Route::post('campaign/create', 'ClientCampaignController@campaign_store'); // >>>> create campaign
        Route::get('campaign/dashboard/{id}', 'ClientCampaignController@campaign_show'); // >>>> campaign details for dashboard

        Route::post('campaign/new/geolocation', 'LocationController@geo_location_new');
        Route::get('campaign/geolocation', 'LocationController@geo_location_get');
        Route::post('user/rating', 'UserController@submitUserRating');
        Route::get('user/{id}/profile', 'UserController@viewProfile');

        Route::get('campaign/getLiveLocation/{campaign_id}', 'ClientController@campaignGetLiveMap');

      });
  });
});
