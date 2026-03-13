<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\V1\RifaPay;
use App\Models\V1\RifaNumber;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Diagnóstico e Recuperação ---

Route::get('/test-sanity', function () {
    return "Laravel is alive!";
});

Route::get('/reset-admin-pwd', function () {
    try {
        $user = User::where('email', 'premiummultimarcasrifa@gmail.com')->first();
        if (!$user)
            return "Usuário não encontrado.";
        $user->password = 'Premiummultirifa123';
        $user->save();
        return response()->json(["message" => "Senha atualizada.", "email" => $user->email]);
    } catch (\Throwable $e) {
        return "Erro: " . $e->getMessage();
    }
});

Route::get('/debug-payments', function () {
    try {
        $payments = RifaPay::whereNotNull('pix_id')
            ->orderBy('id', 'desc')
            ->take(50)
            ->get(['id', 'pix_id', 'status', 'created_at']);
        return response()->json($payments);
    } catch (\Throwable $e) {
        return response()->json(["error" => $e->getMessage(), "trace" => $e->getTraceAsString()], 500);
    }
});

Route::get('/recovery-payments', function () {
    try {
        $txns = [
            'txn_69b0e457322e3dad9a7b58dfb4970',
            'txn_69b01d21754cd232c3a5ea3c9b36e',
            'txn_69af73d56132b92249048d883fa52',
            'txn_69af42c00086c6b3aabf5a4129696',
            'txn_69af0eae1fc5c45629e6a999af66c',
            'txn_69adb4700c158dbe2ee34a7f11b15',
            'txn_69ac19031c100de6165403bab97b8',
            'txn_69ac18261e287c53bad1a938e9ae6'
        ];

        $results = [];

        // 1. Recuperação Manual
        foreach ($txns as $txnId) {
            $pay = RifaPay::where('pix_id', $txnId)->first();
            if ($pay) {
                $pay->update(['status' => 1, 'verify' => 1]);
                RifaNumber::where('pay_id', $pay->id)->update(['status' => 1]);
                if (class_exists(\App\Services\RewardPassService::class)) {
                    \App\Services\RewardPassService::grantFromApprovedPayment($pay);
                }
                $results[] = "Manual: #{$pay->id} ($txnId) restaurado.";
            }
        }

        // 2. Auto Recuperação - Apenas se tiver pix_id e estiver cancelado (status 2)
        $autoRecover = RifaPay::whereNotNull('pix_id')
            ->where('status', 2)
            ->where('created_at', '>=', now()->subDays(7))
            ->get();

        foreach ($autoRecover as $pay) {
            $pay->update(['status' => 1, 'verify' => 1]);
            RifaNumber::where('pay_id', $pay->id)->update(['status' => 1]);
            if (class_exists(\App\Services\RewardPassService::class)) {
                \App\Services\RewardPassService::grantFromApprovedPayment($pay);
            }
            $results[] = "Auto: #{$pay->id} ({$pay->pix_id}) restaurado.";
        }

        return response()->json([
            "message" => "Recuperação concluída.",
            "count" => count($results),
            "log" => $results
        ]);
    } catch (\Throwable $e) {
        return response()->json(["error" => $e->getMessage(), "line" => $e->getLine()], 500);
    }
});

Route::get('/db-debug', function () {
    try {
        return response()->json([
            "success" => true,
            "database" => DB::getDatabaseName(),
            "tables" => DB::select('SHOW TABLES')
        ]);
    } catch (\Throwable $e) {
        return response()->json(["error" => $e->getMessage()], 500);
    }
});

Route::get('/clear-cache', function () {
    try {
        Artisan::call('cache:clear');
        Artisan::call('route:clear');
        Artisan::call('config:clear');
        Artisan::call('view:clear');
        return "Tudo limpo!";
    } catch (\Throwable $e) {
        return "Erro: " . $e->getMessage();
    }
});

Route::get('/php-info', function () {
    phpinfo();
});

// --- Rotas da Aplicação ---

Route::group(['prefix' => 'client', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::post("/cadastro", "AuthController@register")->name('client.register');
    Route::post("/login", "AuthController@login")->name('client.login');
    Route::get("/login", "AuthController@logar")->name('login');
    Route::middleware('auth.client')->post("/logout", "AuthController@logout")->name('client.logout');
    Route::middleware('auth.client')->get("/checkout/pedido/{id}", "RifasController@getCompra")->where(['id' => '[0-9]+'])->name('checkout.pedido');
    Route::middleware('auth.client')->get("/meus-pedidos/sorteios/{id}", "RifasController@getCompraClient")->where(['id' => '[0-9]+'])->name('client.pedidos');
});

