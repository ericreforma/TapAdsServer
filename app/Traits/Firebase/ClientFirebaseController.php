<?php

namespace App\Traits\Firebase;

use GuzzleHttp\Client;

trait ClientFirebaseController
{
	private static function clientSendNotification($message_data, $user_data, $action = null, $second_body = '') {
		$receiverData = $message_data['receiverData'];
		$body = $message_data['body'];
		$page = $message_data['page'];
		$title = $message_data['title'];
		$name = $message_data['name'];
		$args = isset($message_data['args']) ? $message_data['args'] : null;
		$image = $user_data->url;
		$sender_id = $user_data->id;
		$add_data = isset($message_data['add_data']) ? $message_data['add_data'] : null;

		$firebase_send_url = 'https://fcm.googleapis.com/fcm/send';
		$client = new Client([
			'headers' => [
				'Authorization' => 'key='.env('FIREBASE_SERVER_KEY'),
				'Content-Type' => 'application/json'
			]
		]);

		foreach($receiverData as $r) {
			try {
				$res = $client->post($firebase_send_url, [
					'json' => [
						"to" => $r->token,
						"notification" => [
							"body" => $body,
							"title" => $title,
							"content_available" => true,
							"priority" => "high",
							"icon" => "https://dev.bcdpinpoint.com/TapAdsServer/public/storage/".$image,
							"data" => [
								"page" => $page,
								"name" => $name,
								"image" => $image,
								"sender_id" => $sender_id,
								"action" => $action,
								"args" => $args,
								"second_body" => $second_body,
								"add_data" => $add_data
							]
						],
						"data" => [
							"body" => $body,
							"title" => $title,
							"content_available" => true,
							"priority" => "high",
							"icon" => "https://dev.bcdpinpoint.com/TapAdsServer/public/storage/".$image,
							"data" => [
								"page" => $page,
								"name" => $name,
								"image" => $image,
								"sender_id" => $sender_id,
								"action" => $action,
								"args" => $args,
								"second_body" => $second_body,
								"add_data" => $add_data
							]
						]
					]
				]);
			} catch(\Illuminate\Database\QueryException $e) {

			}
		}
	}
}