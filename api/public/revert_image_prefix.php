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
    echo "<h1>Removendo Fator de Duplicidade (img/rifas/)</h1>";

    // 1. Corrigir rifa_images
    if (Schema::hasTable('rifa_images')) {
        $images = DB::table('rifa_images')->get();
        foreach ($images as $img) {
            if (strpos($img->path, 'img/rifas/') === 0) {
                $newPath = str_replace('img/rifas/', '', $img->path);
                DB::table('rifa_images')->where('id', $img->id)->update(['path' => $newPath]);
                echo "<p>Tabela rifa_images: ID {$img->id} -> $newPath</p>";
            }
        }
    }

    // 2. Corrigir rifas
    if (Schema::hasTable('rifas')) {
        $rifas = DB::table('rifas')->get();
        foreach ($rifas as $rifa) {
            if ($rifa->img && strpos($rifa->img, 'img/rifas/') === 0) {
                $newPath = str_replace('img/rifas/', '', $rifa->img);
                DB::table('rifas')->where('id', $rifa->id)->update(['img' => $newPath]);
                echo "<p>Tabela rifas: ID {$rifa->id} -> $newPath</p>";
            }
        }
    }

    echo "<p style='color:green'><b>Reparo Concluído!</b> As imagens devem carregar agora.</p>";

} catch (\Exception $e) {
    echo "Erro: " . $e->getMessage();
}
