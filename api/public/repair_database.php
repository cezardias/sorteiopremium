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
    echo "<h1>Reparo Geral do Banco de Dados</h1>";

    // 1. Corrigir/Criar tabela site_config (Singular)
    if (!Schema::hasTable('site_config')) {
        echo "<p>Criando tabela <b>site_config</b>...</p>";
        Schema::create('site_config', function (Blueprint $table) {
            $table->id();
            $table->string('meta_pixel')->nullable();
            $table->string('instagram_link')->nullable();
            $table->string('whatsapp_link')->nullable();
            $table->string('url_logo_site')->nullable();
            $table->string('url_favicon_site')->nullable();
            $table->string('site_name')->nullable();
            $table->string('plataform_name')->nullable();
            $table->string('gateway')->default('cyber');
            $table->string('cyber_public_key')->nullable();
            $table->string('cyber_secret_key')->nullable();
            $table->timestamps();
        });
        echo "<p style='color:green'>Tabela <b>site_config</b> criada com sucesso!</p>";
    } else {
        echo "<p>Tabela <b>site_config</b> já existe.</p>";
    }

    // 2. Garantir que exista um registro id=1 em site_config
    $configCount = DB::table('site_config')->where('id', 1)->count();
    if ($configCount == 0) {
        echo "<p>Inserindo registro padrão em <b>site_config</b>...</p>";
        DB::table('site_config')->insert([
            'id' => 1,
            'gateway' => 'cyber',
            'cyber_public_key' => env('CYBER_PAYMENT_PUBLIC_KEY'),
            'cyber_secret_key' => env('CYBER_PAYMENT_SECRET_KEY'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "<p style='color:green'>Registro padrão inserido!</p>";
    } else {
        echo "<p>Atualizando CyberPay em <b>site_config</b>...</p>";
        DB::table('site_config')->where('id', 1)->update([
            'gateway' => 'cyber',
            'cyber_public_key' => env('CYBER_PAYMENT_PUBLIC_KEY'),
            'cyber_secret_key' => env('CYBER_PAYMENT_SECRET_KEY'),
            'updated_at' => now(),
        ]);
    }

    // 3. Garantir que site_settings tenha os dados básicos (título do site, etc)
    $settings = DB::table('site_settings')->where('id', 1)->first();
    if ($settings) {
        echo "<p>Atualizando <b>site_settings</b>...</p>";
        DB::table('site_settings')->where('id', 1)->update([
            'site_title' => 'Sorteio Premium MultiMarca',
            'footer_company' => 'Sorteio Premium MultiMarca',
            'product_title' => 'Sorteio Premium MultiMarca',
            'updated_at' => now(),
        ]);
        echo "<p style='color:green'>site_settings atualizado!</p>";
    }

    // 4. Corrigir gateway na tabela payment_info (já deve estar certo, mas não custa garantir)
    DB::table('payment_info')->where('gateway', 'PAGGUE')->update([
        'gateway' => 'CYBERPAY',
        'name' => 'CYBERPAY',
        'public_key' => env('CYBER_PAYMENT_PUBLIC_KEY'),
        'api_client_id' => env('CYBER_PAYMENT_SECRET_KEY'),
    ]);
    echo "<p style='color:green'><b>Reparo Concluído!</b> Tente atualizar o Dashboard agora.</p>";

} catch (\Exception $e) {
    echo "<p style='color:red'>Erro fatal: " . $e->getMessage() . "</p>";
}
