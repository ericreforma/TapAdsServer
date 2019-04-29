<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateClientCampaignTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('client_campaign', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('client_id');
            $table->string('name');
            $table->text('description');
            $table->string('location');
            $table->integer('media_id');
            $table->tinyInteger('vehicle_classification');
            $table->tinyInteger('vehicle_type');
            $table->tinyInteger('vehicle_stickerArea');
            $table->smallInteger('slots');
            $table->decimal('pay_basic',7,2);
            $table->decimal('pay_additional',7,2);
            $table->decimal('pay_additional_km',7,2);
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
        Schema::dropIfExists('client_campaign');
    }
}
