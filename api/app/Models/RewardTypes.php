<?php

namespace App\Models;

use App\Models\V1\Rifas;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RewardTypes extends Model
{
    use HasFactory;

    protected $fillable = ['code','name','is_active','giro_por_usuario','metadata','rifas_id'];
    protected $casts = ['metadata'=>'array','is_active'=>'boolean'];

    public function rifas() {
        return $this->belongsTo(Rifas::class, 'rifas_id');
    }

     public function itemsAll() {
        return $this->hasMany(RewardItems::class, 'reward_type_id')
            ->select(['id','reward_type_id','text','type','status','position_number','min_tries_required','guarantee_after','weight','metadata'])
            ->orderBy('position_number');
    }

    // Apenas os itens ativos (use se precisar em outro lugar)
    public function itemsActive() {
        return $this->hasMany(RewardItems::class, 'reward_type_id')
            ->where('status','active')
            ->select(['id','reward_type_id','text','type','status','position_number','min_tries_required','guarantee_after','weight','metadata'])
            ->orderBy('position_number');
    }

    public function items() {
        return $this->hasMany(RewardItems::class, 'reward_type_id')
            ->select(['reward_type_id','text','position_number','type','status'])
            ->orderBy('position_number');
    }
}
