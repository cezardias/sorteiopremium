<?php
namespace App\Services;

use App\Models\{RewardTypes, RewardItems, RewardItemStock, RewardPasse, RewardRedemption};
use Illuminate\Support\Facades\DB;

class RewardEngineService
{
    /* ===================== Helpers de metadados e contagem ===================== */

    private function metaArr($raw): array {
        if (is_array($raw)) return $raw;
        if (is_string($raw) && $raw !== '') return json_decode($raw, true) ?: [];
        return [];
    }

    private function fullLayout($items): array {
        $rows = $items->map(fn($i)=>[
            'id'     => $i->id,
            'pos'    => $i->position_number,
            'type'   => $i->type,     // reward | try_again
            'status' => $i->status,   // active | blocked | immediate
            'text'   => $i->text,
        ])->values()->all();

        $seq=1; foreach ($rows as &$r) { if (!is_int($r['pos'])) $r['pos']=$seq; $seq++; } unset($r);
        usort($rows, fn($a,$b)=>$a['pos'] <=> $b['pos']);
        $n=1; foreach ($rows as &$r) { $r['pos']=$n++; } unset($r);
        return $rows;
    }

     private function failsSinceLastPrize(int $clientId, int $rifaId, int $typeId): int
    {
        // último id de tentativa com outcome 'reward'
        $lastWinId = (int) RewardRedemption::where([
                'client_id'=>$clientId, 'rifas_id'=>$rifaId, 'reward_type_id'=>$typeId, 'outcome'=>'reward'
            ])->max('id');

        // conta 'try_again' após esse id
        return (int) RewardRedemption::where([
                'client_id'=>$clientId, 'rifas_id'=>$rifaId, 'reward_type_id'=>$typeId, 'outcome'=>'try_again'
            ])->when($lastWinId > 0, fn($q)=>$q->where('id','>', $lastWinId))
              ->count();
    }

    /** NOVO: regras de disparo do prêmio (5, 9, 20, depois a cada 20) */
    private function shouldPrizeNow(int $failsSinceLast): bool
    {
        $n = $failsSinceLast + 1; // esta jogada
        if (in_array($n, [5, 9, 20], true)) return true;
        if ($n > 20 && ($n % 20) === 0) return true;
        return false;
    }

    /** Quantas vezes o usuário já ganhou este item específico */
    private function userWinsForItem(int $clientId, int $rifaId, int $typeId, int $itemId): int {
        return RewardRedemption::where([
            'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$typeId,
            'reward_item_id'=>$itemId,'outcome'=>'reward'
        ])->count();
    }

    /** Quantos prêmios (qualquer item) o usuário já ganhou neste tipo */
    private function userWinsTotal(int $clientId, int $rifaId, int $typeId): int {
        return RewardRedemption::where([
            'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$typeId,'outcome'=>'reward'
        ])->count();
    }

    /** Layout 1..N (array com ['id','pos','type']) de itens ATIVOS na ordem de exibição */
    private function activeLayout($items): array {
        $act = $items->where('status','active')
            ->map(fn($i)=>['id'=>$i->id,'pos'=>$i->position_number,'type'=>$i->type])
            ->values()
            ->all();

        // normaliza posições nulas mantendo ordem de chegada
        $seq = 1;
        foreach ($act as &$row) { if (!is_int($row['pos'])) $row['pos'] = $seq; $seq++; }
        unset($row);

        usort($act, fn($a,$b)=>$a['pos'] <=> $b['pos']);

        // reindexa para 1..N
        $n=1; foreach ($act as &$row) { $row['pos'] = $n++; } unset($row);
        return $act;
    }

    /** Posição de um setor NÃO-prêmio (preferindo itens try_again) */
    private function pickNonPrizePos(array $layoutFull): int {
        // NÃO-prêmio = tudo que NÃO é reward ativo
        $non = array_column(
            array_filter($layoutFull, fn($r)=> !($r['type']==='reward' && $r['status']==='active')),
            'pos'
        );
        return $non ? $non[random_int(0,count($non)-1)] : 1;
    }

