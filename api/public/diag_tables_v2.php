<?php
// Comprehensive Table Search across common prefixes
$user = "u434605668_sorteiospremiu";
$pass = "SorteioPremiumMultiMarca1!2#%34.";

// Try a range of possible DB names based on the prefix
$prefixes = ["u434605668_", "u526640676_"];
$suffixes = ["sorteiopremium", "sorteiospremiu", "rifa", "sorteio"];

foreach ($prefixes as $p) {
    foreach ($suffixes as $s) {
        $db = $p . $s;
        try {
            $pdo = new PDO("mysql:host=127.0.0.1;dbname=$db", $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            if (in_array('rifas', $tables) && in_array('site_settings', $tables)) {
                 die("FOUND REAL DB: $db - Tables: " . implode(", ", $tables));
            }
            echo "Connected to $db, but rifas/site_settings not found.\n";
        } catch (\Exception $e) {
            // echo "Error $db: " . $e->getMessage() . "\n";
        }
    }
}
echo "NONE FOUND with user $user. Trying user u434605668_sorteiopremium...\n";

$user2 = "u434605668_sorteiopremium";
foreach ($prefixes as $p) {
    foreach ($suffixes as $s) {
        $db = $p . $s;
        try {
            $pdo = new PDO("mysql:host=127.0.0.1;dbname=$db", $user2, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            if (in_array('rifas', $tables) && in_array('site_settings', $tables)) {
                 die("FOUND REAL DB (user2): $db - Tables: " . implode(", ", $tables));
            }
        } catch (\Exception $e) { }
    }
}
