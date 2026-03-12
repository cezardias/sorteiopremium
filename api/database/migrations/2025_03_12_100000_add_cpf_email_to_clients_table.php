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
        Schema::table('clients', function (Blueprint $table) {
            if (!Schema::hasColumn('clients', 'cpf')) {
                $table->string('cpf')->nullable()->after('surname');
            }
            if (!Schema::hasColumn('clients', 'email')) {
                $table->string('email')->nullable()->after('cpf');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['cpf', 'email']);
        });
    }
};
