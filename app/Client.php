<?php

namespace App;

use Laravel\Passport\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

use DB;

class Client extends Authenticatable
{
    use HasApiTokens, Notifiable;
    protected $table ='client';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'business_name', 'business_nature','contact_number','media_id'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function chats(){
      return $this->belongsToMany('App\Chat');
    }

    public function ratings(){
      return $this->hasMany('App\UserRating');
    }

    public function campaigns(){
      return $this->hasMany('App\ClientCampaign');
    }

    public function campaign_request(){
      return $this->hasMany('App\UserCampaign')
      ->where('user_campaign.request_status', '=', 0)
      ->leftJoin('client_campaign as cc', 'cc.id', 'user_campaign.campaign_id')
      ->leftJoin('users as u', 'u.id', 'user_campaign.user_id')
      ->leftJoin('media as m', 'm.id', 'u.media_id')
      ->leftJoin('user_vehicle as uv', 'uv.id', 'user_campaign.user_vehicle_id')
      ->leftJoin('vehicle as v', 'v.id', 'uv.vehicle_id')
      ->select(
        'user_campaign.id as user_campaign_id',
        'user_campaign.user_id',
        'user_campaign.campaign_id',
        'user_campaign.client_id',
        'user_campaign.user_vehicle_id',
        'm.url',
        'u.name',
        'u.username',
        'uv.plate_number as vehicle_plate_number',
        'uv.color as vehicle_color',
        'uv.type as vehicle_type',
        'v.manufacturer as vehicle_manufacturer',
        'v.model as vehicle_model',
        'v.year as vehicle_year',
        'v.classification as vehicle_classification',
        'cc.name as campaign_name'
      );
    }

    public function media(){
      return $this->hasOne('App\Media', 'id', 'media_id');
    }

  public function client_campaign($cid) {
    return $this->hasOne('App\ClientCampaign')
    ->where('client_campaign.id', '=', $cid)
    ->leftJoin('media as m', 'm.id', 'client_campaign.media_id')
    ->select(
      'client_campaign.*',
      'm.url'
    )
    ->first();
  }

  public function user_campaign($cid) {
    return $this->hasMany('App\UserCampaign')
    ->leftJoin('users as u', 'u.id', 'user_campaign.user_id')
    ->leftJoin('media as m', 'm.id', 'u.media_id')
    ->where('user_campaign.campaign_id', '=', $cid)
    ->select(
      'user_campaign.*',
      'm.url',
      'u.name',
      'u.username'
    )
    ->get();
  }

  public function user_campaign_approved($cid) {
    return $this->hasMany('App\UserCampaign')
    ->leftJoin('users as u', 'u.id', 'user_campaign.user_id')
    ->leftJoin('media as m', 'm.id', 'u.media_id')
    ->where('user_campaign.campaign_id', '=', $cid)
    ->where('user_campaign.request_status', '=', 1)
    ->select(
      'u.id',
      'u.name',
      'u.username',
      'm.url',
      DB::raw('0 as remaining_distance'),
      DB::raw('0 as trip_traveled'),
      DB::raw('0 as campaign_traveled'),
      DB::raw('0 as vehicle_update'),
      DB::raw('0.00 as amount_paid')
    )
    ->get();
  }
}
