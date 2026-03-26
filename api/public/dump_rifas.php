<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

header('Content-Type: text/plain');

echo "--- DUMP DA TABELA RIFAS ---\n\n";

try {
    $rifas = DB::table('rifas')->get();
    echo "Total de linhas no banco (RAW): " . count($rifas) . "\n\n";
    
    foreach ($rifas as $rifa) {
        print_r($rifa);
        echo "-------------------\n";
    }

} catch (\Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
