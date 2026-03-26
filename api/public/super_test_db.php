<?php
$users = ['u434605668_sorteiopremium', 'u434605668_sorteiospremium'];
$passwords = ['SorteioPremiumMultiMarca1!2#%34.', 'SorteiosPremiumMultiMarca1!2#%34.'];
$dbs = ['u434605668_sorteiospremium', 'u434605668_sorteiopremium', 'u434605668_sorteiospremiu'];
$hosts = ['localhost', '127.0.0.1'];

echo "<h1>Super Teste de Conexão</h1>";
echo "<table border='1'><tr><th>Host</th><th>Usuário</th><th>Senha (Tipo)</th><th>Banco</th><th>Resultado</th></tr>";

foreach ($hosts as $host) {
    foreach ($users as $user) {
        foreach ($passwords as $p) {
            foreach ($dbs as $db) {
                $p_type = (strpos($p, 'Sorteios') === 0) ? "Plural" : "Singular";
                try {
                    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $p);
                    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    echo "<tr style='background: #cfc;'><td>$host</td><td>$user</td><td>$p_type</td><td>$db</td><td><b>SUCESSO!</b></td></tr>";
                    $conn = null;
                } catch (PDOException $e) {
                    $err = $e->getCode();
                    echo "<tr><td>$host</td><td>$user</td><td>$p_type</td><td>$db</td><td>Erro $err</td></tr>";
                }
            }
        }
    }
}
echo "</table>";
