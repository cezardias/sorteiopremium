<?php

namespace App\Services;

use App\Models\RewardPasse;
use App\Models\RewardPassGrant;
use App\Models\RewardTypes;
use App\Models\V1\RifaPay;
use Illuminate\Support\Facades\DB;

class RewardPassService
{
    /**
     * Concede passes ao usuário a partir de um pagamento APROVADO.
     * - Idempotente por pagamento e por tipo (wheel/chest).
     */
    public static function grantFromApprovedPayment(RifaPay $pay): void
    {
        // Sanidade: só processe pagos "aprovados" (status=1)
        if ((int) $pay->status !== 1) {
            return;
        }

        DB::transaction(function () use ($pay) {
            // Busca os tipos ativos da rifa (wheel/chest) com numbers_per_pass configurado
            $types = RewardTypes::query()
                ->where('rifas_id', $pay->rifas_id)
                ->where('is_active', true)
                ->whereIn('code', ['wheel', 'chest'])
                ->get();

            foreach ($types as $type) {
                $npp = data_get($type->metadata, 'numbers_per_pass');
                if (!is_numeric($npp) || (int)$npp <= 0) {
                    continue; // pula tipo mal configurado
                }

                $passes = intdiv((int) $pay->qntd_number, (int) $npp);
                if ($passes <= 0) {
                    continue;
                }

                // Fonte única por pagamento + tipo, para idempotência
                $source = 'purchase:' . $pay->id . ':' . $type->code;

                // Se já houve grant com essa fonte, não duplica
                $alreadyGranted = RewardPassGrant::query()
                    ->where('client_id', $pay->client_id)           // (você usa "client" como "client" no rewards)
                    ->where('rifas_id', $pay->rifas_id)
                    ->where('source', $source)
                    ->exists();

                if ($alreadyGranted) {
                    continue;
                }

                // Incrementa/insere saldo em reward_passes
                /** @var RewardPasse $pass */
                $pass = RewardPasse::query()->firstOrCreate(
                    [
                        'client_id'        => $pay->client_id,
                        'rifas_id'       => $pay->rifas_id,
                        'reward_type_id' => $type->id,
                    ],
                    [
                        'balance'        => 0,
                        'source'         => null,
                        'expires_at'     => null,
                    ]
                );

                $pass->increment('balance', $passes);

                // Log (histórico) do grant
                RewardPassGrant::create([
                    'client_id'      => $pay->client_id,
                    'rifas_id'     => $pay->rifas_id,
                    'source'       => $source,
                    'passes_total' => $passes,
                ]);
            }
        });
    }
}
