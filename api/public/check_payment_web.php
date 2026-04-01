<?php
define('LARAVEL_START', microtime(true));
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(Illuminate\Http\Request::capture());

use Illuminate\Support\Facades\DB;

$id = $_GET['id'] ?? 19526;
header('Content-Type: text/plain');
echo "Checking RifaPay ID: $id\n";

try {
    $pay = DB::table('rifas_pay')->where('id', $id)->first();
    if ($pay) {
        echo "Found RifaPay:\n";
        print_r($pay);
    } else {
        echo "RifaPay ID $id NOT FOUND in rifas_pay table.\n";
        
        echo "\nChecking latest 20 orders:\n";
        $latest = DB::table('rifas_pay')->orderBy('id', 'desc')->limit(20)->get();
        foreach ($latest as $l) {
            echo "ID: {$l->id}, Status: {$l->status}, Rifa: {$l->rifas_id}, Client: {$l->client_id}, PixID: ".($l->pix_id ?? 'N/A')."\n";
        }
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
