<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/test-sanity', function () {
    return "Laravel minimal boot works!";
});

// A temporary recovery route that doesn't use any external models yet
Route::get('/recovery-test', function () {
    return "Recovery test endpoint alive.";
});