<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('site_config')) {
            Schema::create('site_config', function (Blueprint $table) {
                $table->id();
                $table->string('site_name')->nullable();
                $table->string('plataform_name')->nullable();
                $table->string('whatsapp_link')->nullable();
                $table->string('instagram_link')->nullable();
                $table->string('url_logo_site')->nullable();
                $table->string('url_favicon_site')->nullable();
                $table->string('meta_pixel')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_config');
    }
};
