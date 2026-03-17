<?php
$file = 'assets/index-BYZrYQ3-.js';
if (!file_exists($file)) {
    die("File not found: $file");
}
$content = file_get_contents($file);
$patterns = ['MINHA CONTA', 'Meu Perfil', 'SORTEIOS', 'Produtos', 'Ganhadores', 'GANHADORES'];
echo "Checking $file:\n";
foreach ($patterns as $pattern) {
    if (strpos($content, $pattern) !== false) {
        echo "FOUND: $pattern\n";
    } else {
        echo "NOT FOUND: $pattern\n";
    }
}
