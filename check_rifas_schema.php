<?php
require 'api/vendor/autoload.php';
$app = require_once 'api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$table = 'rifas';
if (Schema::hasTable($table)) {
    echo "Table: $table\n";
$columns = DB::select("DESCRIBE rifas");
foreach ($columns as $column) {
    echo " - {$column->Field} ({$column->Type})\n";
}
} else {
    echo "Table $table does NOT exist!\n";
}
