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
    
	public function message_list(Request $request) {
		$user = $request->user();
		$users = $this->getConvoUsers($user->id);
		return response()->json($users);
	}

	public function nonConvoList(Request $request, $search) {
		$user = $request->user();
		$users = $this->getConvoUsers($user->id);
		$nonConvoUsers = $this->getNonConvoUsers(
			$user->id,
			$search,
			$users->pluck('id')->all()
		);
		return response()->json($nonConvoUsers);
	}

	public function getUsersConvo(Request $request, $id) {
		Chat::where('user_id', '=', $id)
		->where('client_id', '=', $request->user()->id)
		->where('sender', '=', 0)
		->where('seen', '=', 0)
		->update([ 'seen' => 1 ]);

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

	private function getNonConvoUsers($id, $search, $uidList) {
		$users = DB::table('user_campaign as uc')
		->leftJoin('client_campaign as cc', 'cc.id', 'uc.campaign_id')
		->leftJoin('users as u', 'u.id', 'uc.user_id')
		->leftJoin('media as m', 'm.id', 'u.media_id')
		->whereNotIn('u.id', $uidList)
		->where('cc.client_id', '=', $id)
		->where('u.name', 'like', '%'. $search .'%')
		->distinct('uc.user_id')
		->select(
			'u.id',
			'u.name',
			'm.url'
		)
		->get();

		return $users;
	}

	private function getConvoUsers($id) {
		$users = User::leftJoin('media as m', 'm.id', 'users.media_id')
		->leftJoin(
			DB::raw('
				(
					SELECT *
						FROM chat
						WHERE id IN ( 
							SELECT MAX(c1.id)
								FROM chat as c1
								INNER JOIN (
									SELECT user_id, max(created_at) as max_timestamp
									FROM chat
									WHERE client_id = '.$id.'
									GROUP BY user_id
								) as c2
								ON c1.user_id = c2.user_id
								AND c1.created_at = c2.max_timestamp
								GROUP BY created_at
								ORDER BY created_at DESC
						)
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
					AND client_id = '.$id.'
					GROUP BY user_id
				) as n
			'), 'n.user_id', 'users.id'
		)
		->where('c.client_id', '=', $id)
		->select(
			'users.id',
			'users.name',
			'm.url',
			'c.message',
			'c.sender',
			'c.created_at',
			'c.client_id',
			'c.seen'
		)
		->orderBy('c.created_at', 'desc')
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
