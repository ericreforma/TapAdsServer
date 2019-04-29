<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserVehicle extends Model
{
    protected $table = 'user_vehicle';
    public function user(){
      return $this->belongsTo('App\User');
    }

    public function vehicle(){
      return $this->belongsTo('App\Vehicle');
    }

    public function photos(){
      return $this->hasMany('App\UserVehiclePhoto');
    }
}
