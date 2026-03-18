<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\V1\Clients;
$client = Clients::where('name', 'LIKE', '%Ataliba%')->first();
if ($client) {
    echo "Found: " . $client->name . " - " . $client->cellphone . "\n";
} else {
    echo "Not found\n";
}
