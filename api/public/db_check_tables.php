<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request = Illuminate\Http\Request::capture());

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    $counts = [];
    $counts['rifas_winners'] = Schema::hasTable('rifas_winners') ? DB::table('rifas_winners')->count() : 'table missing';
    $counts['afiliados'] = Schema::hasTable('afiliados') ? DB::table('afiliados')->count() : 'table missing';
    $counts['users'] = Schema::hasTable('users') ? DB::table('users')->count() : 'table missing';
    $counts['clients'] = Schema::hasTable('clients') ? DB::table('clients')->count() : 'table missing';
    
    echo json_encode($counts);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
