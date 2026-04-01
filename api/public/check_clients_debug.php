<?php
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');

try {
    $search = '999449572';
    
    // Clients Check
    $allClients = DB::table('clients')->select('id', 'name', 'cellphone')->get();
    $matchesClients = $allClients->filter(function($c) use ($search) {
        $norm = preg_replace('/\D/', '', $c->cellphone);
        return str_contains($norm, $search);
    });

    // Users Check (Admins)
    // Note: 'users' might not have 'cellphone', it might be 'phone' or something else
    // Let's check columns for 'users' 
    $userColumns = Schema::getColumnListing('users');
    $matchesUsers = [];
    if (in_array('cellphone', $userColumns) || in_array('phone', $userColumns)) {
        $phoneField = in_array('cellphone', $userColumns) ? 'cellphone' : 'phone';
        $allUsers = DB::table('users')->select('id', 'name', $phoneField . ' as phone')->get();
        $matchesUsers = $allUsers->filter(function($u) use ($search) {
            $norm = preg_replace('/\D/', '', $u->phone);
            return str_contains($norm, $search);
        });
    }

    echo json_encode([
        'total_clients' => $allClients->count(),
        'search_numbers' => $search,
        'matches_in_clients' => $matchesClients->values(),
        'matches_in_users' => $matchesUsers->values(),
        'user_columns' => $userColumns,
        'first_5_clients' => $allClients->take(5)->values()
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
