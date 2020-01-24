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
      Route::get('find/{token}/{email}', 'UserPasswordResetController@find');
      Route::post('reset', 'UserPasswordResetController@reset');
    });

    Route::middleware('auth:api')->group(function(){
      // USER details
      Route::get('/', 'UserController@details');
      Route::get('logout/{unique_id}', 'UserController@logout')->name('user_logout');

      // My campaigns
      Route::prefix('campaign')->group(function(){
        Route::get('list','UserController@campaign_list');
        Route::post('add','UserController@campaign_add');

        // favorite
        Route::get('favorite/{cid}', 'UserController@campaign_favorite');

        // Campaigns
        Route::get('browse','Campaign\UserCampaignController@browse');
        Route::get('recommended','Campaign\UserCampaignController@recommendedPage');

        // Trip
        Route::prefix('trip')->group(function(){
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
        Route::get('list', 'Chat\UserChatController@get_list');
        Route::get('initial', 'Chat\UserChatController@get_messages');
        Route::get('paginate', 'Chat\UserChatController@get_paginate_messages');
        Route::get('latest', 'Chat\UserChatController@get_latest_messages');
      });

      // update
      Route::prefix('update')->group(function(){
        Route::post('details', 'UserController@update_details');
        Route::post('photo', 'UserController@update_photo');
        Route::post('license', 'UserController@update_license');
        Route::post('password', 'UserController@update_password');
        Route::post('bank', 'UserController@update_bank_details');
        Route::post('cars/monthly', 'UserController@update_cars_monthly');
        Route::post('notifications', 'UserController@update_notification');
        Route::post('vehicle_photo', 'UserController@update_vehicle_photo');
        Route::post('request/pnumber', 'UserController@update_request_pnumber');
      });

      // get
      Route::prefix('get')->group(function() {
        Route::get('notifications', 'UserController@get_notification');
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

      // messages
      Route::prefix('message')->group(function() {
        Route::post('save', 'Chat\UserChatController@save_message');
      });

      Route::prefix('firebase')->group(function() {
        Route::post('update', 'Firebase\UserFirebaseController@updateToken');
        Route::post('getToken', 'Firebase\UserFirebaseController@getToken');
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
      Route::get('/', 'ClientController@details');
      Route::get('logout/{unique_id}', 'ClientController@logout');

      //Dashboard
      Route::prefix('dashboard')->group(function() {
        Route::get('/', 'DashboardController@dashboard_data');
        Route::post('graph', 'DashboardController@dashboard_graph');
      });

      //Campaigns
      Route::prefix('campaigns')->group(function() {
        Route::get('/', 'Campaign\ClientCampaignController@getMyCampaigns'); // >>>> campaign list
        Route::get('requests', 'Campaign\ClientCampaignController@getMyCampaignRequests'); // >>>> campaign list
        Route::post('requests', 'Campaign\ClientCampaignController@campaign_request_update'); // >>>> campaign request update
      });

      //Users
      Route::prefix('user')->group(function() {
        Route::get('chats', 'Chat\ClientChatController@getUsersChat');
        Route::post('rating', 'UserController@submitUserRating');
        Route::get('{id}/profile', 'ClientController@user_profile');
        Route::post('trip', 'UserController@getUserTrip');

        //Location
        Route::prefix('location')->group(function() {
          Route::get('live', 'Location\ClientLocationController@user_live_location');
        });
      });

      //Chats
      Route::prefix('chat')->group(function() {
        Route::get('notif/update/{id}', 'Chat\ClientChatController@updateNotif');
        Route::get('usersList', 'Chat\ClientChatController@getUserList');
      });

      //Campaign
      Route::prefix('campaign')->group(function() {
        Route::get('list', 'Campaign\ClientCampaignController@campaign_list');
        Route::post('create', 'Campaign\ClientCampaignController@campaign_store'); // >>>> create campaign
        Route::get('dashboard/{id}', 'Campaign\ClientCampaignController@campaign_dashboard'); // >>>> campaign details for dashboard
        Route::post('graph', 'Campaign\ClientCampaignController@campaign_graph');

        //Campaign-Location
        Route::post('new/geolocation', 'LocationController@geo_location_new'); // >>>> create custom geo location
        Route::get('geolocation', 'LocationController@geo_location_get'); // >>>> get all geo location
        Route::get('location/data', 'LocationController@for_location_data'); // >>>> get all geo location

        //Campaign-requests-update
        Route::prefix('request')->group(function() {
          Route::get('/', 'Campaign\ClientCampaignController@campaign_request');
          Route::post('update', 'Campaign\ClientCampaignController@campaign_request_update'); // >>>> campaign request update
        });

        //User Data edit
        Route::prefix('user')->group(function() {
          Route::post('update', 'Campaign\ClientCampaignController@campaign_user_data_update');
          Route::get('{cid}', 'Campaign\ClientCampaignController@campaign_users');
        });
      });

      //Message
      Route::prefix('message')->group(function() {
        Route::get('list', 'Chat\ClientChatController@message_list');
        Route::get('nonConvoList/{search}', 'Chat\ClientChatController@nonConvoList');
        Route::post('save', 'Chat\ClientChatController@save_message');
        Route::get('convo/{id}', 'Chat\ClientChatController@getUsersConvo');
      });

      //Payment
      Route::prefix('payment')->group(function() {
        Route::get('{cid}', 'PaymentController@payment_users');
        Route::prefix('user')->group(function() {
          Route::get('data', 'PaymentController@payment_user_data');
          Route::post('update', 'PaymentController@payment_user_update');
        });
      });

      //custom push notification
      Route::post('push/notification', 'ClientController@push_notification');

      //Notifications
      Route::get('/notifications', 'ClientController@getMyNotifications'); // >>>> get unseen user campaign status

      //Firebase
      Route::prefix('firebase')->group(function() {
        Route::post('update', 'Firebase\ClientFirebaseController@updateToken');
        Route::post('getToken', 'Firebase\ClientFirebaseController@getToken');
      });
    });
  });
});
