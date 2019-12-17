<?php

namespace App\Http\Controllers\Firebase;

use GuzzleHttp\Client;

trait FirebaseController
{
	private static function sendNotification($receiverData, $body, $title, $page, $image = null) {
		$firebase_send_url = 'https://fcm.googleapis.com/fcm/send';
		$client = new Client([
			'headers' => [
				'Authorization' => 'key='.env('FIREBASE_SERVER_KEY'),
				'Content-Type' => 'application/json'
			]
		]);

		foreach($receiverData as $r) {
			$res = $client->post($firebase_send_url, [
				'json' => [
					"to" => $r->token,
					"notification" => [
						"body" => $body,
						"title" => $title,
						"content_available" => true,
						"priority" => "high",
						"data" => [
							"page" => $page,
							"image" => $image
						]
					],
					"data" => [
						"body" => $body,
						"title" => $title,
						"content_available" => true,
						"priority" => "high",
						"data" => [
							"page" => $page,
							"image" => $image
						]
					]
				]
			]);
		}
	}
}
