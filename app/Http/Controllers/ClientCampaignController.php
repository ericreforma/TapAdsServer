<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\ClientCampaign;
use App\Media;
use App\Client;

class ClientCampaignController extends Controller
{
    public function __construct() {
      $this->middleware('auth:api');
    }

    public function campaigns(Request $request){

      if($request->rec){
        $campaigns = ClientCampaign::inRandomOrder()->limit(5)->get();
      } else {

        $campaigns = ClientCampaign::
          where('vehicle_classification',$request->cl)
          ->latest()
          ->paginate(4);
      }

      foreach ($campaigns as $c) {

        $c->slots_used = 0;
        $c->photo = Media::where('id',$c->media_id)
          ->select('url')
          ->get()
          ->toArray();

        $c->client = Client::where('id',$c->client_id)
          ->get()
          ->toArray();
      }

      return response()->json($campaigns);

    }

    public function campaign_store(Request $request){



    }
}
