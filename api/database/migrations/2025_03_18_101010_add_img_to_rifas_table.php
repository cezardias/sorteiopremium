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
        if (!Schema::hasColumn('rifas', 'img')) {
            Schema::table('rifas', function (Blueprint $table) {
                $table->string('img')->nullable()->after('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('rifas', 'img')) {
            Schema::table('rifas', function (Blueprint $table) {
                $table->dropColumn('img');
            });
        }
    }
};
