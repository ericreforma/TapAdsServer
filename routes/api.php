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
      Route::get('/campaign/mylist','UserController@getMyCampaigns');
      Route::post('/campaign/addmylist','UserController@addMyCampaigns');

      // Campaigns
      Route::get('/campaign/browse','ClientCampaignController@campaigns');

      // chat
      Route::prefix('chat')->group(function(){
        Route::get('list', 'UserChatController@getChatList');
        Route::get('{cid}', 'UserChatController@getMessages');
      });
      
      Route::prefix('websocket')->group(function() {
        Route::get('getUserData', 'UserController@websocketUserData');
        Route::post('message/sent', 'UserController@websocketMessageSent');
      });

    });

  });

  // CLIENT
  Route::prefix('client')->group(function(){

      Route::get('home', 'API\AuthClientController@index');
      Route::post('login', 'API\AuthClientController@login');
      Route::post('register', 'API\AuthClientController@register');

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
        Route::get('user/trip/{cid}/{uid}', 'UserController@getUserTrip');

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
