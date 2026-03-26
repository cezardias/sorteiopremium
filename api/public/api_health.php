<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\V1\RifasController;
use App\Http\Controllers\V1\AdminController;
use Illuminate\Http\Request;

header('Content-Type: application/json');

echo "--- RELATÓRIO DE SAÚDE DA API ---\n\n";

try {
    $rifasController = app(RifasController::class);
    $adminController = app(AdminController::class);
    $request = Request::create('/dashboard/todas-rifas', 'GET');
    
    echo "1. Testando getAllRifasAdmin():\n";
    $resp1 = $rifasController->getAllRifasAdmin($request);
    echo $resp1->getContent() . "\n\n";

    echo "2. Testando getStats():\n";
    $resp2 = $adminController->getStats();
    echo $resp2->getContent() . "\n\n";

} catch (\Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
