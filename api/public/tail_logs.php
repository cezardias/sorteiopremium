<?php
// Secure tail_logs.php to see the last entries of laravel.log
$logFile = __DIR__ . '/../storage/logs/laravel.log';

if (!file_exists($logFile)) {
    die("Log file not found at: " . $logFile);
}

header('Content-Type: text/plain');
$lines = 50;
$data = shell_exec("tail -n $lines " . escapeshellarg($logFile));

if (!$data) {
    // Fallback if tail is not available
    $file = file($logFile);
    $data = implode("", array_slice($file, -$lines));
}

echo "--- LAST $lines LINES OF LARAVEL.LOG ---\n";
echo $data;
