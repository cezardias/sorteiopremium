<?php
// Enhanced Diagnostic Script
header('Content-Type: application/json');

$databases = [
    'u434605668_sorteiopremium' => ['user' => 'u434605668_sorteiopremium', 'pass' => 'SorteioPremiumMultiMarca1!2#%34.'],
    'u434605668_sorteiospremiu' => ['user' => 'u434605668_sorteiospremiu', 'pass' => 'SorteioPremiumMultiMarca1!2#%34.'],
    'u526640676_rifa'           => ['user' => 'u526640676_rifa',           'pass' => 'NITyg7G>']
];

$results = [];

foreach ($databases as $dbName => $creds) {
    try {
        $pdo = new PDO("mysql:host=127.0.0.1;dbname=$dbName", $creds['user'], $creds['pass']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        $counts = [];
        
        $checkTables = ['afiliados', 'clients', 'rifas', 'rifas_payments', 'users'];
        foreach ($checkTables as $table) {
            if (in_array($table, $tables)) {
                $counts[$table] = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            } else {
                $counts[$table] = 'TABLE NOT FOUND';
            }
        }
        
        $results[$dbName] = [
            'status' => 'Connected',
            'counts' => $counts,
            'tables_total' => count($tables)
        ];
    } catch (Exception $e) {
        $results[$dbName] = [
            'status' => 'Error',
            'message' => $e->getMessage()
        ];
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
