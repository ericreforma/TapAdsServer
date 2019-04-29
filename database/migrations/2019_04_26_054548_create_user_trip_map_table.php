<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserTripMapTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_trip_map', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('user_trip_id');
            $table->integer('campaign_id');
            $table->integer('user_id');
            $table->integer('user_campaign_id');
            $table->integer('client_id');
            $table->float('longtitude',10,6);
            $table->float('latitude',10,6);
            $table->text('address');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_trip_map');
    }
}
