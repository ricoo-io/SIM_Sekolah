<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapot extends Model
{
    use HasFactory;

    protected $table = 'rapot';

    protected $fillable = [
        'id_siswa',
        'tahun_ajaran',
        'semester',
        'sakit',
        'izin',
        'alpha',
        'catatan_wali_kelas',
    ];

    protected $casts = [
        'sakit' => 'integer',
        'izin' => 'integer',
        'alpha' => 'integer',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa');
    }
}
