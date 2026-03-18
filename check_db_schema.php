<?php
require 'api/vendor/autoload.php';
$app = require_once 'api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$columns = Schema::getColumnListing('rifas');
echo "Columns in 'rifas' table:\n";
print_r($columns);

$columnsCotas = Schema::getColumnListing('cotas');
echo "\nColumns in 'cotas' table:\n";
print_r($columnsCotas);
