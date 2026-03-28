<?php
header('Content-Type: text/plain');
echo "--- FORCE DEPLOYMENT SYSTEM ---\n";

$root_dir = "/home/u434605668/domains/sorteiospremiummultimarcas.com.br/public_html";
chdir($root_dir);

echo "Current Directory: " . getcwd() . "\n";

echo "\n1. Resetting Git...\n";
$output = shell_exec("git fetch origin main && git reset --hard origin/main 2>&1");
echo "Result: " . ($output ?: "No output") . "\n";

echo "\n2. Clearing Laravel Caches...\n";
chdir($root_dir . "/api");
$out1 = shell_exec("php artisan route:clear 2>&1");
$out2 = shell_exec("php artisan config:clear 2>&1");
$out3 = shell_exec("php artisan cache:clear 2>&1");
echo "Artisan: \n$out1\n$out2\n$out3\n";

echo "\n3. Database Sync Check...\n";
try {
    require $root_dir . '/api/vendor/autoload.php';
    $app = require_once $root_dir . '/api/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    $kernel->handle(Illuminate\Http\Request::capture());
    
    $status = \Illuminate\Support\Facades\DB::table('rifas')->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))->groupBy('status')->get();
    foreach ($status as $s) {
        echo "Status: '{$s->status}' -> Count: {$s->count}\n";
    }
} catch (Exception $e) {
    echo "DB Check Error: " . $e->getMessage() . "\n";
}

echo "\nDone! If Git reset worked, the site should be updated now.\n";
