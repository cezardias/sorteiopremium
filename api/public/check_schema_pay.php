<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

header('Content-Type: text/plain');

echo "--- CHECK SCHEMA RIFAS_PAY ---\n\n";

try {
    $columns = Schema::getColumnListing('rifas_pay');
    echo "Colunas na tabela 'rifas_pay':\n";
    print_r($columns);

    $sample = DB::table('rifas_pay')->limit(1)->get();
    echo "\nAmostra de dados:\n";
    print_r($sample);

} catch (\Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
