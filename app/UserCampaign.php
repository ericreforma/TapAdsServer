<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserCampaign extends Model
{
    protected $table = 'user_campaign';
    protected $fillable = ['request_status', 'seen', 'request_status_updated'];

    public $timestamps = false;
    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->created_at = $model->freshTimestamp();
        });
    }
    public function user(){
      return $this->belongsTo('App\User');
    }

    public function campaign() {
      return $this->hasOne('App\ClientCampaign', 'id', 'campaign_id');
    }

    public function client(){
      return $this->belongsTo('App\Client');
    }

    public function clientCampaign(){
      return $this->belongsTo('App\ClientCampaign');
    }

    public function userTrip(){
      return $this->hasMany('App\UserTrip');
    }
}