     private function pickFailPos(array $layoutFull): int
    {
        // só pega posições cuja linha NÃO é prêmio ativo e NÃO é bloqueada
        $candidates = [];
        foreach ($layoutFull as $r) {
            $isPrizeActive = ($r['type']==='reward' && $r['status']==='active');
            $isBlocked     = ($r['status']==='blocked');
            // queremos setas de "falha" (ex.: try_again ativos) — bloqueado nunca
            if (!$isPrizeActive && !$isBlocked) {
                $candidates[] = $r['pos'];
            }
        }
        if (!$candidates) {
            // fallback defensivo (evita travar; mas recomendo garantir ao menos 1 try_again ativo)
            return 1;
        }
        return $candidates[random_int(0, count($candidates)-1)];
    }

    /** Payload alinhado com o front: centro do setor (position é 1-based) */
     private function payloadForPosition(int $pos, int $count): array {
        $slice  = 360 / max(1,$count);
        $center = ($pos - 0.5) * $slice;
        return ['angle'=>$center,'position'=>$pos];
    }

    /** Sorteio ponderado */
    private function weightedPick($items) {
        if ($items->isEmpty()) return null;
        $sum=0; $acc=[];
        foreach ($items as $it) {
            $w = max(1,(int)$it->weight);
            $sum += $w;
            $acc[] = ['it'=>$it,'ceil'=>$sum];
        }
        $r = random_int(1,$sum);
        foreach ($acc as $slot) if ($r <= $slot['ceil']) return $slot['it'];
        return $items->first();
    }

    private function pickTryAgainPos(array $layoutFull): int {
        $try = array_column(array_filter($layoutFull, fn($r)=> $r['type']==='try_again'), 'pos');
        if ($try) return $try[random_int(0, count($try)-1)];

        $safeNon = array_column(array_filter($layoutFull, fn($r)=>
            !($r['type']==='reward' && ($r['status']??'active')==='active') && ($r['status']??'active')!=='blocked'
        ), 'pos');

        return $safeNon ? $safeNon[random_int(0, count($safeNon)-1)] : 1;
    }



    private function consecutiveFails(int $clientId, int $rifaId, int $typeId): int {
        $lastWinId = RewardRedemption::where([
            'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$typeId,'outcome'=>'reward'
        ])->max('id');

        $q = RewardRedemption::where([
            'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$typeId,'outcome'=>'try_again'
        ]);

        if ($lastWinId) $q->where('id','>', $lastWinId);

        return $q->count();
    }


    /** Total de jogadas (reward + try_again) do usuário neste tipo */
    private function totalPlays(int $clientId, int $rifaId, int $typeId): int {
        return RewardRedemption::where([
            'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$typeId
        ])->count();
    }

    /** Usuário já ganhou este item? */
    private function userHasWonItem(int $clientId, int $rifaId, int $typeId, int $itemId): bool {
        return RewardRedemption::where([
            'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$typeId,
            'reward_item_id'=>$itemId,'outcome'=>'reward'
        ])->exists();
    }


