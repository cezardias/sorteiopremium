<?php
header('Content-Type: text/plain');
echo "--- DATABASE AUDIT ---\n";

// Manual DB connect to bypass Laravel initialization issues
$db_host = 'localhost';
$db_user = 'u434605668_sorteiospremiu';
$db_pass = 'SorteiosPremiumMultiMarca1!2#%34.';
$db_name = 'u434605668_sorteiospremiu';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully to $db_name\n\n";

$tables = ['rifas', 'rifas_pay', 'users', 'clients'];
foreach ($tables as $table) {
    $result = $conn->query("SELECT COUNT(*) as total FROM $table");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "Table $table: " . $row['total'] . " records\n";
    } else {
        echo "Table $table: ERROR or MISSING\n";
    }
}

$conn->close();
