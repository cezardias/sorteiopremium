<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Hash;
use App\Models\User;

Route::get('/reset-admin-pwd', function () {
    try {
        $user = User::where('email', 'premiummultimarcasrifa@gmail.com')->first();
        if (!$user) {
            return "Usuário não encontrado.";
        }
        $user->password = Hash::make('Premiummultirifa123');
        $user->save();
        return "Senha do dashboard restaurada com sucesso para o usuário: " . $user->email;
    } catch (\Throwable $e) {
        return "Erro ao restaurar senha: " . $e->getMessage();
    }
});

Route::get('/test-sanity', function () {
    return "Laravel is alive!";
});

Route::group(['prefix' => 'client', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::post("/cadastro", "AuthController@register")->name('client.register');
    Route::post("/login", "AuthController@login")->name('client.login');
    Route::get("/login", "AuthController@logar")->name('login');
    Route::middleware('auth.client')->post("/logout", "AuthController@logout")->name('client.logout');
    Route::middleware('auth.client')->get("/checkout/pedido/{id}", "RifasController@getCompra")->where([
        'id' =>
            '[0-9]+'
    ])->name('checkout.pedido');
    Route::middleware('auth.client')->get("/meus-pedidos/sorteios/{id}", "RifasController@getCompraClient")->where([
        'id' =>
            '[0-9]+'
    ])->name('client.pedidos');
});

