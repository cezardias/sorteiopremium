<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

header('Content-Type: text/plain');

echo "--- DB DIAGNOSTIC ---\n";
echo "DB_DATABASE: " . env('DB_DATABASE') . "\n";

try {
    $tables_list = DB::select('SHOW TABLES');
    $dbname_key = "Tables_in_" . env('DB_DATABASE');
    
    echo "TABLES FOUND:\n";
    foreach ($tables_list as $table_obj) {
        $props = get_object_vars($table_obj);
        $tableName = reset($props);
        echo "- $tableName\n";
    }

    $tables_to_check = ['rifas', 'cotas', 'rifas_awarded', 'rifas_others', 'rifas_payment', 'rifa_pays', 'rifas_pay'];
    foreach ($tables_to_check as $table) {
        echo "\n--- Table: $table ---\n";
        if (!Schema::hasTable($table)) {
            echo "NOT FOUND\n";
            continue;
        }
        $columns = Schema::getColumnListing($table);
        foreach ($columns as $column) {
            echo "- $column\n";
        }
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
