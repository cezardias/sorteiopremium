<?php

$host = '127.0.0.1';
$user = 'u434605668_sorteiospremiu';
$pass = 'SorteioPremiumMultiMarca1!2#%34.'; // Senha fornecida
$db   = 'u434605668_sorteiospremiu';

echo "<h3>Testando Conexão com MariaDB/MySQL</h3>";

try {
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "<p style='color:green'>[Sucesso!] Conectado ao banco de dados <b>$db</b></p>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM rifas");
    $row = $stmt->fetch();
    echo "<p>Total de Rifas na tabela: <b>" . $row['total'] . "</b></p>";

} catch (\PDOException $e) {
     echo "<p style='color:red'>[Erro de Conexão] " . $e->getMessage() . "</p>";
     echo "<p>Se o erro for 1045, a senha ou usuário estão errados ou não têm permissão para conectar via 127.0.0.1 </p>";
}

echo "<hr>";
echo "<h4>Informações do Servidor:</h4>";
echo "PHP Version: " . phpversion() . "<br>";
echo "DB Host: " . $host . "<br>";
echo "DB User: " . $user . "<br>";
