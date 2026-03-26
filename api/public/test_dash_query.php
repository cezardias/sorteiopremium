<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\V1\Rifas;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/plain');

echo "--- TESTE DE CONSULTA DASHBOARD ---\n\n";

try {
    echo "Tentando executar consulta base de rifas...\n";
    $rifas = Rifas::query()
        ->with(['cota', 'rifaImage', 'rifaPayment', 'rifaOthers'])
        ->orderByDesc('created_at')
        ->limit(5)
        ->get();
    
    echo "Sucesso! Total de rifas encontradas: " . count($rifas) . "\n\n";
    
    foreach ($rifas as $rifa) {
        echo "ID: {$rifa->id} | Titulo: {$rifa->title} | Status: {$rifa->status}\n";
    }

} catch (\Exception $e) {
    echo "ERRO NA CONSULTA: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n--- VERIFICANDO CREDENCIAIS NO BANCO ---\n";
echo "DB_DATABASE: " . config('database.connections.mysql.database') . "\n";
echo "DB_USERNAME: " . config('database.connections.mysql.username') . "\n";
