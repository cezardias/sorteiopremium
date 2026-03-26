<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\V1\Rifas;
use App\Models\V1\RifaImage;

$rifa = Rifas::with('rifaImage')->find(6);
if ($rifa) {
    echo "Rifa #6: " . $rifa->title . "\n";
    echo "Rifas table IMG column: " . $rifa->img . "\n";
    echo "RifaImage relations:\n";
    foreach ($rifa->rifaImage as $img) {
        echo " - " . $img->name . "\n";
    }
} else {
    echo "Rifa #6 not found.\n";
}

$allImagesFlat = RifaImage::all()->pluck('name')->toArray();
echo "\nAll images in DB:\n";
print_r($allImagesFlat);
