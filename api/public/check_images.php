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
    echo "<h1>Diagnóstico de Estrutura e Imagens</h1>";

    // 1. Verificar colunas de 'rifas'
    echo "<h2>Colunas na tabela 'rifas':</h2>";
    $columns = Schema::getColumnListing('rifas');
    echo "<ul>";
    foreach ($columns as $column) {
        echo "<li>$column</li>";
    }
    echo "</ul>";

    // 2. Verificar dados das rifas sem assumir colunas
    $rifas = DB::table('rifas')->get();
    echo "<h2>Dados da tabela 'rifas':</h2>";
    foreach ($rifas as $rifa) {
        echo "<h3>Rifa ID: $rifa->id - $rifa->title</h3>";
        echo "<pre>" . print_r($rifa, true) . "</pre>";
    }

    // 3. Verificar rifa_images thoroughly
    echo "<h2>Tabelas de Imagem Relacionadas:</h2>";
    $tableNames = ['rifa_images', 'rifa_image', 'rifas_images'];
    foreach ($tableNames as $tableName) {
        if (Schema::hasTable($tableName)) {
            echo "<h3>Conteúdo da tabela '$tableName':</h3>";
            $images = DB::table($tableName)->get();
            if ($images->count() == 0) {
                echo "<p>Vazia.</p>";
            }
            foreach ($images as $img) {
                echo "<pre>" . print_r($img, true) . "</pre>";
                if (isset($img->path)) {
                    $path = public_path($img->path);
                    if (file_exists($path)) {
                        echo "<p style='color:green'>Arquivo EXISTE em $path</p>";
                    } else {
                        echo "<p style='color:red'>Arquivo NÃO EXISTE em $path</p>";
                    }
                }
            }
        }
    }

} catch (\Exception $e) {
    echo "Erro: " . $e->getMessage();
}
