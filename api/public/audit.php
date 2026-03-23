<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;

echo "<h3>Auditoria de Dados - Produção</h3>";

try {
    $rifasCount = DB::table('rifas')->count();
    $clientsCount = DB::table('clients')->count();
    $ordersCount = DB::table('rifas_pay')->count();
    $revenue = DB::table('rifas_pay')->where('status', 1)->sum('value');

    echo "<ul>";
    echo "<li><b>Rifas:</b> $rifasCount</li>";
    echo "<li><b>Clientes:</b> $clientsCount</li>";
    echo "<li><b>Pedidos (Vendas):</b> $ordersCount</li>";
    echo "<li><b>Faturamento Total (status 1):</b> R$ " . number_format($revenue, 2, ',', '.') . "</li>";
    echo "</ul>";

    if ($rifasCount > 0) {
        echo "<h4>Exemplo de Rifa:</h4>";
        $rifa = DB::table('rifas')->first();
        print_r($rifa);
    }

} catch (\Exception $e) {
    echo "<p style='color:red'>Erro: " . $e->getMessage() . "</p>";
}
