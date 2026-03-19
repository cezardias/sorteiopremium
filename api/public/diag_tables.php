<?php
$user = "u434605668_sorteiospremiu";
$pass = "SorteioPremiumMultiMarca1!2#%34.";
$dbs = ["u434605668_sorteiopremium", "u434605668_sorteiospremiu"];

foreach ($dbs as $db) {
    echo "--- CHECKING DB: $db ---\n";
    try {
        $pdo = new PDO("mysql:host=127.0.0.1;dbname=$db", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo "TABLES FOUND: " . implode(", ", $tables) . "\n";
        
        if (in_array('rifas', $tables)) {
            echo "SUCCESS: 'rifas' found in $db\n";
        }
        if (in_array('site_settings', $tables)) {
            echo "SUCCESS: 'site_settings' found in $db\n";
        }
    } catch (\Exception $e) {
        echo "ERROR connecting to $db: " . $e->getMessage() . "\n";
    }
    echo "\n";
}
