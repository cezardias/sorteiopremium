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
    $clientsCount = DB::table('clients')->count();
    $ordersCount = DB::table('rifa_pays')->count();

    echo "<h1>Diagnóstico de Dados</h1>";
    echo "Conexão: " . DB::connection()->getDatabaseName() . "<br>";
    echo "Total de Clientes: " . $clientsCount . "<br>";
    echo "Total de Pedidos: " . $ordersCount . "<br><br>";

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

    $users = DB::table('users')->select('id', 'name', 'email', 'role')->limit(5)->get();
    echo "<h2>Amostra de Usuários e Roles:</h2>";
    echo "<table border='1'><tr><th>ID</th><th>Nome</th><th>Email</th><th>Role</th></tr>";
    foreach ($users as $user) {
        echo "<tr><td>{$user->id}</td><td>{$user->name}</td><td>{$user->email}</td><td>{$user->role}</td></tr>";
    }
    echo "</table>";

} catch (\Exception $e) {
    echo "Erro: " . $e->getMessage();
}
