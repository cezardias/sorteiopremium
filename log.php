<?php
header('Access-Control-Allow-Origin: *');
$err = $_GET['err'] ?? $_POST['err'] ?? 'No error specified';
file_put_contents(__DIR__ . '/react_error.txt', date('Y-m-d H:i:s') . "\n" . $err . "\n-------------------------\n", FILE_APPEND);
echo "OK";
