<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    $rifas = DB::table('rifas')->select('id', 'title', 'status', 'show_site')->get();
    echo "<h1>Lista de Rifas no Banco</h1>";
    echo "Conexão: " . DB::connection()->getDatabaseName() . "<br><br>";
    echo "<table border='1'><tr><th>ID</th><th>Título</th><th>Status</th><th>Show Site</th></tr>";
    foreach ($rifas as $rifa) {
        echo "<tr>";
        echo "<td>{$rifa->id}</td>";
        echo "<td>{$rifa->title}</td>";
        echo "<td>{$rifa->status}</td>";
        echo "<td>{$rifa->show_site}</td>";
        echo "</tr>";
    }
    echo "</table>";

    $counts = DB::table('rifas')->select('status', DB::raw('count(*) as total'))->groupBy('status')->get();
    echo "<h2>Resumo por Status:</h2>";
    foreach ($counts as $c) {
        echo "- {$c->status}: {$c->total}<br>";
    }

} catch (\Exception $e) {
    echo "Erro: " . $e->getMessage();
}
