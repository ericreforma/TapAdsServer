<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {

      $user = factory(App\User::class, 3)->create();
      $client = factory(App\Client::class, 3)->create();
      $chat = factory(App\Chat::class, 200)->create();
      $userRating = factory(App\UserRating::class, 200)->create();
      $userVehicle = factory(App\UserVehicle::class, 200)->create();
      $userVehiclePhoto = factory(App\UserVehiclePhoto::class, 200)->create();
      $Vehicle = factory(App\Vehicle::class, 30)->create();

      $client->each(function($client){

        $clientCampaign = factory(App\ClientCampaign::class, 10)->make();
        $client->campaigns()->saveMany($clientCampaign);

      });

    }
}
