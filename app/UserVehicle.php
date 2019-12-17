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
    return $this->hasOne('App\Vehicle', 'id', 'vehicle_id');
  }

  public function photos(){
    return $this->hasMany('App\UserVehiclePhoto')
    ->leftJoin('media as m', 'm.id', 'user_vehicle_photo.media_id')
    ->select('user_vehicle_photo.*', 'm.url');
  }
}
