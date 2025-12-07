<?php

namespace Database\Factories;

use App\Models\Rapot;
use App\Models\Siswa;
use Illuminate\Database\Eloquent\Factories\Factory;

class RapotFactory extends Factory
{
    protected $model = Rapot::class;

    public function definition(): array
    {
        return [
            'id_siswa' => Siswa::factory(),
            'tahun_ajaran' => '2024/2025',
            'semester' => fake()->randomElement(['ganjil', 'genap']),
            'sakit' => fake()->numberBetween(0, 5),
            'izin' => fake()->numberBetween(0, 3),
            'alpha' => fake()->numberBetween(0, 2),
            'catatan_wali_kelas' => fake()->sentence(),
        ];
    }
}
