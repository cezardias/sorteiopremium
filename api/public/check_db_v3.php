<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $db = DB::connection()->getDatabaseName();
    $user = config('database.connections.mysql.username');
    $host = config('database.connections.mysql.host');
    
    echo "DB: $db\n";
    echo "USER: $user\n";
    echo "HOST: $host\n";
    echo "RIFAS COUNT: " . DB::table('rifas')->count() . "\n";
    echo "CLIENTS COUNT: " . DB::table('clients')->count() . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
