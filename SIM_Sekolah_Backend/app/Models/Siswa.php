<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    use HasFactory;

    protected $table = 'siswa';

    protected $fillable = [
        'nis',
        'nama',
        'alamat',
        'ibu',
        'ayah',
        'wali',
        'kontak_wali',
        'id_kelas',
    ];

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }

    public function penilaian()
    {
        return $this->hasMany(Penilaian::class, 'id_siswa');
    }

    public function rapot()
    {
        return $this->hasMany(Rapot::class, 'id_siswa');
    }
}
