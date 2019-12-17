<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class FirebaseData extends Model
{
    protected $table = 'firebase_data';
    public $timestamps = false;
    protected $fillable = [
        'owner', 'owner_id', 'unique_id', 'token'
    ];
}
