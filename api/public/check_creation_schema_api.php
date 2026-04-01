<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

try {
    $tables = [
        'rifas',
        'cotas',
        'rifas_awarded',
        'rifas_others',
        'rifas_payment',
        'discount_packages',
        'rifa_images',
        'rifa_pays'
    ];

    $results = [];
    foreach ($tables as $table) {
        $exists = Schema::hasTable($table);
        $count = $exists ? DB::table($table)->count() : 0;
        $results[$table] = [
            'exists' => $exists,
            'count' => $count,
            'columns' => $exists ? Schema::getColumnListing($table) : []
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
