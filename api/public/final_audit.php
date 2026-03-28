<?php
header('Content-Type: text/plain');
echo "--- FINAL AUDIT & DEPLOY SYNC ---\n";

$root_dir = realpath(__DIR__ . '/../../');
echo "Root: $root_dir\n";

// 1. Force Sync
echo "\n1. Attempting Git Sync...\n";
chdir($root_dir);
exec("git fetch origin main && git reset --hard origin/main 2>&1", $output);
foreach ($output as $line) echo "$line\n";

// 2. Database State
echo "\n2. Database State (Rifas Table):\n";
try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    $rifas = \Illuminate\Support\Facades\DB::table('rifas')->get();
    echo "Total Rifas: " . $rifas->count() . "\n";
    foreach ($rifas as $r) {
        echo "ID: {$r->id} | Title: {$r->title} | Status: '{$r->status}' | Show site: '{$r->show_site}'\n";
    }
    
    echo "\n3. Laravel Config:\n";
    echo "App URL: " . config('app.url') . "\n";
    echo "DB Database: " . config('database.connections.mysql.database') . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nDone.\n";