    public function grantByPurchase(int $clientId, int $rifaId, int $numbersBought, string $source): void {
        if ($numbersBought < 1) return;

        DB::transaction(function() use ($clientId,$rifaId,$numbersBought,$source) {
            if (RewardPasse::where('source',$source)->exists()) return;

            $types = RewardTypes::where(['rifas_id'=>$rifaId,'is_active'=>true])->get();
            foreach ($types as $t) {
                $meta = $this->metaArr($t->metadata);
                $per  = (int)($meta['numbers_per_pass'] ?? 0);
                if ($per < 1) continue;

                $passes = intdiv($numbersBought, $per);
                if ($passes < 1) continue;

                $row = RewardPasse::firstOrCreate(
                    ['client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$t->id],
                    ['balance'=>0,'source'=>$source]
                );
                $row->increment('balance', $passes);
            }
        });
    }


    public function redeem(int $clientId, int $rifaId, string $typeCode, ?string $idemp=null): array {
    return DB::transaction(function() use($clientId,$rifaId,$typeCode,$idemp) {

        $type = RewardTypes::where(['rifas_id'=>$rifaId,'code'=>$typeCode,'is_active'=>true])->firstOrFail();

        if ($idemp && ($exists = RewardRedemption::where('idempotency_key',$idemp)->first())) {
            return $exists->toArray();
        }

        $pass = RewardPasse::where([
            'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$type->id
        ])->lockForUpdate()->first();

        if (!$pass || $pass->balance < 1) {
            throw new \RuntimeException('Sem passes.');
        }

                // Layout completo 1..N
        $items   = RewardItems::where(['rifas_id'=>$rifaId,'reward_type_id'=>$type->id])->get();
        $layoutF = $this->fullLayout($items);
        $countF  = max(1, count($layoutF));

        /** 1) Tentativa ABSOLUTA do usuário neste tipo (não zera após prêmio) */
        $attempt = $this->totalPlays($clientId, $rifaId, $type->id) + 1;

        /** 2) Itens de prêmio ativos que o usuário AINDA NÃO ganhou */
        $remaining = $items->filter(function($it) use ($clientId,$rifaId,$type) {
            if ($it->type !== 'reward' || $it->status !== 'active') return false;
            return !$this->userHasWonItem($clientId, $rifaId, $type->id, $it->id);
        })->values();

        /** Se o usuário já ganhou TODOS os prêmios => sempre try_again */
        if ($remaining->isEmpty()) {
            $pos = $this->pickTryAgainPos($layoutF);
            $pass->decrement('balance',1);

            return RewardRedemption::create([
                'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$type->id,
                'outcome'=>'try_again','consumed_passes'=>1,
                'animation_payload'=>$this->payloadForPosition($pos,$countF),
                'idempotency_key'=>$idemp,
            ])->toArray();
        }

        /** 3) Nesta tentativa N, só dispara prêmio se EXISTE item com guarantee_after == N
         *    (e opcionalmente min_tries_required <= N).
         */
        $dueNow = $remaining->filter(function($it) use ($attempt) {
            $g = $it->guarantee_after !== null ? (int)$it->guarantee_after : null;
            if ($g === null) return false;           // sem marco absoluto, não dispara sozinho
            if ($g !== $attempt) return false;       // dispara EXATAMENTE no marco
            $min = (int)($it->min_tries_required ?? 0);
            return $attempt >= $min;
        })->values();

        if ($dueNow->isEmpty()) {
            // Não é um marco de prêmio -> falha
            $pos = $this->pickTryAgainPos($layoutF);
            $pass->decrement('balance',1);

            return RewardRedemption::create([
                'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$type->id,
                'outcome'=>'try_again','consumed_passes'=>1,
                'animation_payload'=>$this->payloadForPosition($pos,$countF),
                'idempotency_key'=>$idemp,
            ])->toArray();
        }

        /** 4) É o marco do prêmio: escolhe (pode usar peso) ENTRE os de hoje */
        $chosen = $this->weightedPick($dueNow);

        // Consome passe
        $pass->decrement('balance',1);

        // Posição no layout
        $pos = 1;
        foreach ($layoutF as $r) if ($r['id'] === $chosen->id) { $pos = $r['pos']; break; }

        $payload = $this->payloadForPosition($pos, $countF);

        $red = RewardRedemption::create([
            'client_id'=>$clientId,'rifas_id'=>$rifaId,'reward_type_id'=>$type->id,
            'reward_item_id'=>$chosen->id,'outcome'=>'reward','consumed_passes'=>1,
            'animation_payload'=>$payload,'idempotency_key'=>$idemp,
        ]);

        $arr = $red->toArray();
        $arr['label'] = $chosen->text;

        // Snapshot dos setores (bloqueado não é prêmio visual)
        $arr['sectors'] = array_map(fn($r)=>[
            'label'=>$r['text'],
            'type' => ($r['type']==='reward' && ($r['status']??'active')!=='active') ? 'blocked' : $r['type'],
        ], $layoutF);

        return $arr;

    });
}

}
