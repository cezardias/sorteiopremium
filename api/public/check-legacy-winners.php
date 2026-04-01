<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request = Illuminate\Http\Request::capture());

use Illuminate\Support\Facades\DB;

try {
    $counts = [];
    $counts['rifas_with_winner_id'] = DB::table('rifas')->whereNotNull('winner_id')->count();
    $counts['rifas_with_winner_number'] = DB::table('rifas')->whereNotNull('winner_number')->count();
    
    echo json_encode($counts);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