Route::group(['prefix' => 'admin', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::post("/user/register", "AdminController@storeUser")->name('admin.create.user');
    Route::post("/user/login", "AdminController@login")->name('admin.login.user');
    Route::middleware('auth:sanctum')->post("/user/logout", "AdminController@logout")->name('admin.logout.user');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/todas-rifas",
        "RifasController@getAllRifasAdmin"
    )->name('admin.all.rifas');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/todas-rifas/filtro",
        "RifasController@getAllRifasAdminFiltro"
    )->name('admin.all.rifas');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        '/dashboard/cliente/deletar/{id}',
        'AdminController@deletarCliente'
    )->name('admin.cliente.deletar');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        '/dashboard/deletar/pedido/{id}',
        'AdminController@deletarPedido'
    );

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/rifas/cadastrar",
        "RifasController@storeRifa"
    )->name('admin.create.rifa');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/rifa/editar/{id}",
        "RifasController@getOneRifa"
    )->name('admin.get.edit.rifa');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/rifa/editar/{id}",
        "RifasController@editRifa"
    )->name('admin.edit.rifa');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/rifa/excluir/{id}",
        "RifasController@excluirRifa"
    )->name('admin.excluit.rifa');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/send-messages/whats",
        "AdminController@sendMessagesWhats"
    )->name('admin.send.messages.whats');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/bilhete-premiado/cadastrar",
        "RifasController@storeBilhetePremiado"
    )->name('admin.create.rifa.bilhete-premiado');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/bilhete-premiado/all/{id}",
        "RifasController@getAllBilhetePremiado"
    )->name('admin.get.rifa.bilhete-premiado');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/bilhete-premiado/filtro/{id}",
        "RifasController@getBilhetePremiadoFiltro"
    )->name('admin.get.rifa.bilhete-premiado');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/bilhete-premiado/editar/{id}",
        "RifasController@getOneBilhetePremiado"
    )->name('admin.get.rifa.bilhete-premiado');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/bilhete-premiado/editar",
        "RifasController@editarBilhetePremiado"
    )->name('admin.get.rifa.bilhete-premiado');
    Route::middleware([
        'auth:sanctum',
        'checkAdmin:admin,superadmin'
    ])->delete(
            "/dashboard/bilhete-premiado/delete/{id}/{rifaId}",
            "RifasController@destroyBilhetePremiado"
        )->name('admin.delete.rifa.bilhete-premiado');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/todos-pacotes/{id}",
        "RifasController@getAllPacotes"
    )->name('admin.pacote');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/pacote/{id}",
        "RifasController@getOnePacotes"
    )->name('admin.pacote');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/pacote/cadastrar",
        "RifasController@storePacote"
    )->name('admin.create.rifa.pacote');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/pacote/filtro/{id}",
        "RifasController@filtroPacotes"
    )->name('admin.create.rifa.pacote');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/pacotes/editar",
        "RifasController@editarPacote"
    )->name('admin.create.rifa.pacote');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->delete(
        "/dashboard/pacotes/deletar/{id}",
        "RifasController@deletePacote"
    )->name('admin.create.rifa.pacote');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/rifa/imagens/{id}",
        "RifasController@getImagens"
    )->name('admin.pegar.rifa.imagem');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/rifa/imagens/cadastrar",
        "RifasController@storeImagem"
    )->name('admin.create.rifa.imagem');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->delete(
        "/dashboard/rifa/imagens/deletar/{id}/",
        "RifasController@destroyImagem"
    )->where(['id' => '[0-9]+'])->name('admin.deletar.rifa.imagem');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/upsell/{id}",
        "RifasController@getUpsellRifa"
    )->name('admin.get.rifa.upsell');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/upsell/cadastrar",
        "RifasController@storeUpsell"
    )->name('admin.create.rifa.upsell');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/rifa/finalizar/{id}",
        "RifasController@finalizarRifa"
    )->name('admin.finalizar.rifa');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/rifa/ativar/{id}",
        "RifasController@ativarRifa"
    )->name('admin.ativar.rifa');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/me",
        "AdminController@me"
    )->name('admin.me.user');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/client/procurar/pelo-telefone",
        "AdminController@procurarClientCellphone"
    )->name('admin.procurar.client.celular');
    Route::middleware([
        'auth:sanctum',
        'checkAdmin:admin,superadmin'
    ])->post(
            "/dashboard/rifa/procurar-numero-premiado/procurar-ganhador",
            "AdminController@procurarGanhadorPeloNumero"
        )->name('admin.procurar.ganhador');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/rifa/definir-ganhador",
        "AdminController@definirGanhador"
    )->name('admin.definir.ganhador');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/cadastrar/ganhador/{id}",
        "AdminController@getOneGanhador"
    )->name('admin.pegar.um.ganhador');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/cadastrar/ganhador",
        "AdminController@cadastrarGanhador"
    )->name('admin.cadastrar.ganhador');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/editar/ganhador",
        "AdminController@editarGanhador"
    )->name('admin.editar.ganhador');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->delete(
        "/dashboard/delete/ganhador/{id}",
        "AdminController@destroyGanhador"
    )->name('admin.delete.ganhador');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/client/rifa/adicionar-numero",
        "AdminController@adicionarNumerosRifas"
    )->name('admin.adicionar.numero');
    Route::middleware([
        'auth:sanctum',
        'checkAdmin:admin,superadmin'
    ])->post(
            "/dashboard/client/rifa/adicionar/bilhete-premiado",
            "AdminController@adicionarBilhetePremiado"
        )->name('admin.adicionar.bilhete.premiado');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/client/rifa/ativas",
        "AdminController@rifaAtivas"
    )->name('admin.adicionar.bilhete.premiado');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/consulta-cota/{id}",
        "AdminController@consultaCota"
    )->name('admin.adicionar.bilhete.premiado');
    Route::middleware([
        'auth:sanctum',
        'checkAdmin:admin,superadmin'
    ])->post(
            "/dashboard/consulta-cota/consulta-cota/min-max",
            "AdminController@consultaCotaMinAndMax"
        )->name('admin.adicionar.bilhete.premiado.min.max');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/pedidos",
        "AdminController@getPedidos"
    )->name('admin.pedidos');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        '/dashboard/rifas/{rifas_id}/filtro',
        "AdminController@filtroRifas"
    )->name('admin.filtro.rifas');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/pedidos/filtro",
        "AdminController@getPedidosFiltro"
    )->name('admin.pedidos');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/pedido/{idRifa}/{idClient}",
        "AdminController@getOnePedidos"
    )->name('admin.one.pedidos');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/deletar/pedido/{id}",
        "AdminController@cancelarPedidos"
    )->name('admin.cancelar.pedidos');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/aprovar/pedido/{id}",
        "AdminController@aprovarPedidos"
    )->name('admin.aprovar.pedidos');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/todos/clientes",
        "AdminController@allClients"
    )->name('admin.todos.clientes');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/todos/clientes/filtro",
        "AdminController@allClientsFiltro"
    )->name('admin.filtro.clientes');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/editar/cliente",
        "AdminController@editarClients"
    )->name('admin.editar.cliente');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/ranking-geral",
        "AdminController@rankingGeral"
    )->name('admin.ranking.cliente');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/ranking-geral/filtro",
        "AdminController@rankingGeralFiltro"
    )->name('admin.ranking.cliente');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/todos/usuarios",
        "AdminController@getAllUsers"
    )->name('admin.usuarios');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/todos/usuarios/filtro",
        "AdminController@getAllUsersFiltro"
    )->name('admin.usuarios');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/usuario/{id}",
        "AdminController@getOneUser"
    )->name('admin.usuarios');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/usuarios/editar",
        "AdminController@editarUsers"
    )->name('admin.editar.usuarios');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->delete(
        "/dashboard/usuarios/deletar/{id}",
        "AdminController@destroyUser"
    )->name('admin.editar.usuarios');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/payment",
        "AdminController@getAllGateway"
    )->name('admin.get.gateway');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/payment/{id}",
        "AdminController@showGateway"
    )->name('admin.get.one.gateway');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/payment/make",
        "AdminController@storeGateway"
    )->name('admin.make.gateway');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/payment/update",
        "AdminController@updateGateway"
    )->name('admin.editar.gateway');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->delete(
        "/dashboard/payment/delete",
        "AdminController@destroyGateway"
    )->name('admin.editar.gateway');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/site-settings/editar",
        "AdminController@storeConfigSite"
    )->name('admin.edit.site-config');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/vendas",
        "AdminController@getVendas"
    )->name('admin.get.vendas');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/vendas/filtro",
        "AdminController@vendasFiltro"
    )->name('admin.filtro.vendas');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/one/venda/{id}",
        "AdminController@getOneVendas"
    )->name('admin.one.vendas');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/one/venda/filtro/{id}",
        "AdminController@vendasFiltroOne"
    )->name('admin.filtro.one.vendas');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/afiliado/create",
        "AdminController@createAfiliado"
    )->name('admin.create.afiliado');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/todos/afiliados/",
        "AdminController@getAllAfiliado"
    )->name('admin.get.all.afiliados');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/one/afiliado/{id}",
        "AdminController@getOneAfiliado"
    )->name('admin.get.one.afiliado');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->get(
        "/dashboard/one/afiliado/produto/{idProduto}",
        "AdminController@getOneAfiliadoByProduto"
    )->name('admin.get.one.afiliado.by.produto');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->put(
        "/dashboard/afiliado/update/{id}",
        "AdminController@afiliadoUpdate"
    )->name('admin.update.afiliado');
    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->post(
        "/dashboard/afiliado/filtro/",
        "AdminController@afiliadoFiltro"
    )->name('admin.filtro.afiliado');
});

