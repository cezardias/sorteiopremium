<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    echo "<h1>Verificação de Configurações do Site</h1>";

    $tables = ['site_settings', 'site_configs', 'rifas', 'payment_info', 'users'];

    foreach ($tables as $table) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            echo "<p>Tabela <b>$table</b>: $count registros</p>";
            if ($count > 0) {
                $sample = DB::table($table)->first();
                echo "<pre>" . print_r($sample, true) . "</pre>";
            } else {
                echo "<p style='color:red'>Tabela <b>$table</b> está VAZIA!</p>";
            }
        } else {
            echo "<p style='color:red'>Tabela <b>$table</b> NÃO EXISTE!</p>";
        }
    }

} catch (\Exception $e) {
    echo "Erro: " . $e->getMessage();
}
