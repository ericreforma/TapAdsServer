<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Chat;
use App\User;
use DB;

class ClientChatController extends Controller
{
    //
	public function __construct()
	{
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
        
        return response()->json([
            'status'  => 'success',
            'message' => [
                'users' => $users
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
                'message' => [
                    'convo' => $conversation
                ]
            ]);
        } else {
			return response()->json([
				'status' => 'error',
				'message' => 'User id does not exist'
			]);
        }
    }

    public function updateNotif(Request $request, $id) {
        Chat::where('user_id', '=', $id)
            ->where('client_id', '=', $request->user()->id)
            ->where('sender', '=', 0)
            ->update([
                'seen' => 1
            ]);

        return response()->json(['status'=>'success']);
    }

    public function websocketMessageSent(Request $request) {
        $chat = new Chat;
        $chat->user_id = $request->uid;
        $chat->client_id = $request->user()->id;
        $chat->message = $request->message;
        $chat->type = $request->type;
        $chat->sender = 1;
        $chat->save();
        $chat = Chat::find($chat->id);

        return response()->json([
            'status' => 'success',
            'message' => [
                'chat' => $chat
            ]
        ]);
    }
}
