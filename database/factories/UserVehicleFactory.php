<?php

use Faker\Generator as Faker;

$factory->define(App\UserVehicle::class, function (Faker $faker) {
    return [
        'user_id' => rand(1,3),
        'vehicle_id' => rand(1,10),
        'color' => $faker->safeColorName,
        'type' => rand(0,2)
    ];
});
