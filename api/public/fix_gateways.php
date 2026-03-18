<?php
header('Content-Type: application/json');
try {
    $dbName = "u434605668_sorteiopremium";
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=$dbName", "u434605668_sorteiopremium", "SorteioPremiumMultiMarca1!2#%34.");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $results = [];

    // 1. Check and Fix site_config
    $siteConfig = $pdo->query("SELECT * FROM site_config WHERE id = 1")->fetch(PDO::FETCH_ASSOC);
    if (!$siteConfig) {
        $pdo->prepare("INSERT INTO site_config (id, gateway, created_at, updated_at) VALUES (1, 'cyber', NOW(), NOW())")->execute();
        $results['site_config_fix'] = "Created missing ID 1 with gateway=cyber";
    } else {
        if ($siteConfig['gateway'] !== 'cyber') {
            $old = $siteConfig['gateway'];
            $pdo->prepare("UPDATE site_config SET gateway = 'cyber', updated_at = NOW() WHERE id = 1")->execute();
            $results['site_config_fix'] = "Updated gateway from $old to cyber";
        } else {
            $results['site_config_fix'] = "Gateway already set to cyber";
        }
    }
    $results['current_site_config'] = $pdo->query("SELECT * FROM site_config WHERE id = 1")->fetch(PDO::FETCH_ASSOC);

    // 2. Check payment_info
    $results['payment_info_rows'] = $pdo->query("SELECT * FROM payment_info")->fetchAll(PDO::FETCH_ASSOC);

    // 3. Clear application cache if possible (via helper if you had one, but let's just do it manually in routes if needed)
    
    echo json_encode(['success' => true, 'results' => $results], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_PRETTY_PRINT);
}
