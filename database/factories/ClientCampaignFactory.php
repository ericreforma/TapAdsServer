<?php

use Faker\Generator as Faker;

$factory->define(App\ClientCampaign::class, function (Faker $faker) {
    return [
      'name' => $faker->name,
      'description' => $faker->realText,
      'location' => $faker->city,
      'media_id' => rand(1,10),
      'vehicle_classification' => rand(0, 3),
      'vehicle_type' => rand(0, 2),
      'vehicle_stickerarea' =>rand(0,5),
      'slots' => rand(50, 200),
      'pay_basic' => $faker->numberBetween($min = 5000, $max = 10000),
      'pay_additional' => $faker->numberBetween($min = 500, $max = 1000),
      'pay_additional_km' => rand(1, 5),
    ];
});
