<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    $user = User::updateOrCreate(
        ['email' => 'cezar.dias@gmail.com'],
        [
            'name' => 'Cezar Dias Admin',
            'password' => Hash::make('123456'),
            'role' => 'superadmin',
            'cellphone' => '00000000000',
            'cpf' => '00000000000'
        ]
    );
    echo "<h1>Usuário Admin criado com sucesso!</h1>";
    echo "Email: " . $user->email . "<br>";
    echo "Role: " . $user->role . "<br>";
    echo "ID: " . $user->id;
} catch (\Exception $e) {
    echo "Erro ao criar usuário: " . $e->getMessage();
}
