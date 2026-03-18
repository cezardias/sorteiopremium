<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

header('Content-Type: text/plain');
echo "Attempting to add 'img' column to 'rifas' table...\n";

try {
    if (!Schema::hasColumn('rifas', 'img')) {
        Schema::table('rifas', function (Blueprint $table) {
            $table->string('img')->nullable()->after('user_id');
        });
        echo "Column 'img' added successfully!\n";
    } else {
        echo "Column 'img' already exists.\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
