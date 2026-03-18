<?php
// Standalone DB Check (Plain PHP)
$envFile = __DIR__ . '/../.env';
if (!file_exists($envFile)) {
    die("Error: .env file not found at $envFile");
}

$env = parse_ini_file($envFile);
$host = '127.0.0.1';
$db   = 'u434605668_sorteiopremium';
$user = 'u434605668_sorteiospremiu';
$pass = 'SorteioPremiumMultiMarca1!2#%34.';

echo "DEBUG: host=[$host] db=[$db] user=[$user] pass_len=" . strlen($pass) . "<br>";
echo "Attempting to connect...<br>";

try {
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    echo "DSN: $dsn<br>";
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully!<br>";
    
    // Check tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables found: " . implode(", ", $tables) . "<br><br>";
    
    if (in_array('rifa_pay', $tables)) {
        $count = $pdo->query("SELECT COUNT(*) FROM rifa_pay")->fetchColumn();
        echo "Order count (rifa_pay): $count<br>";
        $latest = $pdo->query("SELECT * FROM rifa_pay ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        echo "Latest rifa_pay: " . json_encode($latest) . "<br>";
    }

    if (in_array('cotas', $tables)) {
        $count = $pdo->query("SELECT COUNT(*) FROM cotas")->fetchColumn();
        echo "Order count (cotas): $count<br>";
        $latest = $pdo->query("SELECT * FROM cotas ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        echo "Latest cota: " . json_encode($latest) . "<br>";
    }

    if (in_array('rifa_numbers', $tables)) {
        $count = $pdo->query("SELECT COUNT(*) FROM rifa_numbers")->fetchColumn();
        echo "Number count (rifa_numbers): $count<br>";
        $latest = $pdo->query("SELECT * FROM rifa_numbers ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        echo "Latest number: " . json_encode($latest) . "<br>";
    }

    if (in_array('rifas', $tables)) {
        $count = $pdo->query("SELECT COUNT(*) FROM rifas")->fetchColumn();
        echo "Rifle count (rifas): $count<br>";
    }

    // Check specific Ataliba orders if possible
    if (in_array('clients', $tables)) {
         $ataliba = $pdo->query("SELECT * FROM clients WHERE name LIKE '%Ataliba%'")->fetch(PDO::FETCH_ASSOC);
         if ($ataliba) {
             echo "Found Ataliba: ID=" . $ataliba['id'] . "<br>";
             $cID = $ataliba['id'];
             $cCount = $pdo->query("SELECT COUNT(*) FROM cotas WHERE client_id = $cID")->fetchColumn();
             echo "Ataliba cotas count: $cCount<br>";
             $nCount = $pdo->query("SELECT COUNT(*) FROM rifa_numbers WHERE client_id = $cID")->fetchColumn();
             echo "Ataliba numbers count: $nCount<br>";
         }
    }

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
