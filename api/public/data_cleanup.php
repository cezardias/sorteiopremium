<?php
header('Content-Type: text/plain');
echo "--- DATA CLEANUP ---\n";

try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    // Force active raffle to be visible
    $updated = \Illuminate\Support\Facades\DB::table('rifas')
        ->where('status', 'ativas')
        ->update(['show_site' => 'sim']);
    
    echo "Rifas Ativas Updated to 'sim': " . $updated . "\n";
    
    // Check ID 4 specifically
    $rifa4 = \Illuminate\Support\Facades\DB::table('rifas')->where('id', 4)->first();
    if ($rifa4) {
        echo "Rifa ID 4: Title='{$rifa4->title}', Status='{$rifa4->status}', ShowSite='{$rifa4->show_site}'\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nDone.\n";
