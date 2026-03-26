<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    echo "<h1>Conserto de Caminhos de Imagem e Schema</h1>";

    // 1. Adicionar coluna 'img' na tabela 'rifas' se não existir
    if (!Schema::hasColumn('rifas', 'img')) {
        echo "<p>Adicionando coluna <b>img</b> na tabela <b>rifas</b>...</p>";
        Schema::table('rifas', function (Blueprint $table) {
            $table->string('img')->nullable()->after('video');
        });
        echo "<p style='color:green'>Coluna 'img' adicionada!</p>";
    } else {
        echo "<p>Coluna 'img' já existe na tabela 'rifas'.</p>";
    }

    // 2. Corrigir caminhos na tabela 'rifa_images'
    if (Schema::hasTable('rifa_images')) {
        echo "<p>Corrigindo caminhos na tabela <b>rifa_images</b>...</p>";
        $images = DB::table('rifa_images')->get();
        foreach ($images as $img) {
            if ($img->path && strpos($img->path, 'img/rifas/') === false && strpos($img->path, 'http') === false) {
                $newPath = 'img/rifas/' . ltrim($img->path, '/');
                DB::table('rifa_images')->where('id', $img->id)->update(['path' => $newPath]);
                echo "<li>ID {$img->id}: path atualizado para $newPath</li>";
            }
        }
    }

    // 3. Sincronizar a primeira imagem para a coluna 'img' das rifas
    echo "<p>Sincronizando imagens para a tabela <b>rifas</b>...</p>";
    $rifas = DB::table('rifas')->get();
    foreach ($rifas as $rifa) {
        $firstImage = DB::table('rifa_images')->where('rifas_id', $rifa->id)->first();
        if ($firstImage && empty($rifa->img)) {
            DB::table('rifas')->where('id', $rifa->id)->update(['img' => $firstImage->path]);
            echo "<li>Rifa {$rifa->id}: 'img' configurada como {$firstImage->path}</li>";
        }
    }

    echo "<p style='color:green'><b>Sucesso!</b> Verifique o Dashboard agora.</p>";

} catch (\Exception $e) {
    echo "<p style='color:red'>Erro: " . $e->getMessage() . "</p>";
}
