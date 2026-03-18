<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\V1\RifaPay;
use App\Models\V1\RifaNumber;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Diagnóstico e Recuperação ---

Route::get('/test-db', function () {
    try {
        $dbName = config('database.connections.mysql.database');
        
        $counts = [
            'rifas' => \DB::table('rifas')->count(),
            'rifa_pays' => \DB::table('rifa_pays')->count(),
            'clients' => \DB::table('clients')->count(),
            'rifa_numbers' => \DB::table('rifa_numbers')->count(),
            'users' => \DB::table('users')->count(),
        ];

        return response()->json([
            'status' => 'connected',
            'db_name' => $dbName,
            'counts' => $counts,
            'latest_order' => \DB::table('rifa_pays')->latest()->first(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

// Route::get('/reset-admin-pwd', function () { ... });
// Route::get('/debug-payments', function () { ... });
// Route::get('/recovery-payments', function () { ... });




// Route::get('/reset-admin-pwd', function () { ... });
// Route::get('/debug-payments', function () { ... });
// Route::get('/recovery-payments', function () { ... });
Route::get('/clear-cache', function () {
    try {
        Artisan::call('cache:clear');
        Artisan::call('route:clear');
        Artisan::call('config:clear');
        Artisan::call('view:clear');
        return file_get_contents(__FILE__);
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
        Route::get("/dashboard/stats", "AdminController@getStats");
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
        Route::post("/dashboard/usuario/store", "AdminController@storeUser");
        Route::put("/dashboard/usuarios/editar", "AdminController@editarUsers");
        Route::delete("/dashboard/usuarios/deletar/{id}", "AdminController@destroyUser");
        Route::post("/dashboard/whatsapp/send", "AdminController@sendMessagesWhats");

        // Gateway
        Route::get("/dashboard/payment", "AdminController@getAllGateway");
        Route::get("/dashboard/payment/{id}", "AdminController@showGateway");
        Route::post("/dashboard/payment/make", "AdminController@storeGateway");
        Route::put("/dashboard/payment/update", "AdminController@updateGateway");
        Route::delete("/dashboard/payment/delete", "AdminController@destroyGateway");

        Route::get("/dashboard/site-settings", "AdminController@getConfigSite");
        Route::post("/dashboard/site-settings/editar", "AdminController@storeConfigSite");
        Route::get("/dashboard/vendas", "AdminController@getVendas");
        Route::post("/dashboard/vendas/filtro", "AdminController@vendasFiltro");
        Route::get("/dashboard/one/venda/{id}", "AdminController@getOneVendas");
        Route::post("/dashboard/one/venda/filtro/{id}", "AdminController@vendasFiltroOne");

        // Afiliados
        Route::post("/dashboard/afiliado/create", "AdminController@createAfiliado");
        Route::get("/dashboard/todos/afiliados", "AdminController@getAllAfiliado");
        Route::get("/dashboard/one/afiliado/{id}", "AdminController@getOneAfiliado");
        Route::get("/dashboard/one/afiliado/produto/{idProduto}", "AdminController@getOneAfiliadoByProduto");
        Route::put("/dashboard/afiliado/update/{id}", "AdminController@afiliadoUpdate");
        Route::post("/dashboard/afiliado/filtro", "AdminController@afiliadoFiltro");
    });
});

Route::group(['prefix' => 'produtos', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::get("/", "RifasController@allRifas")->name('all.rifas');
    Route::get("/{slug}/{id}/{afiliadoId?}", "RifasController@show")->where(['slug' => '[a-zA-Z0-9\-_]+', 'id' => '[0-9]+'])->name('show.one.rifa');
    Route::get("/detalhes/{id}", "RifasController@showSingle");
    Route::get("/todos/ganhadores", "RifasController@getAllWinners");
    Route::post('compra-rifas/{id?}', 'CyberPaymentController@buyRifa');
    Route::get('compra-rifas-status/{id}', 'CyberPaymentController@checkStatus');
    Route::get("/payment-status/{paymentId}", "RifasController@checkPaymentStatus");
});

Route::group(['prefix' => 'public-rifas', 'namespace' => 'App\Http\Controllers\V1'], function () {
    Route::get("/check-db", function() {
        if (function_exists('opcache_reset')) { opcache_reset(); }
        $results = [
            "version" => "V31 - COMBO_CHECK",
            "time" => date("Y-m-d H:i:s")
        ];
        
        try {
            // Combination from Step 388: User (no 'm') to DB ('m')
            $user = "u434605668_sorteiospremiu";
            $db = "u434605668_sorteiopremium";
            
            $pdo = new PDO("mysql:host=127.0.0.1;dbname=$db", $user, "SorteioPremiumMultiMarca1!2#%34.");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $results["afiliados"] = $pdo->query("SELECT COUNT(*) FROM afiliados")->fetchColumn();
            $results["clients"] = $pdo->query("SELECT COUNT(*) FROM clients")->fetchColumn();
            $results["rifas"] = $pdo->query("SELECT COUNT(*) FROM rifas")->fetchColumn();
            $results["site_config"] = $pdo->query("SELECT COUNT(*) FROM site_config")->fetchColumn();
            $results["site_settings"] = $pdo->query("SELECT COUNT(*) FROM site_settings")->fetchColumn();
            $results["combo"] = "$user to $db";
            
        } catch (\Exception $e) { $results["error"] = $e->getMessage(); }
        
        return response()->json($results);
    });
    Route::get("/combo-final", function() {
        if (function_exists('opcache_reset')) { opcache_reset(); }
        $results = ["time" => date("Y-m-d H:i:s")];
        try {
            $user = "u434605668_sorteiospremiu";
            $db = "u434605668_sorteiopremium";
            $pdo = new PDO("mysql:host=127.0.0.1;dbname=$db", $user, "SorteioPremiumMultiMarca1!2#%34.");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $results["afiliados"] = $pdo->query("SELECT COUNT(*) FROM afiliados")->fetchColumn();
            $results["clients"] = $pdo->query("SELECT COUNT(*) FROM clients")->fetchColumn();
            $results["rifas"] = $pdo->query("SELECT COUNT(*) FROM rifas")->fetchColumn();
            $results["combo"] = "$user to $db";
        } catch (\Exception $e) { $results["error"] = $e->getMessage(); }
        return response()->json($results);
    });
    Route::get("/index", "RifasController@index");
    Route::get("/get-all-numeros-premiados/{id}", "RifasController@getNumerosPremiados");
    Route::get("/latest", "RifasController@latest");
    Route::get("/latest-winner", "RifasController@getLatestWinner");
});

Route::post('client/update-profile', 'App\Http\Controllers\V1\ClientController@updateProfile');
Route::get('client/pedidos', 'App\Http\Controllers\V1\ClientController@getNumbers');
Route::get('client/pedido/{id}', 'App\Http\Controllers\V1\ClientController@getOrderDetail');
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