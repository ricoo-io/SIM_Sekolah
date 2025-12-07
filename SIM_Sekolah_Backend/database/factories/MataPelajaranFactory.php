<?php

namespace Database\Factories;

use App\Models\MataPelajaran;
use Illuminate\Database\Eloquent\Factories\Factory;

class MataPelajaranFactory extends Factory
{
    protected $model = MataPelajaran::class;

    public function definition(): array
    {
        return [
            'mata_pelajaran' => fake()->randomElement([
                'Matematika',
                'Bahasa Indonesia',
                'Bahasa Inggris',
                'IPA',
                'IPS',
                'PKN',
                'Pendidikan Agama',
                'Seni Budaya',
                'Penjaskes',
                'Prakarya',
            ]),
            'kkm' => fake()->numberBetween(70, 80),
        ];
    }
}
