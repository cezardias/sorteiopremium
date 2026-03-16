<?php
// Diagnostic script to check two databases
define('DB_USER', 'u434605668_sorteiopremium');
define('DB_PASS', 'SorteioPremiumMultiMarca1!2#%34.');
define('DB_HOST', '127.0.0.1');

$dbs = ['u434605668_sorteiopremium', 'u434605668_sorteiospremiu'];
$results = [];

foreach ($dbs as $db) {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=$db", DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        
        $afiliadosCount = 0;
        if (in_array('afiliados', $tables)) {
            $stmt = $pdo->query("SELECT COUNT(*) FROM afiliados");
            $afiliadosCount = $stmt->fetchColumn();
        }
        
        $clientsCount = 0;
        if (in_array('clients', $tables)) {
            $stmt = $pdo->query("SELECT COUNT(*) FROM clients");
            $clientsCount = $stmt->fetchColumn();
        }

        $results[$db] = [
            'status' => 'Connected',
            'afiliados_count' => $afiliadosCount,
            'clients_count' => $clientsCount,
            'tables' => count($tables)
        ];
    } catch (Exception $e) {
        $results[$db] = [
            'status' => 'Error',
            'message' => $e->getMessage()
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($results, JSON_PRETTY_PRINT);
