<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('site_config', function (Blueprint $table) {
            $table->string('gateway')->default('mercadopago')->after('plataform_name');
            $table->string('cyber_public_key')->nullable()->after('gateway');
            $table->string('cyber_secret_key')->nullable()->after('cyber_public_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_config', function (Blueprint $table) {
            $table->dropColumn(['gateway', 'cyber_public_key', 'cyber_secret_key']);
        });
    }
};
