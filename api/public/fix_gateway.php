<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    echo "<h1>Ajuste de Gateway de Pagamento</h1>";

    $gateways = DB::table('payment_info')->get();
    echo "<h2>Configuração Atual:</h2>";
    echo "<table border='1'><tr><th>ID</th><th>Nome</th><th>Gateway</th></tr>";
    foreach ($gateways as $g) {
        echo "<tr><td>{$g->id}</td><td>{$g->name}</td><td>{$g->gateway}</td></tr>";
    }
    echo "</table>";

    // Ação: Substituir Paggue por CyberPay
    $paggue = DB::table('payment_info')->where('gateway', 'PAGGUE')->first();
    
    if ($paggue) {
        DB::table('payment_info')->where('id', $paggue->id)->update([
            'name' => 'CYBERPAY',
            'gateway' => 'CYBERPAY',
            'public_key' => env('CYBER_PAYMENT_PUBLIC_KEY'),
            'api_client_id' => env('CYBER_PAYMENT_SECRET_KEY'),
        ]);
        echo "<p style='color:green'><b>Sucesso:</b> PAGGUE foi substituído por CYBERPAY!</p>";
    } else {
        // Verificar se já existe CYBERPAY
        $cyber = DB::table('payment_info')->where('gateway', 'CYBERPAY')->first();
        if (!$cyber) {
            DB::table('payment_info')->insert([
                'name' => 'CYBERPAY',
                'gateway' => 'CYBERPAY',
                'public_key' => env('CYBER_PAYMENT_PUBLIC_KEY'),
                'api_client_id' => env('CYBER_PAYMENT_SECRET_KEY'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            echo "<p style='color:green'><b>Sucesso:</b> CYBERPAY foi adicionado!</p>";
        } else {
            echo "<p style='color:blue'>CYBERPAY já configurado.</p>";
        }
    }

    // Também garantir que o SiteConfig esteja setado para cyber
    DB::table('site_configs')->where('id', 1)->update(['gateway' => 'cyber']);
    echo "<p style='color:green'><b>Sucesso:</b> SiteConfig atualizado para gateway 'cyber'.</p>";

} catch (\Exception $e) {
    echo "Erro: " . $e->getMessage();
}
