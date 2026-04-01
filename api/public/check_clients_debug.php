<?php
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');

try {
    $search = '999449572';
    $all = DB::table('clients')->select('id', 'name', 'cellphone')->get();
    
    $matches = $all->filter(function($c) use ($search) {
        $norm = preg_replace('/\D/', '', $c->cellphone);
        return str_contains($norm, $search);
    });

    echo json_encode([
        'total_clients' => $all->count(),
        'search_numbers' => $search,
        'matches' => $matches->values(),
        'first_5' => $all->take(5)->values()
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
