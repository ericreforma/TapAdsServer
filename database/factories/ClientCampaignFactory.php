<?php

use Faker\Generator as Faker;

$factory->define(App\ClientCampaign::class, function (Faker $faker) {
  return [
    'client_id' => rand(1,4),
    'name' => $faker->name,
    'description' => $faker->realText,
    'location' => null,
    'location_id' => [rand(1,23)],
    'media_id' => 0,
    'vehicle_classification' => rand(0, 2),
    'vehicle_type' => rand(0, 2),
    'vehicle_stickerarea' =>rand(0,5),
    'slots' => rand(20, 50),
    'duration_from' => '2019-10-30',
    'duration_to' => '2020-01-30',
    'vehicle_update_date' => '30',
    'pay_basic' => $faker->numberBetween($min = 5000, $max = 10000),
    'pay_basic_km' => $faker->numberBetween($min = 500, $max = 2000),
    'completion_bonus' => $faker->numberBetween($min = 5000, $max = 10000)
  ];
});
