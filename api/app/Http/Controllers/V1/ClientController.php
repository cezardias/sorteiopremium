<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use \Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ItemNotFoundException;

use App\Models\V1\{Clients, RifaPay, Rifas};


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
                    'numbers' => $order->rifaNumber->numbers ?? ''
                ];
            });

            return response()->json(["success" => true, "data" => ["orders" => $info, "client" => $client]], 200);
        } catch (ItemNotFoundException $e) {
            return response()->json(["success" => false, "msg" => $e->getMessage()], 404);
        } catch (Exception $e) {
            return response()->json(["success" => false, "msg" => $e->getMessage()], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $validator = \Validator::make($request->all(), [
                'client_id' => 'required|exists:clients,id',
                'cpf' => 'required|string|max:20',
                'email' => 'required|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(["success" => false, "msg" => $validator->errors()->first()], 422);
            }

            $client = Clients::find($request->client_id);
            $client->update([
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
