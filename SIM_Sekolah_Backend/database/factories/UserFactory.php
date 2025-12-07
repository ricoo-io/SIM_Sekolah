<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;


class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'nama' => fake()->name(),
            'nip' => fake()->unique()->numerify('##########'),
            'password' => static::$password ??= Hash::make('password'),
            'role' => 'guru',
            'wali_kelas' => false,
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'wali_kelas' => false,
        ]);
    }

    public function waliKelas(): static
    {
        return $this->state(fn (array $attributes) => [
            'wali_kelas' => true,
        ]);
    }
}
