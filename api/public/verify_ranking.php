<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\V1\RifaNumber;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/plain');

echo "--- TESTING RANKING QUERIES ---\n\n";

try {
    echo "1. Testing getRankingRifaGeral():\n";
    $ranking = RifaNumber::getRankingRifaGeral();
    if ($ranking) {
        echo "Success! Count: " . $ranking->count() . "\n";
        print_r($ranking->toArray());
    } else {
        echo "Returned false or empty.\n";
    }

    echo "\n2. RAW Query test for ranking:\n";
    // Check if table names are correct in the DB context
    $sql = "SELECT rifa_numbers.client_id, SUM(JSON_LENGTH(numbers)) as total FROM rifa_numbers JOIN rifas_pay ON rifas_pay.id = rifa_numbers.pay_id WHERE rifa_numbers.status = 1 GROUP BY rifa_numbers.client_id ORDER BY total DESC LIMIT 10";
    
    try {
        $raw = DB::select($sql);
        echo "Raw Success! Count: " . count($raw) . "\n";
        print_r($raw);
    } catch (\Exception $e) {
        echo "Raw Error: " . $e->getMessage() . "\n";
    }

} catch (\Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
