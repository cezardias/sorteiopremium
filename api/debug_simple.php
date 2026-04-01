<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $rifas = DB::table('rifas')->where('id', 5)->first();
    $packages = DB::table('discount_packages')->where('rifas_id', 5)->get();
    $awarded = DB::table('awarded_quotas')->where('rifas_id', 5)->get();
    $settings = DB::table('settings')->first();

    echo "RIFA TITLE: " . ($rifas->title ?? 'NOT FOUND') . "\n";
    echo "PACKAGES COUNT: " . count($packages) . "\n";
    echo "AWARDED COUNT: " . count($awarded) . "\n";
    echo "LOGO DARK URL: " . ($settings->logo_dark ?? 'NULL') . "\n";
    echo "SITE NAME: " . ($settings->site_name ?? 'NULL') . "\n";
    
    if ($rifas) {
       echo "RIFA FIELDS: " . implode(', ', array_keys((array)$rifas)) . "\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
