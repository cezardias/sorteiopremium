<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

header('Content-Type: text/plain');

echo "DB_DATABASE: " . env('DB_DATABASE') . "\n";

try {
    $tables = DB::select('SHOW TABLES');
    echo "--- TABLES ---\n";
    foreach ($tables as $table) {
        $props = get_object_vars($table);
        $tableName = reset($props);
        echo "- $tableName\n";
        
        // Check columns if it's a raffle-related table
        if (preg_match('/rifa|cota|award|payment/i', $tableName)) {
            $columns = Schema::getColumnListing($tableName);
            echo "  Columns: " . implode(', ', $columns) . "\n";
        }
    }
} catch (\Exception $e) {
    echo "Error listing tables: " . $e->getMessage() . "\n";
}
