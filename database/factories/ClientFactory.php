<?php

use Faker\Generator as Faker;

$factory->define(App\Client::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
        'business_name' => $faker->company,
        'business_nature' => $faker->jobTitle,
        'media_id' => rand(10,100),
        'contact_number' => $faker->phoneNumber,
        'email' => $faker->unique()->safeEmail,
        'email_verified_at' => now(),
        'password' => bcrypt('1234'), // password
        'remember_token' => Str::random(10),
    ];
});
