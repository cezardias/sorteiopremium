<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');

try {
    $site_config = DB::table('site_config')->where('id', 1)->first();
    $payment_info = DB::table('payment_info')->get();
    
    echo json_encode([
        'success' => true,
        'site_config' => $site_config,
        'payment_info_count' => count($payment_info),
        'payment_info' => $payment_info
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
