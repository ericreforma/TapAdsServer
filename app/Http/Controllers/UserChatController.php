<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Chat;
use App\Media;
use App\Client;
use DB;

class UserChatController extends Controller
{
    //
    public function __construct()  {
        $this->middleware('auth:api');
    }

    public function getChatList(Request $request) {
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

    public function getMessages(Request $request, $cid) {
        $chatUpdate = Chat::where('client_id', '=', $cid)
                        ->where('user_id', '=', $request->user()->id)
                        ->where('sender', '=', 1)
                        ->update([
                            'seen' => 1
                        ]);
        $chat = Chat::where('client_id', '=', $cid)
                    ->where('user_id', '=', $request->user()->id)
                    ->get();
        $client = Client::where('id', '=', $cid)
                        ->select(
                            'id',
                            'business_name'
                        )
                        ->first();

        return response()->json([
            'chat'   => $chat,
            'client' => $client
        ]);
    }
}
