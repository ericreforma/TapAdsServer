<?php

use Faker\Generator as Faker;

$factory->define(App\UserRating::class, function (Faker $faker) {
    return [
        'user_id' => rand(1,3),
        'client_id' => rand(1,3),
        'rate' => rand(1,5),
        'comment' => $faker->realText,
    ];
});
