<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserTripTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_trip', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('campaign_id');
            $table->integer('user_id');
            $table->integer('user_campaign_id');
            $table->dateTime('started');
            $table->dateTime('ended');
            $table->decimal('distance_traveled',7,2);
            $table->text('location_start_address');
            $table->float('location_start_long',10,6);
            $table->float('location_start_lat',10,6);
            $table->text('location_end_address');
            $table->float('location_end_long',10,6);
            $table->float('location_end_lat',10,6);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_trip');
    }
}
