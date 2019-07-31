<?php

use Faker\Generator as Faker;

$factory->define(App\Chat::class, function (Faker $faker) {
    return [
        'user_id' => rand(1,68),
        'client_id' => 21,
        'type' => rand(0,4),
        'message' => $faker->realText,
        'attachment' => '',
        'sender' => rand(0,1),
        'seen' => rand(0,1),
        'created_at' => $faker->date($format = 'Y-m-d', $max = 'now') . ' ' . $faker->time($format = 'H:i:s', $max = 'now')
    ];
});
