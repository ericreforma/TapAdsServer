<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserCurrentLocation extends Model
{
    protected $table = 'user_current_location';
    public $timestamps = false;
    protected $fillable = ['user_trip_id'];
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
