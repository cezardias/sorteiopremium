<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;

try {
    $afiliados = DB::table('afiliados')->get();
    $clients = DB::table('clients')->count();
    
    echo json_encode([
        "success" => true,
        "afiliados_count" => count($afiliados),
        "clients_count" => $clients,
        "afiliados" => $afiliados
    ]);
} catch (\Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
