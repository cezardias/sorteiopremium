<?php
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$phone = $_GET['phone'] ?? '99944-9572';
$normalized = preg_replace('/[^0-9]/', '', $phone);

header('Content-Type: application/json');

try {
    $exists = DB::table('clients')
        ->where('cellphone', $phone)
        ->orWhere('cellphone', $normalized)
        ->orWhere('cellphone', 'like', "%$normalized%")
        ->get();

    echo json_encode([
        'query_phone' => $phone,
        'normalized' => $normalized,
        'found_count' => $exists->count(),
        'results' => $exists
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
