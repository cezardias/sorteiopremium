<?php
require 'api/vendor/autoload.php';
$app = require_once 'api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$count = DB::table('rifa_images')->count();
$samples = DB::table('rifa_images')->limit(5)->get();

echo "Total images in rifa_images: $count\n\n";
foreach ($samples as $sample) {
    echo " - Rifa ID: {$sample->rifas_id}, Path: {$sample->path}\n";
}