Route::group(['prefix' => 'produtos', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::get("/", "RifasController@allRifas")->name('all.rifas');
    Route::get("/{slug}/{id}/{afiliadoId?}", "RifasController@show")->where([
        'slug' => '[a-zA-Z0-9\-_]+',
        'id' =>
            '[0-9]+'
    ])->name('show.one.rifa');
    Route::get("/todos/ganhadores", "RifasController@getAllWinners")->name('admin.pegar.ganhador');

    Route::post('compra-rifas/{id?}', 'CyberPaymentController@buyRifa')->name('buy.rifa');
    Route::get('compra-rifas-status/{id}', 'CyberPaymentController@checkStatus');
    Route::get("/payment-status/{paymentId}", "RifasController@checkPaymentStatus")->name('check.pagamento.rifa');
});

Route::group(['namespace' => 'App\Http\Controllers\V1'], function () {
    Route::get("/index", "RifasController@index")->name('index');
    Route::get("/get-all-numeros-premiados/{id}", "RifasController@getNumerosPremiados");

    Route::get("/dashboard/site-settings", "AdminController@getConfigSite")->name('admin.get.site-config');
});


Route::group(['prefix' => 'public-rifas', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::get("/latest", "RifasController@latest");
    Route::get("/latest-winner", "RifasController@getLatestWinner");
});


