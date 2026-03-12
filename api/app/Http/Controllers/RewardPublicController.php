<?php

namespace App\Http\Controllers;

use App\Models\{RewardRedemption, RewardTypes};
use App\Services\RewardEngineService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class RewardPublicController extends Controller
{
    public function __construct(private RewardEngineService $svc) {}

    public function config($rifa) {
        $rows = RewardTypes::where('rifas_id',$rifa)
            ->with(['itemsAll'])
            ->get(['id','code','name','is_active','giro_por_usuario','metadata']);

        $data = $rows->map(function ($t) {
            return [
                'code'  => $t->code,
                'name'  => $t->name,
                'is_active' => $t->is_active,
                'giro_por_usuario' => $t->giro_por_usuario,
                'metadata' => $t->metadata,
                'items' => $t->itemsAll->map(fn($i)=>[
                    'id' => $i->id,
                    'text' => $i->text,
                    'type' => $i->type,           // reward | try_again
                    'position_number' => $i->position_number,
                ])->values(),
            ];
        });

        return response()->json(['data'=>$data]);
    }



    public function balances(Request $req, $rifa) {
        $userId = optional($req->user())->id ?: (int) $req->query('cid');
        if (!$userId) return response()->json(['data'=>[]]);

        $rows = DB::table('reward_passes as p')
            ->join('reward_types as t','t.id','=','p.reward_type_id')
            ->where('p.client_id',$userId)->where('p.rifas_id',$rifa)
            ->where('t.rifas_id',$rifa)->where('t.is_active',true)
            ->get([DB::raw('t.code as code'),'p.balance']);

        return response()->json(['data'=>$rows]);
    }

    public function summary(Request $req, $rifa) {
        $userId = optional($req->user())->id ?: (int) $req->query('cid');
        if (!$userId) return response()->json(['programs'=>[],'prizes'=>[],'totals'=>['prizesCount'=>0]]);

        $types = RewardTypes::where(['rifas_id'=>$rifa,'is_active'=>true])->get(['id','code']);
        $passes = DB::table('reward_passes as p')->join('reward_types as t','t.id','=','p.reward_type_id')
            ->where('p.client_id',$userId)->where('p.rifas_id',$rifa)->where('t.rifas_id',$rifa)->where('t.is_active',true)
            ->get([DB::raw('t.code as code'),'p.balance']);

        $programs = [];
        foreach ($types as $t) {
            $hit = $passes->firstWhere('code',$t->code);
            $programs[$t->code] = ['isActive'=>true,'availablePasses'=>(int)($hit->balance ?? 0)];
        }

        $reds = RewardRedemption::with('rewardItem')
            ->where('client_id', $userId)
            ->where('rifas_id', $rifa)
            ->where('outcome', 'reward')
            ->orderByDesc('id')
            ->limit(50)
            ->get();



        $idToCode = $types->pluck('code','id');
        $prizes = $reds->map(fn($r)=>[
            'attemptId'=>$r->id,'type'=>$idToCode[$r->reward_type_id]??'wheel',
            'label'=>$r->rewardItem->text ?? 'Prêmio','itemId'=>$r->reward_item_id,
            'awardedAt'=>optional($r->created_at)->toISOString(),'payload'=>$r->animation_payload
        ])->values();

        return response()->json([
            'programs'=>$programs,'prizes'=>$prizes,'totals'=>['prizesCount'=>$prizes->count()]
        ]);
    }

    public function redeem(Request $req, $rifa, $type) {
        $user = $req->user();
        if (!$user) return response()->json(['msg'=>'Não autenticado'],401);

        try {
            $data = $this->svc->redeem($user->id, (int)$rifa, $type, $req->header('Idempotency-Key'));
            return response()->json(['data'=>$data]);
        } catch (\Throwable $e) {
            return response()->json(['msg'=>$e->getMessage()], 422);
        }
    }
}

