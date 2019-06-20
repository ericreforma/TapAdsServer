<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $table = 'media';
    public function user(){
      return $this->belongsTo('App\User');
    }

    public function vehiclePhoto(){
      return $this->belongsTo('App\UserVehiclePhoto');
    }
    public function vehiclePhotoUrl(){
      return $this->belongsTo('App\UserVehiclePhoto')->select('url');
    }
}
