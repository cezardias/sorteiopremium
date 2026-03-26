<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

header('Content-Type: text/plain');

echo "--- LIST ALL TABLES ---\n\n";

try {
    $tables = DB::select('SHOW TABLES');
    foreach ($tables as $table) {
        $name = array_values((array)$table)[0];
        echo $name . "\n";
    }

} catch (\Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
