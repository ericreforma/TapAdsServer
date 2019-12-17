<?php

namespace App\Http\Controllers\Chat;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

// traits
use App\Traits\Firebase\FirebaseController;

// models
use App\Chat;
use App\UserCampaign;
use App\Media;
use App\Client;
use App\FirebaseData;

use DB;
use Input;

class UserChatController extends Controller
{
	use FirebaseController;
	//

	public function __construct()  {
		$this->middleware('auth:api');
	}

	public function get_list(Request $request) {
		$clients = Client::leftJoin('media as m' , 'm.id', 'client.media_id')
		->leftJoin(
			DB::raw('
				(
					SELECT c1.*
					FROM chat as c1
					INNER JOIN (
						SELECT client_id, max(created_at) as max_timestamp
						FROM chat
						WHERE user_id = '.$request->user()->id.'
						GROUP BY client_id
					) as c2
					ON c1.client_id = c2.client_id
					AND c1.created_at = c2.max_timestamp
					ORDER BY created_at DESC
				) as c
			'), 'c.client_id', 'client.id'
		)
		->leftJoin(
			DB::raw('
				(
					SELECT count(*) as notif, client_id
					FROM chat
					WHERE seen = 0
					AND sender = 1
					AND user_id = '.$request->user()->id.'
					GROUP BY client_id
				) as n
			'), 'n.client_id', 'client.id'
		)
		->where('c.user_id', '=', $request->user()->id)
		->select(
			'client.id',
			'client.business_name',
			'client.media_id',
			'm.url',
			'c.message',
			'c.sender',
			'c.created_at',
			'c.user_id',
			'c.seen',
			'n.notif',
			DB::raw('null as online')
		)
		->orderBy('c.created_at', 'desc')
		->get();

		return response()->json($clients);
	}

	public function get_messages(Request $request) {
		$user = $request->user();
		$cid = $request->cid;
		
		$client = Client::where('id', '=', $cid)
		->select('id', 'business_name')
		->first();

		$chat_instance = Chat::where('client_id', '=', $cid)
		->where('user_id', '=', $user->id)
		->latest();

		$total_page = ceil($chat_instance->count() / 15);
		$chat = $chat_instance->limit(15)->get();
		$chat = $this->filter_chat($chat);

		$this->chat_unseen_update($user->id, $cid);

		return response()->json([
			'chat'			 => $chat,
			'client'		 => $client,
			'total_page' => $total_page
		]);
	}

	public function get_paginate_messages(Request $request) {
		$last_id = $request->last_id;
		$cid = $request->cid;
		$user = $request->user();

		$chat = Chat::where('client_id', '=', $cid)
		->where('user_id', '=', $user->id)
		->where('id', '<', $last_id)
		->latest()
		->limit(15)
		->get();
		$chat = $this->filter_chat($chat);

		$this->chat_unseen_update($user->id, $cid);

		return response()->json($chat);
	}

	public function get_latest_messages(Request $request) {
		$cid = $request->cid;
		$user = $request->user();

		$chat = Chat::where('client_id', '=', $cid)
		->where('user_id', '=', $user->id)
		->where('seen', '=', 0)
		->where('sender', '=', 1)
		->latest()
		->get();
		$chat = $this->filter_chat($chat);

		$this->chat_unseen_update($user->id, $cid);

		return response()->json($chat);
	}

	public function save_message(Request $request) {
		$message = $request->message;
		$cid = $request->cid;
		$message_type = $request->type;
		$user = $request->user();
		$user->url = $user->media->url;

		$chat = new Chat;
		$chat->user_id = $user->id;
		$chat->client_id = $cid;
		$chat->message = $message;
		$chat->type = $message_type;
		$chat->sender = 0;
		$chat->save();

		// $firebase = FirebaseData::where('owner', '=', 0)
		// ->where('owner_id', '=', $cid)
		$firebase = FirebaseData::where('owner', '=', 1)
		->where('owner_id', '=', $cid)
		->get();

		if(count($firebase) !== 0) {
			$this->sendNotification(
				[
					'receivedData' => $firebase, //receiver data
					'title' => $user->name,
					'body' => $message, //body
					'page' => 'Messenger',
					'name' => 'Messenger'
				],
				$user
			);
		}

		return response()->json($chat);
	}

	private function filter_chat($chat) {
		return $chat->sortBy(function($message) {
			return $message->created_at;
		})->values()->all();
	}

	private function chat_unseen($id) {
		return count(
			Chat::where('user_id', '=', $id)
			->select('client_id')
			->where('seen', '=', 0)
			->where('sender', '=', 1)
			->groupBy('client_id')
			->get()
		);
	}

	private function chat_unseen_update($id, $cid) {
		if($cid) {
			return Chat::where('user_id', $id)
			->where('client_id', $cid)
			->where('sender', '=', 1)
			->where('seen', '=', 0)
			->update(['seen' => 1]);
		} else {
			return Chat::where('user_id', $id)
			->where('sender', '=', 1)
			->where('seen', '=', 0)
			->update(['seen' => 1]);
		}
	}
}
