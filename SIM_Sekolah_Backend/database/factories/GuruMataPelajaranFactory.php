<?php

namespace Database\Factories;

use App\Models\GuruMataPelajaran;
use App\Models\User;
use App\Models\MataPelajaran;
use App\Models\Kelas;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuruMataPelajaranFactory extends Factory
{
    protected $model = GuruMataPelajaran::class;

    public function definition(): array
    {
        return [
            'id_guru' => User::factory(),
            'id_mapel' => MataPelajaran::factory(),
            'id_kelas' => Kelas::factory(),
        ];
    }
}
