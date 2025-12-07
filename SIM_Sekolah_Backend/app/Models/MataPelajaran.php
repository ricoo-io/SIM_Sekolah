<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MataPelajaran extends Model
{
    use HasFactory;

    protected $table = 'mata_pelajaran';

    protected $fillable = [
        'mata_pelajaran',
        'kkm',
    ];

    public function guruMataPelajaran()
    {
        return $this->hasMany(GuruMataPelajaran::class, 'id_mapel');
    }

    public function penilaian()
    {
        return $this->hasMany(Penilaian::class, 'id_mapel');
    }
}
