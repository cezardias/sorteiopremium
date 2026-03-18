<?php
// Standalone DB Check (Plain PHP)
$envFile = __DIR__ . '/../.env';
if (!file_exists($envFile)) {
    die("Error: .env file not found at $envFile");
}

$env = parse_ini_file($envFile);
$host = $env['DB_HOST'] ?? '127.0.0.1';
$db   = $env['DB_DATABASE'] ?? '';
$user = $env['DB_USERNAME'] ?? '';
$pass = $env['DB_PASSWORD'] ?? '';

echo "Attempting to connect to $db at $host as $user...<br>";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
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
        echo "Latest order: " . json_encode($latest) . "<br>";
    } else {
        echo "Table rifa_pay NOT FOUND!<br>";
    }

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
