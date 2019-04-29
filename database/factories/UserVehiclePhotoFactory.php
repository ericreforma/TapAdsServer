<?php

use Faker\Generator as Faker;

$factory->define(App\UserVehiclePhoto::class, function (Faker $faker) {
    return [
        'user_vehicle_id' => rand(1,30),
        'media_id' => rand(1,10)
    ];
});
