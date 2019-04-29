<?php

use Faker\Generator as Faker;

$factory->define(App\Chat::class, function (Faker $faker) {
    return [
        'user_id' => rand(1,3),
        'client_id' => rand(1,3),
        'type' => rand(0,4),
        'message' => $faker->realText,
        'attachment' => '',
        'sender' => rand(0,1),
    ];
});
