<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuruMataPelajaran extends Model
{
    use HasFactory;

    protected $table = 'guru_mata_pelajaran';

    protected $fillable = [
        'id_guru',
        'id_mapel',
        'id_kelas',
    ];


    public function guru()
    {
        return $this->belongsTo(User::class, 'id_guru');
    }

    public function mapel()
    {
        return $this->belongsTo(MataPelajaran::class, 'id_mapel');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }
}