Route::group(['prefix' => 'admin', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::post("/user/register", "AdminController@storeUser")->name('admin.create.user');
    Route::post("/user/login", "AdminController@login")->name('admin.login.user');
    Route::middleware('auth:sanctum')->post("/user/logout", "AdminController@logout")->name('admin.logout.user');

    Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->group(function () {
        Route::get("/dashboard/todas-rifas", "RifasController@getAllRifasAdmin");
        Route::post("/dashboard/todas-rifas/filtro", "RifasController@getAllRifasAdminFiltro");
        Route::post('/dashboard/cliente/deletar/{id}', 'AdminController@deletarCliente');
        Route::post('/dashboard/deletar/pedido/{id}', 'AdminController@deletarPedido');
        Route::post("/dashboard/rifas/cadastrar", "RifasController@storeRifa");
        Route::get("/dashboard/rifa/editar/{id}", "RifasController@getOneRifa");
        Route::put("/dashboard/rifa/editar/{id}", "RifasController@editRifa");
        Route::put("/dashboard/rifa/excluir/{id}", "RifasController@excluirRifa");
        Route::post("/dashboard/send-messages/whats", "AdminController@sendMessagesWhats");

        // Bilhetes Premiados
        Route::post("/dashboard/bilhete-premiado/cadastrar", "RifasController@storeBilhetePremiado");
        Route::get("/dashboard/bilhete-premiado/all/{id}", "RifasController@getAllBilhetePremiado");
        Route::post("/dashboard/bilhete-premiado/filtro/{id}", "RifasController@getBilhetePremiadoFiltro");
        Route::get("/dashboard/bilhete-premiado/editar/{id}", "RifasController@getOneBilhetePremiado");
        Route::put("/dashboard/bilhete-premiado/editar", "RifasController@editarBilhetePremiado");
        Route::delete("/dashboard/bilhete-premiado/delete/{id}/{rifaId}", "RifasController@destroyBilhetePremiado");

        // Pacotes
        Route::get("/dashboard/todos-pacotes/{id}", "RifasController@getAllPacotes");
        Route::get("/dashboard/pacote/{id}", "RifasController@getOnePacotes");
        Route::post("/dashboard/pacote/cadastrar", "RifasController@storePacote");
        Route::post("/dashboard/pacote/filtro/{id}", "RifasController@filtroPacotes");
        Route::put("/dashboard/pacotes/editar", "RifasController@editarPacote");
        Route::delete("/dashboard/pacotes/deletar/{id}", "RifasController@deletePacote");

        // Imagens e Upsell
        Route::get("/dashboard/rifa/imagens/{id}", "RifasController@getImagens");
        Route::post("/dashboard/rifa/imagens/cadastrar", "RifasController@storeImagem");
        Route::delete("/dashboard/rifa/imagens/deletar/{id}/", "RifasController@destroyImagem");
        Route::get("/dashboard/upsell/{id}", "RifasController@getUpsellRifa");
        Route::post("/dashboard/upsell/cadastrar", "RifasController@storeUpsell");

        // Status Rifa
        Route::put("/dashboard/rifa/finalizar/{id}", "RifasController@finalizarRifa");
        Route::put("/dashboard/rifa/ativar/{id}", "RifasController@ativarRifa");

        Route::get("/me", "AdminController@me");

        // Clientes e Ganhadores
        Route::post("/dashboard/client/procurar/pelo-telefone", "AdminController@procurarClientCellphone");
        Route::post("/dashboard/rifa/procurar-numero-premiado/procurar-ganhador", "AdminController@procurarGanhadorPeloNumero");
        Route::post("/dashboard/rifa/definir-ganhador", "AdminController@definirGanhador");
        Route::get("/dashboard/cadastrar/ganhador/{id}", "AdminController@getOneGanhador");
        Route::post("/dashboard/cadastrar/ganhador", "AdminController@cadastrarGanhador");
        Route::put("/dashboard/editar/ganhador", "AdminController@editarGanhador");
        Route::delete("/dashboard/delete/ganhador/{id}", "AdminController@destroyGanhador");

        // Numeros
        Route::post("/dashboard/client/rifa/adicionar-numero", "AdminController@adicionarNumerosRifas");
        Route::post("/dashboard/client/rifa/adicionar/bilhete-premiado", "AdminController@adicionarBilhetePremiado");
        Route::get("/dashboard/client/rifa/ativas", "AdminController@rifaAtivas");
        Route::get("/dashboard/consulta-cota/{id}", "AdminController@consultaCota");
        Route::post("/dashboard/consulta-cota/consulta-cota/min-max", "AdminController@consultaCotaMinAndMax");

        // Pedidos
        Route::get("/dashboard/pedidos", "AdminController@getPedidos");
        Route::post('/dashboard/rifas/{rifas_id}/filtro', "AdminController@filtroRifas");
        Route::post("/dashboard/pedidos/filtro", "AdminController@getPedidosFiltro");
        Route::get("/dashboard/pedido/{idRifa}/{idClient}", "AdminController@getOnePedidos");
        Route::put("/dashboard/deletar/pedido/{id}", "AdminController@cancelarPedidos");
        Route::put("/dashboard/aprovar/pedido/{id}", "AdminController@aprovarPedidos");

        // Config e Vendas
        Route::get("/dashboard/todos/clientes", "AdminController@allClients");
        Route::post("/dashboard/todos/clientes/filtro", "AdminController@allClientsFiltro");
        Route::put("/dashboard/editar/cliente", "AdminController@editarClients");
        Route::get("/dashboard/ranking-geral", "AdminController@rankingGeral");
        Route::post("/dashboard/ranking-geral/filtro", "AdminController@rankingGeralFiltro");
        Route::get("/dashboard/todos/usuarios", "AdminController@getAllUsers");
        Route::post("/dashboard/todos/usuarios/filtro", "AdminController@getAllUsersFiltro");
        Route::get("/dashboard/usuario/{id}", "AdminController@getOneUser");
        Route::put("/dashboard/usuarios/editar", "AdminController@editarUsers");
        Route::delete("/dashboard/usuarios/deletar/{id}", "AdminController@destroyUser");

        // Gateway
        Route::get("/dashboard/payment", "AdminController@getAllGateway");
        Route::get("/dashboard/payment/{id}", "AdminController@showGateway");
        Route::post("/dashboard/payment/make", "AdminController@storeGateway");
        Route::put("/dashboard/payment/update", "AdminController@updateGateway");
        Route::delete("/dashboard/payment/delete", "AdminController@destroyGateway");

        Route::post("/dashboard/site-settings/editar", "AdminController@storeConfigSite");
        Route::get("/dashboard/vendas", "AdminController@getVendas");
        Route::post("/dashboard/vendas/filtro", "AdminController@vendasFiltro");
        Route::get("/dashboard/one/venda/{id}", "AdminController@getOneVendas");
        Route::post("/dashboard/one/venda/filtro/{id}", "AdminController@vendasFiltroOne");

        // Afiliados
        Route::post("/dashboard/afiliado/create", "AdminController@createAfiliado");
        Route::get("/dashboard/todos/afiliados/", "AdminController@getAllAfiliado");
        Route::get("/dashboard/one/afiliado/{id}", "AdminController@getOneAfiliado");
        Route::get("/dashboard/one/afiliado/produto/{idProduto}", "AdminController@getOneAfiliadoByProduto");
        Route::put("/dashboard/afiliado/update/{id}", "AdminController@afiliadoUpdate");
        Route::post("/dashboard/afiliado/filtro/", "AdminController@afiliadoFiltro");
    });
});

