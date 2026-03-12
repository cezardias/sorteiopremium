<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\V1\Clients;
use App\Models\V1\Cotas;
use App\Models\V1\RifaNumber;
use App\Models\V1\RifaPay;
use App\Models\V1\Rifas;
use App\Models\V1\AwardedQuota;
use App\Services\CyberPaymentService;
use App\Services\RifaService;
use App\Services\RewardPassService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use Illuminate\Support\Facades\Log;

class CyberPaymentController extends Controller
{
    protected $cyberPaymentService;
    protected $rifaService;

    public function __construct(CyberPaymentService $cyberPaymentService, RifaService $rifaService)
    {
        $this->cyberPaymentService = $cyberPaymentService;
        $this->rifaService = $rifaService;
    }

    /**
     * Replaces the old buyRifa logic using Escale Cyber
     */
    public function buyRifa(Request $request, $afiliadoId = null)
    {
        try {
            $validator = Validator::make($request->all(), [
                'client_id' => 'required|integer|exists:clients,id',
                'qntd_number' => 'required|integer|min:1',
                'cotas_double' => 'nullable|integer',
                'pacote_promo' => 'nullable',
                'rifas_id' => 'required|exists:rifas,id',
            ]);

            if ($validator->fails()) {
                return response()->json(["success" => false, "msg" => $validator->errors()], 422);
            }

            // Check if user reached limit
            $isBuyRifa = $this->rifaService->isBuy($request);
            if (!$isBuyRifa['success']) {
                return response()->json(["success" => false, "msg" => $isBuyRifa['msg']], 409);
            }

            $rifa = Rifas::with(['rifaPayment', 'discountPackage'])->findOrFail($request->rifas_id);
            $client = Clients::findOrFail($request->client_id);

            // Double check for CPF and Email (Phase 3 requirement)
            if (empty($client->cpf) || empty($client->email)) {
                return response()->json([
                    "success" => false,
                    "msg" => "Cadastro incompleto. Por favor, informe seu CPF e E-mail para continuar.",
                    "incomplete_profile" => true
                ], 422);
            }

            $unitPrice = $rifa->price ?? 0;
            $qntdNumber = (int) $request->qntd_number;

            // Calculate value based on packages
            if ($request->pacote_promo != 0) {
                $discountPackage = $rifa->discountPackage->where('id', $request->pacote_promo)->first();
                $calculatedValue = $discountPackage ? ($discountPackage->value_cota * $qntdNumber) : ($unitPrice * $qntdNumber);
            } else {
                $calculatedValue = $unitPrice * $qntdNumber;
            }

            if ($request->cotas_double == 1) {
                $qntdNumber = $qntdNumber * 2;
            }

            $calculatedValue = round($calculatedValue, 2);

            $request->merge([
                'value' => $calculatedValue,
                'qntd_number' => $qntdNumber, // Update with doubled if applicable
                'valorCalculado' => $calculatedValue
            ]);

            // Cota limit check
            $cota = Cotas::where('rifas_id', $request->rifas_id)->first();
            if ($cota && $qntdNumber > $cota->qntd_cota_max_order) {
                return response()->json([
                    "success" => false,
                    "msg" => "Você só pode comprar no máximo {$cota->qntd_cota_max_order} cotas por pedido."
                ], 422);
            }

            // Register purchase intent
            $rifaPay = RifaPay::applyRifa($request);
            if (!$rifaPay) {
                return response()->json(["success" => false, "msg" => "Ocorreu um erro ao registrar a compra"], 500);
            }

            $rifaPayDetails = RifaPay::with(['rifa.cota', 'rifa.AwardedQuota', 'client'])->find($rifaPay->id);
            $result = RifaNumber::applyRifa($rifaPayDetails);

            if (!$result) {
                $rifaPayDetails->delete();
                return response()->json(["success" => false, "msg" => "Quantidade de número inválido"], 409);
            }

            // Create Transaction in Cyber Payment API
            $paymentData = [
                'amount' => $calculatedValue,
                'customerName' => $client->name . ' ' . $client->surname,
                'customerEmail' => $client->email,
                'customerPhone' => $client->cellphone,
                'customerDocument' => $client->cpf,
                'description' => 'Compra da rifa: ' . $rifa->title,
                'metadata' => [
                    'rifa_pay_id' => $rifaPay->id,
                    'rifas_id' => $rifa->id,
                    'client_id' => $client->id
                ]
            ];

            $payment = $this->cyberPaymentService->createPixTransaction($paymentData);

            if (!isset($payment['success']) || !$payment['success']) {
                $rifaPayDetails->delete();
                RifaNumber::where('pay_id', $rifaPay->id)->delete();
                return response()->json([
                    "success" => false,
                    "msg" => "Erro ao gerar pagamento via Cyber Payment API",
                    "details" => $payment['message'] ?? 'Erro desconhecido'
                ], 500);
            }

            $transaction = $payment['data'];

            // Save payment details
            RifaPay::where('id', $rifaPay->id)->update([
                'pix_id' => $transaction['id'],
                'qr_code' => $transaction['pix']['qrCode']['emv'] ?? '',
                'qr_code_base64' => $transaction['pix']['qrCode']['image'] ?? ''
            ]);

            if ($afiliadoId) {
                $this->rifaService->calcularGanhoAfiliado($afiliadoId, $rifaPay);
            }

            $rifaPayDetails->refresh();
            return response()->json(["success" => true, "data" => $rifaPayDetails], 200);

        } catch (Exception $e) {
            Log::error('BuyRifa Cyber Error: ' . $e->getMessage());
            return response()->json(["success" => false, "msg" => $e->getMessage()], 500);
        }
    }

    /**
     * Webhook handler for Escale Cyber
     */
    public function webhook(Request $request)
    {
        Log::info('Escale Cyber Webhook Received: ', $request->all());

        $type = $request->input('type');
        $data = $request->input('data');

        if ($type === 'pix.in.confirmation' && isset($data['metadata']['rifa_pay_id'])) {
            $rifaPayId = $data['metadata']['rifa_pay_id'];
            $status = $data['status'];

            if ($status === 'APPROVED') {
                $rifaPay = RifaPay::find($rifaPayId);
                if ($rifaPay && $rifaPay->status == 0) {
                    $rifaPay->update(['status' => 1]);
                    RifaNumber::where('pay_id', $rifaPay->id)->update(['status' => 1]);

                    // Process awarded quotas
                    $numbers = RifaNumber::where('pay_id', $rifaPay->id)->pluck('numbers')->toArray();
                    AwardedQuota::ganhadorBilhetePremiado($numbers, $rifaPay->client_id, $rifaPay->rifas_id, $rifaPay->id);

                    // Process rewards/gamification if exists
                    if (class_exists(RewardPassService::class)) {
                        RewardPassService::grantFromApprovedPayment($rifaPay);
                    }

                    Log::info("Payment identified and approved for RifaPay: $rifaPayId");
                }
            }
        }

        return response()->json(['success' => true]);
    }

    /**
     * Check status via polling (frontend usage)
     */
    public function checkStatus($rifaPayId)
    {
        $rifaPay = RifaPay::find($rifaPayId);
        if (!$rifaPay) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        return response()->json([
            'success' => true,
            'status' => $rifaPay->status, // 0 = pending, 1 = approved
        ]);
    }
}
