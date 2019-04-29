<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserTripMap extends Model
{
    protected $table = 'user_trip_map';
    public function client(){
      return $this->belongsTo('App\Client');
    }

    public function user(){
      return $this->belongsTo('App\User');
    }

    public function userCampaign(){
      return $this->belongsTo('App\UserCampaign');
    }

    public function clientCampaign(){
      return $this->belongsTo('App\ClientCampaign');
    }

    public function userTrip(){
      return $this->belongsTo('App\UserTrip');
    }
}
