<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserRating extends Model
{
  protected $table = 'user_rating';
  
  public function user(){
    return $this->belongsTo('App\User');
  }
  public function client(){
    return $this->belongsTo('App\Client');
  }
}
