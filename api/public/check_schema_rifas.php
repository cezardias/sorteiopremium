<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "--- LISTING ALL TABLES ---\n";
$tables_list = DB::select('SHOW TABLES');
$dbname = "Tables_in_" . env('DB_DATABASE');
foreach ($tables_list as $table_obj) {
    echo "- " . $table_obj->$dbname . "\n";
}

echo "\n--- CHECKING SELECTED SCHEMAS ---\n";
$tables = ['rifas', 'cotas', 'rifas_awardeds', 'rifas_others', 'rifas_payments', 'rifas_pay', 'rifa_pays', 'rifa_numbers', 'rifas_numbers'];

foreach ($tables as $table) {
    if (!Schema::hasTable($table)) {
        continue;
    }
    echo "--- Table: $table ---\n";
    $columns = Schema::getColumnListing($table);
    foreach ($columns as $column) {
        try {
            $type = Schema::getColumnType($table, $column);
            echo "- $column ($type)\n";
        } catch (\Exception $e) {
            echo "- $column (unknown/error)\n";
        }
    }
    echo "\n";
}
