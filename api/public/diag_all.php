<?php
header('Content-Type: application/json');
try {
    $pdo = new PDO("mysql:host=127.0.0.1", "u434605668_sorteiospremiu", "SorteioPremiumMultiMarca1!2#%34.");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $dbs = $pdo->query("SHOW DATABASES")->fetchAll(PDO::FETCH_COLUMN);
    $results = [];
    
    foreach ($dbs as $db) {
        if ($db == 'information_schema' || $db == 'performance_schema' || $db == 'mysql' || $db == 'sys') continue;
        
        try {
            $pdo->exec("USE `$db` ");
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            
            $afiliados = 0;
            if (in_array('afiliados', $tables)) {
                $afiliados = $pdo->query("SELECT COUNT(*) FROM afiliados")->fetchColumn();
            }
            
            $clients = 0;
            if (in_array('clients', $tables)) {
                $clients = $pdo->query("SELECT COUNT(*) FROM clients")->fetchColumn();
            }
            
            $results[$db] = [
                'afiliados' => $afiliados,
                'clients' => $clients,
                'tables' => count($tables)
            ];
        } catch (Exception $e) {
            $results[$db] = ['error' => $e->getMessage()];
        }
    }
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()], JSON_PRETTY_PRINT);
}