Route::post('client/update-profile', 'App\Http\Controllers\V1\ClientController@updateProfile');
Route::get('client/pedidos', 'App\Http\Controllers\V1\ClientController@getNumbers');
Route::post("/get-numbers", 'App\Http\Controllers\V1\ClientController@getNumbers');

Route::get("/config", "App\Http\Controllers\V1\SiteConfigController@getUserSiteConfig");

Route::post("/pix", [\App\Http\Controllers\V1\CyberPaymentController::class, "buyRifa"]); // Redirecionamento de segurança
Route::post('cyber-webhook', [\App\Http\Controllers\V1\CyberPaymentController::class, 'webhook']);


// routes/api.php
Route::get('/rifas/{rifa}/rewards/config', 'App\Http\Controllers\RewardPublicController@config');

Route::group(['middleware' => 'auth.client', 'namespace' => 'App\Http\Controllers'], function () {
    Route::get('/rifas/{rifa}/rewards/balances', 'RewardPublicController@balances');
    Route::get('/rifas/{rifa}/rewards/summary', 'RewardPublicController@summary');
    Route::post('/rifas/{rifa}/rewards/{type}/redeem', 'RewardPublicController@redeem');
});

// Admin
Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->group(function () {
    Route::get('/admin/rewards/{rifa}', 'App\Http\Controllers\RewardAdminController@show');
    Route::post('/admin/rewards/{rifa}', 'App\Http\Controllers\RewardAdminController@store');
});

Route::get('/db-debug', function () {
    try {
        $tables = DB::getSchemaBuilder()->getTableListing();
        $output = [];

        foreach ($tables as $tableName) {
            try {
                $columns = DB::select("SHOW COLUMNS FROM $tableName");
                $output[$tableName] = $columns;
            } catch (\Exception $colError) {
                $output[$tableName] = "Erro ao ler colunas: " . $colError->getMessage();
            }
        }

        return response()->json([
            "success" => true,
            "message" => "Conexão com banco de dados OK!",
            "database" => DB::getDatabaseName(),
            "tables_count" => count($output),
            "schema" => $output
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            "success" => false,
            "error_type" => get_class($e),
            "msg" => "Erro fatal: " . $e->getMessage(),
            "file" => $e->getFile(),
            "line" => $e->getLine()
        ], 500);
    }
});

Route::get('/run-migrations', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        return "Migrations executadas com sucesso: " . Artisan::output();
    } catch (\Exception $e) {
        return "Erro ao rodar migrations: " . $e->getMessage();
    }
});
Route::get('/clear-cache', function () {
    try {
        Artisan::call('cache:clear');
        Artisan::call('route:clear');
        Artisan::call('config:clear');
        Artisan::call('view:clear');
        return response()->json([
            "success" => true,
            "msg" => "Caches limpos com sucesso!",
            "output" => Artisan::output()
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            "success" => false,
            "msg" => "Erro ao limpar cache: " . $e->getMessage()
        ], 500);
    }
});

Route::get('/php-info', function () {
    phpinfo();
});