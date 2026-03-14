<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    echo "Starting manual migration...<br>";
    
    if (!Schema::hasTable('site_config')) {
        echo "Creating table 'site_config'...<br>";
        Schema::create('site_config', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->nullable();
            $table->string('plataform_name')->nullable();
            $table->string('whatsapp_link')->nullable();
            $table->string('instagram_link')->nullable();
            $table->string('url_logo_site')->nullable();
            $table->string('url_favicon_site')->nullable();
            $table->string('meta_pixel')->nullable();
            $table->timestamps();
        });
        echo "Table 'site_config' created successfully!<br>";
    } else {
        echo "Table 'site_config' already exists.<br>";
    }
    
    // Seed initial data if empty
    if (DB::table('site_config')->count() == 0) {
        echo "Seeding initial data...<br>";
        DB::table('site_config')->insert([
            'site_name' => 'Sorteio Premium',
            'plataform_name' => 'Premium Multimarcas',
            'gateway' => 'cyber'
        ]);
        echo "Initial data seeded.<br>";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
