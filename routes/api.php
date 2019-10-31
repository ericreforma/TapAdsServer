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
    Route::post('register/validation', 'API\AuthUserController@register_validation')->name('user_register_validation');
    Route::post('register', 'API\AuthUserController@register')->name('user_register');
    Route::get('checkPing', 'API\NetworkController@checkPing');
    Route::get('vehicle/all', 'API\VehicleDatabaseController@get_all_vehicle');

    Route::prefix('password')->group(function() {
      Route::post('create', 'UserPasswordResetController@create');
      Route::get('find/{token}', 'UserPasswordResetController@find');
      Route::post('reset', 'UserPasswordResetController@reset');
    });

    Route::middleware('auth:api')->group(function(){
      // USER details
      Route::get('/', 'UserController@details');
      Route::get('logout', 'UserController@logout')->name('user_logout');

      Route::prefix('campaign')->group(function(){
        // My campaigns
        Route::get('list','UserController@campaign_list');
        Route::post('add','UserController@campaign_add');

        // favorite
        Route::get('favorite/{cid}', 'UserController@campaign_favorite');

        // Campaigns
        Route::get('browse','ClientCampaignController@browse');
        Route::get('recommended','ClientCampaignController@recommendedPage');

        Route::prefix('trip')->group(function(){
          // Trip
          Route::post('add', 'UserController@trip_create');
          Route::post('map', 'UserController@trip_map_add');
          Route::post('end', 'UserController@trip_end');
          Route::get('info/{tid}', 'UserController@trip_info');
        });

        // location
        Route::post('location', 'UserController@get_location');

        Route::get('earnings/history', 'UserController@earnings_history');

      });

      // chat
      Route::prefix('chat')->group(function(){
        Route::get('list', 'UserChatController@getChatList');
        Route::get('{cid}', 'UserChatController@getMessages');
      });

      // update
      Route::prefix('update')->group(function(){
        Route::post('details', 'UserController@update_details');
        Route::post('photo', 'UserController@update_photo');
        Route::post('license', 'UserController@update_license');
        Route::post('password', 'UserController@update_password');
        Route::post('bank', 'UserController@update_bank_details');
        Route::post('cars/monthly', 'UserController@update_cars_monthly');
      });

      // remove
      Route::prefix('remove')->group(function(){
        Route::get('photo', 'UserController@remove_photo');
        Route::get('license', 'UserController@remove_license');
        Route::post('account', 'UserController@remove_account');
      });

      // create
      Route::prefix('create')->group(function() {
        Route::post('vehicle', 'UserController@create_vehicle');
      });
      
      // notification
      Route::get('notif/content', 'UserController@notification_content');

      // websocket
      Route::prefix('websocket')->group(function() {
        Route::get('checkAuth', 'Websocket\UserWebsocketController@check_auth');
      });

      // messages
      Route::prefix('message')->group(function() {
        Route::post('save', 'UserChatController@save_message');
      });

      // verify password
      Route::post('password/verify', 'UserController@verify_password');

      Route::post('payment/withdraw', 'UserController@withdraw');
    });

  });

  // CLIENT
  Route::prefix('client')->group(function(){

      Route::get('home', 'API\AuthClientController@index');
      Route::post('/login', 'API\AuthClientController@login');
      Route::post('/register', 'API\AuthClientController@register');

      Route::prefix('password')->group(function() {
        Route::post('create', 'ClientPasswordResetController@create');
        Route::get('find/{token}', 'ClientPasswordResetController@find');
        Route::post('reset', 'ClientPasswordResetController@reset');
      });

      Route::middleware('auth:web_api')->group(function(){

        Route::get('/','ClientController@details');
        Route::get('/campaigns','ClientCampaignController@getMyCampaigns'); // >>>> campaign list
        Route::get('/campaigns/requests','ClientCampaignController@getMyCampaignRequests'); // >>>> campaign list
        Route::post('/campaigns/requests','ClientCampaignController@UserStatusCampaignUpdate'); // >>>> campaign request update
        Route::get('logout', 'UserController@logout')->name('user_logout');

        Route::prefix('campaign')->group(function() {
          Route::post('create', 'ClientCampaignController@campaign_store'); // >>>> create campaign
          Route::get('dashboard/{id}', 'ClientCampaignController@campaign_show'); // >>>> campaign details for dashboard
          Route::post('new/geolocation', 'LocationController@geo_location_new'); // >>>> create custom geo location
          Route::get('geolocation', 'LocationController@geo_location_get'); // >>>> get all geo location
          Route::get('location/data', 'LocationController@for_location_data'); // >>>> get all geo location
        });
        
        Route::get('user/chats', 'ClientChatController@getUsersChat');
        Route::get('user/convo/{id}', 'ClientChatController@getUsersConvo');
        Route::post('user/rating', 'UserController@submitUserRating');
        Route::get('user/{id}/profile', 'UserController@viewProfile');
        Route::post('user/trip', 'UserController@getUserTrip');
        Route::get('chat/notif/update/{id}', 'ClientChatController@updateNotif');
        Route::get('chat/usersList', 'ClientChatController@getUserList');

        Route::prefix('websocket')->group(function() {
          Route::get('getClientData', 'ClientController@websocketClientData');
          Route::post('message/sent', 'ClientChatController@websocketMessageSent');
        });

        //Notifications
        Route::get('/notifications', 'ClientController@getMyNotifications'); // >>>> get unseen user campaign status
      });

  });
});
