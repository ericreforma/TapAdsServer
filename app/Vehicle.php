<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $table = 'vehicle';
    
    public function userVehicle(){
      return $this->hasMany('App\UserVehicle');
    }
}
