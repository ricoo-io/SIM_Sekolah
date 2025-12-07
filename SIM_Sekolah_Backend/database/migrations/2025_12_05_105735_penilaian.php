<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('penilaian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_siswa')->constrained('siswa')->onDelete('cascade');
            $table->foreignId('id_mapel')->constrained('mata_pelajaran')->onDelete('cascade');
            $table->foreignId('id_guru')->constrained('users')->onDelete('cascade');
            $table->enum('semester', ['ganjil', 'genap']);
            $table->decimal('nilai_harian_1', 5, 2)->nullable();
            $table->decimal('nilai_harian_2', 5, 2)->nullable();
            $table->decimal('nilai_harian_3', 5, 2)->nullable();
            $table->decimal('nilai_UTS', 5, 2)->nullable();
            $table->decimal('nilai_harian_4', 5, 2)->nullable();
            $table->decimal('nilai_harian_5', 5, 2)->nullable();
            $table->decimal('nilai_harian_6', 5, 2)->nullable();
            $table->decimal('nilai_UAS', 5, 2)->nullable();
            $table->decimal('nilai_Akhir', 5, 2)->nullable();
            $table->timestamp('update_terakhir')->nullable();
            $table->timestamps();
            
            // Ensure unique grade per student per subject per semester
            $table->unique(['id_siswa', 'id_mapel', 'semester']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penilaian');
    }
};
