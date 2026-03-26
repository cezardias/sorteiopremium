<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

header('Content-Type: text/plain');

echo "--- DIAGNÓSTICO DE DADOS ---\n\n";

try {
    $rifasCount = DB::table('rifas')->count();
    echo "Total de Rifas (Campanhas): " . $rifasCount . "\n";

    $ordersCount = DB::table('rifas_pay')->count();
    echo "Total de Pedidos (rifas_pay): " . $ordersCount . "\n";

    if (Schema::hasTable('rifa_pays')) {
        $oldOrdersCount = DB::table('rifa_pays')->count();
        echo "Total de Pedidos (rifa_pays - antiga): " . $oldOrdersCount . "\n";
    }

    $clientsCount = DB::table('clients')->count();
    echo "Total de Clientes: " . $clientsCount . "\n";

    if ($rifasCount > 0) {
        $sample = DB::table('rifas')->limit(1)->get();
        echo "Amostra de Rifa ID: " . $sample[0]->id . " - " . $sample[0]->title . "\n";
    }

} catch (\Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
