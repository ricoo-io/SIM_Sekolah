<?php

namespace Database\Factories;

use App\Models\Siswa;
use App\Models\Kelas;
use Illuminate\Database\Eloquent\Factories\Factory;

class SiswaFactory extends Factory
{
    protected $model = Siswa::class;

    public function definition(): array
    {
        return [
            'nis' => fake()->unique()->numerify('##########'),
            'nama' => fake()->name(),
            'alamat' => fake()->address(),
            'ibu' => fake()->name('female'),
            'ayah' => fake()->name('male'),
            'wali' => fake()->name(),
            'kontak_wali' => fake()->phoneNumber(),
            'id_kelas' => Kelas::factory(),
        ];
    }
}
