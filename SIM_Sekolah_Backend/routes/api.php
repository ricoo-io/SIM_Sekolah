<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\KelasController;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\Api\MataPelajaranController;
use App\Http\Controllers\Api\GuruMataPelajaranController;
use App\Http\Controllers\Api\PenilaianController;
use App\Http\Controllers\Api\RapotController;
use Illuminate\Support\Facades\Route;


Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    
    Route::apiResource('users', UserController::class);
    Route::get('/users-guru', [UserController::class, 'guru']);
    Route::apiResource('kelas', KelasController::class);
    Route::apiResource('siswa', SiswaController::class);
    Route::apiResource('mapel', MataPelajaranController::class);
    Route::apiResource('guru-mapel', GuruMataPelajaranController::class);
    Route::apiResource('penilaian', PenilaianController::class);
    Route::apiResource('rapot', RapotController::class);
});
