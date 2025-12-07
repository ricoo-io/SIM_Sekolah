<?php

namespace Database\Factories;

use App\Models\Kelas;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class KelasFactory extends Factory
{
    protected $model = Kelas::class;

    public function definition(): array
    {
        return [
            'id_guru' => null, 
            'nama_kelas' => fake()->randomElement(['A', 'B', 'C']),
            'tingkat' => fake()->randomElement(['7', '8', '9']),
        ];
    }
}
