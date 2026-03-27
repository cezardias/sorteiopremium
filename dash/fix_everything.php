<?php
header('Content-Type: text/plain');
echo "--- ANTIGRAVITY SELF-FIX SCRIPT ---\n";

function safe_write($path, $content) {
    echo "Writing to: $path ... ";
    if (file_put_contents($path, $content)) {
        echo "SUCCESS!\n";
    } else {
        echo "FAILED! Check permissions.\n";
    }
}

// 1. .htaccess da RAIZ (public_html)
$root_htaccess = '<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  RewriteRule "(^|/)\.(?!well-known)" - [F]
  RewriteRule "^(composer\.json|composer\.lock|package\.json|package-lock\.json|vite\.config\.js|tailwind\.config\.js|tsconfig\.json)$" - [F]
  DirectoryIndex index.html
  RewriteRule ^index\.html$ - [L]
  
  # BYPASS PARA SUBDOMÍNIO DASH
  RewriteCond %{HTTP_HOST} ^dash\. [NC,OR]
  RewriteCond %{REQUEST_URI} ^/(api|dash|assets|storage|check_pedidos\.php) [NC]
  RewriteRule ^ - [L]

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>';

// 2. .htaccess do DASH
$dash_htaccess = '<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . index.html [L]
</IfModule>';

// Localização dos arquivos baseada no DOCUMENT_ROOT
$root_dir = $_SERVER['DOCUMENT_ROOT'];
if (strpos($root_dir, '/dash') !== false) {
    $root_dir = dirname($root_dir);
}

safe_write($root_dir . '/.htaccess', $root_htaccess);
safe_write($root_dir . '/dash/.htaccess', $dash_htaccess);

// 3. Tentar Git Pull via PHP (se o deploy da Hostinger estiver travado)
echo "\nAttempting Git Pull...\n";
exec('git fetch origin main && git reset --hard origin/main 2>&1', $output, $return_var);
foreach ($output as $line) {
    echo "$line\n";
}

echo "\n--- SYSTEM CHECK ---\n";
echo "Root .htaccess size: " . filesize($root_dir . '/.htaccess') . " bytes\n";
echo "Dash .htaccess size: " . filesize($root_dir . '/dash/.htaccess') . " bytes\n";
echo "Done! Limpe o cache do seu navegador (Ctrl + F5).\n";
