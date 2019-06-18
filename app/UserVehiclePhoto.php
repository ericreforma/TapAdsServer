<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserVehiclePhoto extends Model
{
    protected $table = 'user_vehicle_photo';

    public function userVehicle(){
      return $this->belongsTo('App\UserVehicle');

    }

    public function photo(){
      return $this->belongsTo('App\Media');
    }

}
