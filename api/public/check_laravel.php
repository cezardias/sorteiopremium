<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\V1\SiteConfig;
use App\Models\PaymentInfo;
use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');

try {
    $siteConfig = SiteConfig::find(1);
    $paymentInfos = PaymentInfo::all();
    
    echo json_encode([
        'success' => true,
        'laravel_site_config' => $siteConfig,
        'laravel_payment_infos' => $paymentInfos,
        'db_connection' => DB::connection()->getDatabaseName(),
        'env_gateway' => env('GATEWAY'), // just checking if it exists in env
        'config_gateway' => config('services.gateway'), // checking if it exists in config
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
