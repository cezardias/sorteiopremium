<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Artisan;

header('Content-Type: text/plain');

echo "--- CLEARING LARAVEL CACHE ---\n\n";

try {
    echo "Config Clear: " . Artisan::call('config:clear') . "\n";
    echo "Cache Clear: " . Artisan::call('cache:clear') . "\n";
    echo "Route Clear: " . Artisan::call('route:clear') . "\n";
    echo "View Clear: " . Artisan::call('view:clear') . "\n";
    
    // Explicitly check RifaPay model content via Reflection if possible or just include it
    $reflector = new ReflectionClass(\App\Models\V1\RifaPay::class);
    echo "\nModel RifaPay file path: " . $reflector->getFileName() . "\n";
    
    // Check if OPCache is enabled and clear it
    if (function_exists('opcache_reset')) {
        echo "OPCache Reset: " . (opcache_reset() ? 'Success' : 'Failed') . "\n";
    } else {
        echo "OPCache not enabled.\n";
    }

    echo "\nCache clearing completed.\n";

} catch (\Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
