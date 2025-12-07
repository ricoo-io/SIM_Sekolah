<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{

    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'nama',
        'nip',
        'password',
        'role',
        'wali_kelas',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'wali_kelas' => 'boolean',
            'password' => 'hashed',
        ];
    }


    public function kelasWali()
    {
        return $this->hasMany(Kelas::class, 'id_guru');
    }

    public function guruMataPelajaran()
    {
        return $this->hasMany(GuruMataPelajaran::class, 'id_guru');
    }

    public function penilaian()
    {
        return $this->hasMany(Penilaian::class, 'id_guru');
    }
}
