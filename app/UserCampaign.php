<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserCampaign extends Model
{
    protected $table = 'user_campaign';
    public function user(){
      return $this->belongsTo('App\User');
    }

    public function client(){
      return $this->belongsTo('App\Client');
    }

    public function clientCampaign(){
      return $this->belongsTo('App\ClientCampaign');
    }

    public function userTrip(){
      return $this->hasMany('App\UserTrip');
    }
}
