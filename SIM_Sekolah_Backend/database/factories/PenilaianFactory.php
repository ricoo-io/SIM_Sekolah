<?php

namespace Database\Factories;

use App\Models\Penilaian;
use App\Models\Siswa;
use App\Models\MataPelajaran;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PenilaianFactory extends Factory
{
    protected $model = Penilaian::class;

    public function definition(): array
    {
        $nilaiHarian1 = fake()->numberBetween(60, 100);
        $nilaiHarian2 = fake()->numberBetween(60, 100);
        $nilaiHarian3 = fake()->numberBetween(60, 100);
        $nilaiUTS = fake()->numberBetween(60, 100);
        $nilaiHarian4 = fake()->numberBetween(60, 100);
        $nilaiHarian5 = fake()->numberBetween(60, 100);
        $nilaiHarian6 = fake()->numberBetween(60, 100);
        $nilaiUAS = fake()->numberBetween(60, 100);
        
        // Calculate final grade (average)
        $nilaiAkhir = ($nilaiHarian1 + $nilaiHarian2 + $nilaiHarian3 + $nilaiUTS + 
                       $nilaiHarian4 + $nilaiHarian5 + $nilaiHarian6 + $nilaiUAS) / 8;

        return [
            'id_siswa' => Siswa::factory(),
            'id_mapel' => MataPelajaran::factory(),
            'id_guru' => User::factory(),
            'semester' => fake()->randomElement(['ganjil', 'genap']),
            'nilai_harian_1' => $nilaiHarian1,
            'nilai_harian_2' => $nilaiHarian2,
            'nilai_harian_3' => $nilaiHarian3,
            'nilai_UTS' => $nilaiUTS,
            'nilai_harian_4' => $nilaiHarian4,
            'nilai_harian_5' => $nilaiHarian5,
            'nilai_harian_6' => $nilaiHarian6,
            'nilai_UAS' => $nilaiUAS,
            'nilai_Akhir' => round($nilaiAkhir, 2),
            'update_terakhir' => now(),
        ];
    }
}
