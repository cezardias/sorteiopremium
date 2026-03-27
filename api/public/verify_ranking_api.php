<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\V1\RifaNumber;

header('Content-Type: application/json');

try {
    $ranking = RifaNumber::getRankingRifaGeral();
    // Replicate AdminController@rankingGeral response
    echo json_encode(["success" => true, "data" => $ranking]);
    exit;
} catch (\Exception $e) {
    echo json_encode(["success" => false, "msg" => $e->getMessage()]);
}
