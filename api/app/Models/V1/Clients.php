<?php
namespace App\Models\V1;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tymon\JWTAuth\Contracts\JWTSubject;

use Symfony\Component\HttpFoundation\Response;


use App\Models\V1\{RifaNumber};


class Clients extends Authenticatable implements JWTSubject
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name', 'surname', 'cellphone', 'api_token', 'cpf', 'email'];

    public function rifaNumbers(): HasMany
    {
        return $this->hasMany(RifaNumber::class, 'client_id');
    }

    public static function createClient($name, $surname, $cellphone, $cpf = null, $email = null)
    {
        try {
            $client = self::firstOrCreate(
                ['cellphone' => $cellphone],
                [
                    'name' => $name,
                    'surname' => $surname,
                    'cellphone' => $cellphone,
                    'cpf' => $cpf,
                    'email' => $email,
                ]
            );
            return $client->wasRecentlyCreated;
        } catch (\Throwable $th) {
            return response()->json(['message' => 'Erro interno'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public static function normalizeCellphone($cellphone)
    {
        return preg_replace('/[^0-9]/', '', $cellphone);
    }

    public static function findClient($cellphone)
    {
        $normalized = self::normalizeCellphone($cellphone);
        
        // 1. Tenta buscar o exato (pode ser com máscara ou sem)
        $client = self::where('cellphone', $cellphone)->first();
        if ($client) return $client;

        // 2. Tenta buscar apenas os dígitos
        $client = self::where('cellphone', $normalized)->first();
        if ($client) return $client;

        // 3. Busca limpando símbolos comuns no SQL (compatível com a maioria das versões de MySQL/MariaDB)
        // Isso remove ( ) - e espaço
        $client = self::whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(cellphone, '(', ''), ')', ''), '-', ''), ' ', '') = ?", [$normalized])->first();
        if ($client) return $client;

        // 4. Tenta lidar com o prefixo 55
        $without55 = (substr($normalized, 0, 2) === '55') ? substr($normalized, 2) : $normalized;
        $client = self::whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(cellphone, '(', ''), ')', ''), '-', ''), ' ', '') LIKE ?", ["%$without55"])->first();
        
        return $client;
    }
    public static function findClientById($id)
    {
        $client = self::where('id', $id)->first();
        return $client;
    }
    public static function getAllClient()
    {
        return self::paginate(20);
    }

    public static function editarClient($date)
    {
        $client = self::where('id', $date->id)->update([
            'name' => $date->name,
            'surname' => $date->surname,
            'cellphone' => $date->cellphone,
            'cpf' => $date->cpf,
            'email' => $date->email,
        ]);
        return $client;
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'surname' => $this->surname,
            'cellphone' => $this->cellphone,
            'cpf' => $this->cpf,
            'email' => $this->email,
            'api_token' => $this->api_token,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }


}
