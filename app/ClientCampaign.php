<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ClientCampaign extends Model
{
    protected $table = 'client_campaign';

    public function client(){
      return $this->belongsTo('App\Client');
    }

    public function userCampaign(){
      return $this->hasMany('App\UserCampaign');
    }
    
}
