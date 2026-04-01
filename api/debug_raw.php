<?php
$host = '127.0.0.1';
$db   = 'u434605668_sorteiospremiu';
$user = 'u434605668_sorteiospremiu';
$pass = 'SorteiosPremiumMultiMarca1!2#%34.';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     
     $rifa = $pdo->query("SELECT * FROM rifas WHERE id = 5")->fetch();
     $packages = $pdo->query("SELECT * FROM discount_packages WHERE rifas_id = 5")->fetchAll();
     $awarded = $pdo->query("SELECT * FROM awarded_quotas WHERE rifas_id = 5")->fetchAll();
     $settings = $pdo->query("SELECT * FROM settings LIMIT 1")->fetch();

     echo "--- DIAGNOSTIC START ---\n";
     echo "RIFA: " . ($rifas['title'] ?? 'NOT FOUND') . " (ID: 5)\n";
     echo "PACKAGES COUNT: " . count($packages) . "\n";
     foreach($packages as $p) echo " PKG: " . $p['qntd_cota'] . " units, price " . $p['valor_total'] . "\n";
     
     echo "AWARDED COUNT: " . count($awarded) . "\n";
     foreach($awarded as $a) echo " COTA: " . $a['number_cota'] . " status " . $a['status'] . "\n";

     echo "SETTINGS LOGO DARK: " . ($settings['logo_dark'] ?? 'NULL') . "\n";
     echo "SETTINGS FOOTER LOGO: " . ($settings['footer_logo'] ?? 'NULL') . "\n";
     echo "--- DIAGNOSTIC END ---\n";

} catch (\PDOException $e) {
     echo "DB ERROR: " . $e->getMessage();
}
