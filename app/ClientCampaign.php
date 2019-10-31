<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ClientCampaign extends Model
{
    protected $table = 'client_campaign';
    public $timestamps = false;

    protected $casts = [
      'location_id' => 'array'
    ];
    protected $dates = ['created_at'];
    
    public function client(){
      return $this->belongsTo('App\Client');
    }

    public function userCampaign(){
      return $this->hasMany('App\UserCampaign');
    }

    public function userTripMap() {
      return $this->hasMany('App\UserTripMap','client_id','id');
    }
}
