<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    echo "<h1>Diagnóstico Profundo de Imagens</h1>";

    // 1. Verificar rifas
    $rifas = DB::table('rifas')->get();
    echo "<h2>Tabela rifas:</h2>";
    foreach ($rifas as $rifa) {
        $img = $rifa->img ?? 'Vazio';
        echo "<p>Rifa ID: $rifa->id | Título: $rifa->title | Coluna 'img': $img ";
        if ($rifa->img) {
            $path = public_path($rifa->img);
            if (file_exists($path)) {
                echo " <span style='color:green'> [OK] </span>";
            } else {
                echo " <span style='color:red'> [ARQUIVO NÃO EXISTE EM: $path] </span>";
            }
        }
        echo "</p>";
    }

    // 2. Verificar rifa_images
    echo "<h2>Tabela rifa_images:</h2>";
    $tableNames = ['rifa_images', 'rifa_image', 'rifas_images'];
    foreach ($tableNames as $tableName) {
        if (Schema::hasTable($tableName)) {
            echo "<h3>Tabela '$tableName' encontrada:</h3>";
            $images = DB::table($tableName)->get();
            if ($images->count() == 0) {
                echo "<p>Tabela está vazia.</p>";
            }
            foreach ($images as $img) {
                $p = $img->path ?? 'N/A';
                echo "<p>Rifa ID: " . ($img->rifas_id ?? 'N/A') . " | Path: $p ";
                if ($p != 'N/A') {
                    $path = public_path($p);
                    if (file_exists($path)) {
                        echo " <span style='color:green'> [OK] </span>";
                    } else {
                        echo " <span style='color:red'> [ARQUIVO NÃO EXISTE EM: $path] </span>";
                    }
                }
                echo "</p>";
            }
        } else {
            echo "<p>Tabela '$tableName' não existe.</p>";
        }
    }

    echo "<h2>Arquivos na pasta public/img/rifas:</h2>";
    $dir = public_path('img/rifas');
    if (is_dir($dir)) {
        $files = scandir($dir);
        echo "<ul>";
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                echo "<li>$file</li>";
            }
        }
        echo "</ul>";
    }

} catch (\Exception $e) {
    echo "Erro: " . $e->getMessage();
}
