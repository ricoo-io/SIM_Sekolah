<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penilaian extends Model
{
    use HasFactory;

    protected $table = 'penilaian';

    protected $fillable = [
        'id_siswa',
        'id_mapel',
        'id_guru',
        'semester',
        'nilai_harian_1',
        'nilai_harian_2',
        'nilai_harian_3',
        'nilai_UTS',
        'nilai_harian_4',
        'nilai_harian_5',
        'nilai_harian_6',
        'nilai_UAS',
        'nilai_Akhir',
        'update_terakhir',
    ];

    protected $casts = [
        'nilai_harian_1' => 'decimal:2',
        'nilai_harian_2' => 'decimal:2',
        'nilai_harian_3' => 'decimal:2',
        'nilai_UTS' => 'decimal:2',
        'nilai_harian_4' => 'decimal:2',
        'nilai_harian_5' => 'decimal:2',
        'nilai_harian_6' => 'decimal:2',
        'nilai_UAS' => 'decimal:2',
        'nilai_Akhir' => 'decimal:2',
        'update_terakhir' => 'datetime',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa');
    }

    public function mapel()
    {
        return $this->belongsTo(MataPelajaran::class, 'id_mapel');
    }

    public function guru()
    {
        return $this->belongsTo(User::class, 'id_guru');
    }
}
