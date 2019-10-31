<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NetworkController extends Controller
{
    public function checkPing() {
        return response()->json(1);
    }
}