Route::group(['prefix' => 'produtos', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::get("/", "RifasController@allRifas")->name('all.rifas');
    Route::get("/{slug}/{id}/{afiliadoId?}", "RifasController@show")->where(['slug' => '[a-zA-Z0-9\-_]+', 'id' => '[0-9]+'])->name('show.one.rifa');
    Route::get("/todos/ganhadores", "RifasController@getAllWinners");
    Route::post('compra-rifas/{id?}', 'CyberPaymentController@buyRifa');
    Route::get('compra-rifas-status/{id}', 'CyberPaymentController@checkStatus');
    Route::get("/payment-status/{paymentId}", "RifasController@checkPaymentStatus");
});

Route::group(['namespace' => 'App\Http\Controllers\V1'], function () {
    Route::get("/index", "RifasController@index");
    Route::get("/get-all-numeros-premiados/{id}", "RifasController@getNumerosPremiados");
    Route::get("/dashboard/site-settings", "AdminController@getConfigSite");
});

Route::group(['prefix' => 'public-rifas', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::get("/latest", "RifasController@latest");
    Route::get("/latest-winner", "RifasController@getLatestWinner");
});

Route::post('client/update-profile', 'App\Http\Controllers\V1\ClientController@updateProfile');
Route::get('client/pedidos', 'App\Http\Controllers\V1\ClientController@getNumbers');
Route::post("/get-numbers", 'App\Http\Controllers\V1\ClientController@getNumbers');
Route::get("/config", "App\Http\Controllers\V1\SiteConfigController@getUserSiteConfig");
Route::post("/pix", [\App\Http\Controllers\V1\CyberPaymentController::class, "buyRifa"]);
Route::post('cyber-webhook', [\App\Http\Controllers\V1\CyberPaymentController::class, 'webhook']);

// Rewards
Route::get('/rifas/{rifa}/rewards/config', 'App\Http\Controllers\RewardPublicController@config');
Route::group(['middleware' => 'auth.client', 'namespace' => 'App\Http\Controllers'], function () {
    Route::get('/rifas/{rifa}/rewards/balances', 'RewardPublicController@balances');
    Route::get('/rifas/{rifa}/rewards/summary', 'RewardPublicController@summary');
    Route::post('/rifas/{rifa}/rewards/{type}/redeem', 'RewardPublicController@redeem');
});

// Admin Rewards
Route::middleware(['auth:sanctum', 'checkAdmin:admin,superadmin'])->group(function () {
    Route::get('/admin/rewards/{rifa}', 'App\Http\Controllers\RewardAdminController@show');
    Route::post('/admin/rewards/{rifa}', 'App\Http\Controllers\RewardAdminController@store');
});

Route::get('/run-migrations', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        return "Migrations OK: " . Artisan::output();
    } catch (\Exception $e) {
        return "Erro: " . $e->getMessage();
    }
});