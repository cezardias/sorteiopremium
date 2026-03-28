<?php
header('Content-Type: text/plain');
echo "--- DIRECT DATABASE AUDIT (VIA API) ---\n";

$db_host = 'localhost';
$db_user = 'u434605668_sorteiospremiu';
$db_pass = 'SorteiosPremiumMultiMarca1!2#%34.';
$db_name = 'u434605668_sorteiospremiu';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected as $db_user to $db_name\n\n";

$tables = ['users', 'rifas', 'rifas_pay', 'clients'];
foreach ($tables as $table) {
    $result = $conn->query("SELECT COUNT(*) as total FROM $table");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "Table $table: " . $row['total'] . " records\n";
    } else {
        echo "Table $table: ERROR (" . $conn->error . ")\n";
    }
}

echo "\n--- TESTING STATUS FILTER ---\n";
$result = $conn->query("SELECT status, count(*) as count FROM rifas GROUP BY status");
if ($result) {
    while($row = $result->fetch_assoc()) {
        echo "Status: " . $row['status'] . " -> " . $row['count'] . "\n";
    }
}

$conn->close();
