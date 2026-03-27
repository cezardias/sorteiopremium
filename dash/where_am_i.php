<?php
header('Content-Type: text/plain');
echo "--- REMOTE DIRECTORY LISTING ---\n";
echo "DIR: " . __DIR__ . "\n\n";

$files = scandir(__DIR__);
foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    $path = __DIR__ . '/' . $file;
    echo "[" . (is_dir($path) ? "DIR" : "FILE") . "] $file (" . (is_file($path) ? filesize($path) : "---") . " bytes)\n";
    
    if (is_dir($path) && $file === 'assets') {
        echo "  --- ASSETS SUBDIR ---\n";
        $subfiles = scandir($path);
        foreach ($subfiles as $sf) {
            if ($sf === '.' || $sf === '..') continue;
            echo "  - $sf\n";
        }
    }
}
