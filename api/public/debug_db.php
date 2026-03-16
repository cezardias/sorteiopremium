<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;

$dbs = ['u434605668_sorteiopremium', 'u434605668_sorteiospremiu'];
$results = [];

foreach ($dbs as $db) {
    try {
        Config::set("database.connections.temp_$db", [
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'database' => $db,
            'username' => 'u434605668_sorteiopremium',
            'password' => 'SorteioPremiumMultiMarca1!2#%34.',
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
        ]);

        $count = DB::connection("temp_$db")->table('afiliados')->count();
        $results[$db] = "Success! Count: $count";
    } catch (\Exception $e) {
        $results[$db] = "Error: " . $e->getMessage();
    }
}

header('Content-Type: application/json');
echo json_encode([
    'current_db' => DB::getDatabaseName(),
    'results' => $results
], JSON_PRETTY_PRINT);
