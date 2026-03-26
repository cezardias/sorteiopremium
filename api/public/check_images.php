<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    echo "<h1>Verificação de Imagens de Rifas</h1>";

    $rifas = DB::table('rifas')->get();

    foreach ($rifas as $rifa) {
        echo "<h3>Rifa ID: $rifa->id - $rifa->title</h3>";
        
        // Verificar campos possíveis de imagem
        $imageFields = ['image', 'favicon', 'capa']; 
        // Vou listar todas as colunas para ter certeza
        $columns = (array)$rifa;
        
        foreach ($columns as $col => $value) {
            if (stripos($col, 'image') !== false || stripos($col, 'img') !== false || stripos($col, 'capa') !== false || stripos($col, 'foto') !== false) {
                echo "<p>Campo <b>$col</b>: $value ";
                
                if ($value) {
                    $path = public_path($value);
                    if (file_exists($path)) {
                        echo " <span style='color:green'> [ARQUIVO EXISTE] </span>";
                    } else {
                        echo " <span style='color:red'> [ARQUIVO NÃO ENCONTRADO EM: $path] </span>";
                    }
                }
                echo "</p>";
            }
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
    } else {
        echo "<p style='color:red'>Diretório $dir não existe!</p>";
    }

} catch (\Exception $e) {
    echo "Erro: " . $e->getMessage();
}
