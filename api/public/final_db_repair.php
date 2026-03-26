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

echo "--- REPARO DE BANCO DE DADOS (V2) ---\n\n";

// 1. Corrigir nomes de tabelas se necessário
if (!Schema::hasTable('rifas_pay') && Schema::hasTable('rifa_pays')) {
    echo "Renomeando 'rifa_pays' para 'rifas_pay' para compatibilidade...\n";
    try {
        DB::statement("RENAME TABLE `rifa_pays` TO `rifas_pay` ");
        echo "TABELA RENOMEADA COM SUCESSO!\n";
    } catch (\Exception $e) {
        echo "Erro ao renomear: " . $e->getMessage() . "\n";
    }
}

$changes = [
    'rifas' => [
        ['column' => 'img', 'type' => 'VARCHAR(255) NULL AFTER user_id'],
        ['column' => 'user_id', 'type' => 'INT NULL AFTER end_rifa'],
        ['column' => 'winner_id', 'type' => 'INT NULL AFTER user_id'],
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
                // Tenta adicionar sem especificar posição primeiro se falhar com AFTER
                try {
                    DB::statement("ALTER TABLE `$table` ADD COLUMN `$columnName` $type");
                } catch (\Exception $posError) {
                     // Tira o "AFTER ..." do tipo se falhar por causa da posição
                     $cleanType = preg_replace('/AFTER\s+\w+/i', '', $type);
                     DB::statement("ALTER TABLE `$table` ADD COLUMN `$columnName` $cleanType");
                }
                echo "COLUNA '$columnName' ADICIONADA COM SUCESSO!\n";
            } catch (\Exception $e) {
                echo "ERRO ao adicionar '$columnName': " . $e->getMessage() . "\n";
            }
        } else {
            echo "Coluna '$columnName' já existe na tabela '$table'.\n";
        }
    }
}

echo "\nFIM DO REPARO V2.\n";
