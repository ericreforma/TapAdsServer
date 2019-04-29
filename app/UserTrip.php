<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserTrip extends Model
{
    protected $table = 'user_trip';
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

    public function tripMap(){
      return $this->hasMany('App\UserTripMap');
    }


}
