<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/plain');

echo "--- REPARO DE BANCO DE DADOS (COLUNAS FALTANTES) ---\n\n";

$changes = [
    'rifas' => [
        ['column' => 'img', 'type' => 'VARCHAR(255) NULL AFTER user_id'],
        ['column' => 'user_id', 'type' => 'INT NULL AFTER end_rifa'],
        ['column' => 'winner_number', 'type' => 'VARCHAR(255) NULL AFTER winner_id'],
    ],
    'cotas' => [
        ['column' => 'qntd_cota_digit', 'type' => 'INT DEFAULT 0 AFTER qntd_cota'],
    ],
];

foreach ($changes as $table => $columns) {
    if (!Schema::hasTable($table)) {
        echo "Tabela '$table' NÃO encontrada. Pulando.\n";
        continue;
    }

    foreach ($columns as $col) {
        $columnName = $col['column'];
        $type = $col['type'];

        if (!Schema::hasColumn($table, $columnName)) {
            echo "Adicionando coluna '$columnName' na tabela '$table'...\n";
            try {
                DB::statement("ALTER TABLE `$table` ADD COLUMN `$columnName` $type");
                echo "COLUNA '$columnName' ADICIONADA COM SUCESSO!\n";
            } catch (\Exception $e) {
                // Tenta sem IF NOT EXISTS ou com sintaxe alternativa se falhar
                try {
                     DB::statement("ALTER TABLE `$table` ADD `$columnName` $type");
                     echo "COLUNA '$columnName' ADICIONADA (Sintaxe 2)!\n";
                } catch (\Exception $e2) {
                     echo "ERRO ao adicionar '$columnName': " . $e2->getMessage() . "\n";
                }
            }
        } else {
            echo "Coluna '$columnName' já existe na tabela '$table'.\n";
        }
    }
}

echo "\n--- VERIFICANDO TABELA DE PEDIDOS ---\n";
if (Schema::hasTable('rifas_pay')) {
    echo "Tabela 'rifas_pay' existe.\n";
} elseif (Schema::hasTable('rifa_pays')) {
    echo "Tabela 'rifa_pays' existe.\n";
} else {
    echo "Nenhuma tabela de pagamento (rifas_pay/rifa_pays) encontrada!\n";
}

echo "\nFIM DO REPARO.\n";
