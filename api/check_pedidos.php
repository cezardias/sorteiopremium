<?php
require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\V1\RifaPay;

$pedidos = RifaPay::getAllCompra();
$items = $pedidos->items();

header('Content-Type: application/json');
echo json_encode([
    'total' => $pedidos->total(),
    'count' => count($items),
    'data' => $items
]);
