<?php
header('Content-Type: application/json');
try {
    $dbName = "u434605668_sorteiopremium";
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=$dbName", "u434605668_sorteiopremium", "SorteioPremiumMultiMarca1!2#%34.");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $results = ['database' => $dbName, 'tables' => []];
    
    foreach ($tables as $table) {
        $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
        $results['tables'][$table] = $count;
    }
    
    // Detailed check for specific tables
    foreach (['afiliados', 'users', 'clients', 'ganho_afiliados', 'site_config', 'payment_info'] as $table) {
        if (in_array($table, $tables)) {
            $results['details'][$table] = $pdo->query("SELECT * FROM `$table` LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
        }
    }
    
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()], JSON_PRETTY_PRINT);
}
