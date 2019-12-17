<?php

namespace App\Http\Controllers\Chat;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

// traits
use App\Traits\Firebase\FirebaseController;

// models
use App\FirebaseData;
use App\Chat;
use App\User;
use DB;

class ClientChatController extends Controller
{
	use FirebaseController;
	//

	public function __construct() {
		$this->middleware('auth:web_api');
	}
    
	public function getUsersChat(Request $request) {
		$users = User::leftJoin('media as m', 'm.id', 'users.media_id')
		->leftJoin(
			DB::raw('
				(
					SELECT c1.*
					FROM chat as c1
					INNER JOIN (
						SELECT user_id, max(created_at) as max_timestamp
						FROM chat
						WHERE client_id = '.$request->user()->id.'
						GROUP BY user_id
					) as c2
					ON c1.user_id = c2.user_id
					AND c1.created_at = c2.max_timestamp
					ORDER BY created_at DESC
				) as c
			'), 'c.user_id', 'users.id'
		)
		->leftJoin(
			DB::raw('
				(
					SELECT count(*) as notif, user_id
					FROM chat
					WHERE seen = 0
					AND sender = 0
					AND client_id = '.$request->user()->id.'
					GROUP BY user_id
				) as n
			'), 'n.user_id', 'users.id'
		)
		->where('c.client_id', '=', $request->user()->id)
		->select(
			'users.id',
			'users.name',
			'm.url',
			'c.message',
			'c.sender',
			'c.created_at',
			'c.client_id',
			'n.notif'
		)
		->orderBy('c.created_at', 'desc')
		->get();
		
		$nonConvoUsers = $this->getUserList($request->user()->id);
		
		return response()->json([
			'status'  => 'success',
			'message' => [
				'users' => $users,
				'nonConvoUsers' => $nonConvoUsers
			]
		]);
	}

	public function getUsersConvo(Request $request, $id) {
		$conversation = Chat::where('user_id', '=', $id)
		->where('client_id', '=', $request->user()->id)
		->orderBy('created_at', 'asc')
		->get();

		if($conversation) {
			return response()->json([
				'status' => 'success',
				'message' => [ 'convo' => $conversation ]
			]);
		} else {
			return response()->json([
				'status' => 'error',
				'message' => 'User id does not exist'
			]);
		}
	}

	private function getUserList($id) {
		$users = DB::table('user_campaign as uc')
		->leftJoin('client_campaign as cc', 'cc.id', 'uc.campaign_id')
		->leftJoin('users as u', 'u.id', 'uc.user_id')
		->leftJoin('media as m', 'm.id', 'u.media_id')
		->where('cc.client_id', '=', $id)
		->distinct('uc.user_id')
		->select(
			'u.id',
			'u.name',
			'm.url'
		)
		->get();

		return $users;
	}

	public function updateNotif(Request $request, $id) {
		Chat::where('user_id', '=', $id)
		->where('client_id', '=', $request->user()->id)
		->where('sender', '=', 0)
		->update([ 'seen' => 1 ]);

		return response()->json(['status'=>'success']);
	}

	public function save_message(Request $request) {
		$message = $request->message;
		$uid = $request->uid;
		$message_type = $request->type;
		$user = $request->user();
		$user->url = $user->media->url;
		
		$chat = new Chat;
		$chat->user_id = $uid;
		$chat->client_id = $user->id;
		$chat->message = $message;
		$chat->type = $message_type;
		$chat->sender = 1;
		$chat->save();

		$firebase = FirebaseData::where('owner', '=', 0)
		->where('owner_id', '=', $uid)
		->get();

		if(count($firebase) !== 0) {
			$this->sendNotification(
				[
					'receiverData' => $firebase,
					'title' => $user->business_name,
					'body' => $message,
					'page' => 'Chat',
					'name' => 'Chat',
				],
				$user
			);
		}

		return response()->json($chat);
	}
}
