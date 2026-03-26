<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\V1\RifasController;
use Illuminate\Http\Request;

header('Content-Type: application/json');

try {
    $controller = app(RifasController::class);
    $request = Request::create('/dashboard/todas-rifas', 'GET');
    
    echo "--- CHAMANDO getAllRifasAdmin() INTERNAMENTE ---\n\n";
    $response = $controller->getAllRifasAdmin($request);
    
    echo $response->getContent();

} catch (\Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
