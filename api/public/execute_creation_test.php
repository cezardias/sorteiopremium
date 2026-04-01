<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\RifaService;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

header('Content-Type: application/json');

try {
    // 1. Encontrar um usuário admin para simular autenticação
    $admin = User::first();
    if (!$admin) {
        die(json_encode(['error' => 'Nenhum usuário encontrado no banco.']));
    }
    Auth::login($admin);

    // 2. Simular o request que o dashboard envia
    $data = [
        'title' => 'Teste de Criação Diagnostic ' . time(),
        'description_resume' => 'Descrição de teste para diagnóstico.',
        'price' => 0.50,
        'status' => 'ativas',
        'cota' => [
            'qntd_cota' => 100,
            'qntd_cota_min_order' => 1,
            'qntd_cota_max_order' => 100,
            'qntd_cota_max_client' => 100
        ],
        'rifa_payment' => [
            'gateway' => 'cyber',
            'time_pay' => 15,
            'service_charge' => 0,
            'text_service_charge' => ''
        ],
        'rifa_awarded' => [
            'cotas_double' => 'nao',
            'text_cotas_double' => '',
            'title_cotas_awarded' => '',
            'description_cotas_awarded' => '',
            'title_upsell' => '',
            'description_upsell' => ''
        ],
        'rifa_others' => [
            'facebook_pixel' => '[]',
            'facebook_token' => '',
            'tiktok_pixel' => '[]',
            'whatsapp_group' => '',
            'link_ebook' => '',
            'nota_fiscal' => ''
        ]
    ];

    $request = new Request($data);
    // Transformar array em objeto para bater com a assinatura do Service que usa $datas->field
    $datas = (object)$data;
    // Ajustar os sub-objetos também
    $datas->cota = $data['cota'];
    $datas->rifa_payment = $data['rifa_payment'];
    $datas->rifa_awarded = $data['rifa_awarded'];
    $datas->rifa_others = $data['rifa_others'];

    $rifaService = new RifaService();
    $result = $rifaService->createRifas($datas);

    echo json_encode([
        'success' => $result,
        'admin_used' => $admin->email,
        'msg' => $result ? 'Rifa criada com sucesso no teste!' : 'createRifas retornou false.'
    ]);

} catch (\Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
