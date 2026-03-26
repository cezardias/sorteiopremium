<?php
require 'api/vendor/autoload.php';
$app = require_once 'api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\V1\Rifas;
use App\Models\V1\RifaPay;
use App\Models\V1\Clients;
use Illuminate\Support\Facades\DB;

try {
    $rifasCount = Rifas::count();
    $activeRifasCount = Rifas::where('status', 'ativas')->count();
    $clientsCount = Clients::count();
    $ordersCount = RifaPay::count();
    $revenue = RifaPay::where('status', 1)->sum('value');

    echo "Database Status:\n";
    echo "Total Rifas: $rifasCount\n";
    echo "Active Rifas: $activeRifasCount\n";
    echo "Total Clients: $clientsCount\n";
    echo "Total Orders: $ordersCount\n";
    echo "Total Revenue: $revenue\n";

    if ($rifasCount > 0) {
        echo "\nSample Rifas:\n";
        $samples = Rifas::limit(5)->get(['id', 'title', 'status']);
        foreach ($samples as $rifa) {
            echo "ID: {$rifa->id} | Title: {$rifa->title} | Status: {$rifa->status}\n";
        }
    } else {
        echo "\nNo rifas found in the 'rifas' table.\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
