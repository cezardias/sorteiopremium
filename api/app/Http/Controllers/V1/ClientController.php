<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use \Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ItemNotFoundException;

use App\Models\V1\{Clients, RifaPay, Rifas, RifaNumber};


class ClientController extends Controller
{
    public function getNumbers(Request $request)
    {
        try {
            $client = Clients::findClient($request->phone);
            if (!isset($client)) {
                throw new ItemNotFoundException('Telefone não cadastrado');
            }
            $clientId = $client->id;
            
            // Usar o model RifaPay que já tem os relacionamentos configurados
            $orders = RifaPay::with(['rifa.rifaImage', 'rifaNumber'])
                ->where('client_id', $clientId)
                ->whereIn('status', [0, 1, 2, 3, 10])
                ->orderByDesc('id')
                ->get();

            $info = $orders->map(function($order) {
                return [
                    'id' => $order->id,
                    'thumbnail' => $order->rifa->rifaImage->first()->path ?? null,
                    'title' => $order->rifa->title ?? 'Produto Premium',
                    'product_name' => $order->rifa->title ?? 'Produto Premium',
                    'payment_status' => $order->status,
                    'status' => $order->status == 1 ? 'pago' : ($order->status == 2 ? 'cancelado' : 'pendente'),
                    'created_at' => $order->created_at->format('d/m/Y H:i'),
                    'price' => $order->value,
                    'total_amount' => number_format($order->value, 2, ',', '.'),
                    'tickets_count' => $order->qntd_number,
                    'numbers_quant' => $order->qntd_number,
                    'numbers' => $order->rifaNumber->numbers ?? '',
                    'qr_code' => $order->qr_code,
                    'qr_code_base64' => $order->qr_code_base64,
                ];
            });

            return response()->json(["success" => true, "data" => ["orders" => $info, "client" => $client]], 200);
        } catch (ItemNotFoundException $e) {
            return response()->json(["success" => false, "msg" => $e->getMessage()], 404);
        } catch (Exception $e) {
            return response()->json(["success" => false, "msg" => $e->getMessage()], 500);
        }
    }

    /**
     * Get detailed order info with real-time status sync for Cyber
     */
    public function getOrderDetail(Request $request, $id)
    {
        try {
            $order = RifaPay::with(['rifa.rifaImage', 'rifaNumber', 'client'])->findOrFail($id);
            
            // Real-time sync if pending
            if ($order->status == 0 && !empty($order->pix_id)) {
                $cyberService = app(\App\Services\CyberPaymentService::class);
                $response = $cyberService->checkStatus($order->pix_id);
                
                if ($response && isset($response['success']) && $response['success']) {
                    $remoteStatus = $response['status'] ?? ($response['data']['status'] ?? null);
                    
                    if ($remoteStatus == 1 || $remoteStatus === 'APPROVED') {
                        $order->update(['status' => 1]);
                        // Approval logic duplicated from command for robustness
                        RifaNumber::where('pay_id', $order->id)->update(['status' => 1]);
                        \App\Services\RewardPassService::grantFromApprovedPayment($order);
                    } elseif ($remoteStatus !== 0 && $remoteStatus !== 'PENDING' && $remoteStatus !== 'WAITING' && $remoteStatus !== 'OPEN') {
                        // Mark as expired/canceled if not pending/approved
                        $order->update(['status' => 2]);
                        RifaNumber::where('pay_id', $order->id)->update(['status' => 2, 'numbers' => null]);
                    }
                    $order->refresh();
                }
            }

            $data = [
                'id' => $order->id,
                'status' => $order->status,
                'status_label' => $order->status == 1 ? 'pago' : ($order->status == 2 ? 'cancelado' : 'pendente'),
                'total_amount' => number_format($order->value, 2, ',', '.'),
                'qntd_number' => $order->qntd_number,
                'created_at' => $order->created_at->format('d/m/Y H:i'),
                'product_name' => $order->rifa->title ?? 'Produto Premium',
                'numbers' => $order->rifaNumber->numbers ?? '[]',
                'qr_code' => $order->qr_code,
                'qr_code_base64' => $order->qr_code_base64,
                'pix_id' => $order->pix_id
            ];

            return response()->json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            return response()->json(["success" => false, "msg" => $e->getMessage()], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $validator = \Validator::make($request->all(), [
                'client_id' => 'required|exists:clients,id',
                'name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'cpf' => 'required|string|max:20',
                'email' => 'required|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(["success" => false, "msg" => $validator->errors()->first()], 422);
            }

            $client = Clients::find($request->client_id);
            $client->update([
                'name' => $request->name,
                'surname' => $request->surname,
                'cpf' => $request->cpf,
                'email' => $request->email
            ]);

            return response()->json([
                "success" => true,
                "msg" => "Perfil atualizado com sucesso!",
                "client" => $client
            ], 200);

        } catch (Exception $e) {
            return response()->json(["success" => false, "msg" => $e->getMessage()], 500);
        }
    }



}
