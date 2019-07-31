<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    public $timestamps = false;
    protected $table = 'chat';
    public function user(){
      return $this->belongsToMany('App\User');
    }

    public function client(){
      return $this->belongsToMany('App\Client');
    }
}
