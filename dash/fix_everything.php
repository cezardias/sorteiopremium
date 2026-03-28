<?php
header('Content-Type: text/plain');
echo "--- ANTIGRAVITY FULL DEPLOY & FIX SCRIPT ---\n";

$root_dir = realpath($_SERVER['DOCUMENT_ROOT']);
if (strpos($root_dir, '/dash') !== false) {
    $root_dir = dirname($root_dir);
}

echo "Root Directory: $root_dir\n";

function run_cmd($cmd, $cwd = null) {
    if ($cwd) chdir($cwd);
    echo "Running: $cmd ...\n";
    $output = shell_exec($cmd . " 2>&1");
    echo "Output: " . ($output ?: "None") . "\n";
    return $output;
}

// 1. Force Git Sync
echo "\n--- GIT SYNC ---\n";
run_cmd("git fetch origin main", $root_dir);
run_cmd("git reset --hard origin/main", $root_dir);

// 2. Fix Assets & Routing (Root)
echo "\n--- HTACCESS REPAIR (ROOT) ---\n";
$root_htaccess = '<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # BYPASS PARA SUBDOMÍNIO DASH E API
  RewriteCond %{HTTP_HOST} ^dash\. [NC,OR]
  RewriteCond %{REQUEST_URI} ^/(api|dash|assets|storage) [NC]
  RewriteRule ^ - [L]

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>';
file_put_contents($root_dir . '/.htaccess', $root_htaccess);

// 3. Fix Dash Routing (Subdomain)
echo "\n--- HTACCESS REPAIR (DASH) ---\n";
$dash_htaccess = '<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  # Ignore PHP files so we can run diagnostics
  RewriteCond %{REQUEST_URI} !\.php$ [NC]
  RewriteRule . index.html [L]
</IfModule>';
file_put_contents($root_dir . '/dash/.htaccess', $dash_htaccess);

// 4. Cache Clear (API)
echo "\n--- LARAVEL CACHE CLEAR ---\n";
$api_dir = $root_dir . '/api';
run_cmd("php artisan route:clear", $api_dir);
run_cmd("php artisan config:clear", $api_dir);
run_cmd("php artisan cache:clear", $api_dir);

// 5. Database Diagnostic
echo "\n--- DB DIAGNOSTIC ---\n";
try {
    require $api_dir . '/vendor/autoload.php';
    $app = require_once $api_dir . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    $kernel->handle(Illuminate\Http\Request::capture());
    
    $db = \Illuminate\Support\Facades\DB::connection()->getDatabaseName();
    $rifas = \Illuminate\Support\Facades\DB::table('rifas')->count();
    $status = \Illuminate\Support\Facades\DB::table('rifas')->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))->groupBy('status')->get();
    
    echo "Database: $db\n";
    echo "Rifas Count: $rifas\n";
    foreach ($status as $s) {
        echo " - Status: {$s->status} -> {$s->count}\n";
    }
} catch (\Exception $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}

echo "\nDone! All fixes applied. Limpe cache (Ctrl+F5).\n";
