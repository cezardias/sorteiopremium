<?php
echo "DEBUG FILE SYSTEM\n";
$dir = __DIR__ . '/../vendor';
if (file_exists($dir)) {
    echo "Vendor exists. Contents:\n";
    print_r(scandir($dir));
} else {
    echo "Vendor DOES NOT EXIST at $dir\n";
}
