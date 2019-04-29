<?php

use Faker\Generator as Faker;

$factory->define(App\Vehicle::class, function (Faker $faker) {
    return [
        'manufacturer' => $faker->company,
        'model' => $faker->company,
        'year' => rand(1995, 2019),
        'classification' => rand(0,3)
    ];
});
