<?php
require 'api/vendor/autoload.php';
$app = require_once 'api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\V1\Rifas;
use App\Models\V1\RifaImage;

echo "--- RIFAS MAIN IMAGES ---\n";
$rifas = Rifas::all();
foreach ($rifas as $rifa) {
    echo "ID: {$rifa->id} | Title: {$rifa->title} | Img: {$rifa->img}\n";
    if ($rifa->img) {
        $path = "api/public/img/rifas/" . $rifa->img;
        if (file_exists($path)) {
            echo "  [OK] File exists: $path\n";
        } else {
            echo "  [ERROR] File NOT found: $path\n";
        }
    }
}

echo "\n--- ADDITIONAL RIFAS IMAGES ---\n";
$images = RifaImage::all();
foreach ($images as $image) {
    echo "ID: {$image->id} | Rifa ID: {$image->rifas_id} | Path: {$image->path}\n";
    $path = "api/public/img/rifas/" . $image->path;
    if (file_exists($path)) {
        echo "  [OK] File exists: $path\n";
    } else {
        echo "  [ERROR] File NOT found: $path\n";
    }
}
