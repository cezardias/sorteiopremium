<?php
echo "--- ROUTING DIAGNOSTIC ---\n";
echo "HOST: " . $_SERVER['HTTP_HOST'] . "\n";
echo "URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "\n";
echo "DOCUMENT_ROOT: " . $_SERVER['DOCUMENT_ROOT'] . "\n";

$file = __DIR__ . '/assets/index-B3NLPJOb.js';
echo "\nChecking asset: $file\n";
if (file_exists($file)) {
    echo "EXISTS! Size: " . filesize($file) . " bytes\n";
} else {
    echo "NOT FOUND!\n";
}
