<?php
header('Content-Type: text/plain');

$file = __DIR__ . '/../app/Models/V1/RifaPay.php';

if (file_exists($file)) {
    echo "--- CONTENT OF RifaPay.php ---\n\n";
    echo file_get_contents($file);

    echo "\n\n--- CONTENT OF RifaNumber.php ---\n\n";
    $file2 = __DIR__ . '/../app/Models/V1/RifaNumber.php';
    if (file_exists($file2)) {
        echo file_get_contents($file2);
    }

} else {
    echo "File not found: $file";
}

echo "\n\n--- CHECKING DIRECTORY LISTING ---\n";
$dir = __DIR__ . '/../app/Models/V1';
if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $f) {
        if ($f !== '.' && $f !== '..') {
            echo $f . " (" . filesize($dir . '/' . $f) . " bytes)\n";
        }
    }
}
