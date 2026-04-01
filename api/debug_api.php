<?php

use App\Models\V1\Rifas;
use App\Models\V1\Settings;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$id = 5;
$rifa = Rifas::getOneRifa($id);
$settings = DB::table('settings')->first();

echo "RAFFLE DATA:\n";
echo json_encode($rifa, JSON_PRETTY_PRINT);
echo "\n\nSETTINGS DATA:\n";
echo json_encode($settings, JSON_PRETTY_PRINT);
