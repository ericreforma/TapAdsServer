<?php

namespace App;

use Laravel\Passport\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;
    protected $guard = 'api';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'username','description', 'birthdate' ,'contact_number','location','email', 'password',
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

    public function media(){
      return $this->hasOne('App\Media');
    }

    public function vehicles(){
      return $this->hasMany('App\UserVehicle');
    }

    public function ratings(){
      return $this->hasMany('App\UserRating');
    }

    public function campaigns() {
      return $this->hasMany('App\UserCampaign','user_id','id')->where('request_status', '=', 1);
    }

    public function registered_campaigns() {
      return $this->hasMany('App\UserCampaign','user_id','id')->where('request_status', '!=', 2);
    }

    public function bank_details() {
      return $this->hasOne('App\UserBankDetails', 'user_id', 'id');
    }
  }
