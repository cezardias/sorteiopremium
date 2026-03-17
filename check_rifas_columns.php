<?php
require 'api/vendor/autoload.php';
$app = require_once 'api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$columns = DB::select("SHOW COLUMNS FROM rifas");
echo json_encode($columns, JSON_PRETTY_PRINT);
