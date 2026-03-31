<?php
header('Content-Type: text/plain');
$conn = new mysqli('localhost', 'u434605668_sorteiospremiu', 'SorteiosPremiumMultiMarca1!2#%34.', 'u434605668_sorteiospremiu');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$result = $conn->query("SHOW TABLES");
echo "TABLES IN DATABASE:\n";
while ($row = $result->fetch_array()) {
    $table = $row[0];
    echo "- $table\n";
    if (strpos($table, 'winner') !== false || strpos($table, 'afiliado') !== false || strpos($table, 'ganhador') !== false) {
        $count = $conn->query("SELECT COUNT(*) from $table")->fetch_array()[0];
        echo "  [INFO] $table has $count records!\n";
    }
}
$conn->close();
