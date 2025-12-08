<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penilaian;
use Illuminate\Http\Request;

class PenilaianController extends Controller
{
    public function index(Request $request)
    {
        $query = Penilaian::with(['siswa.kelas', 'mapel', 'guru']);

        if ($request->has('mapel') && $request->has('kelas')) {
            $query->where('id_mapel', $request->mapel)
                  ->whereHas('siswa', function($q) use ($request) {
                      $q->where('id_kelas', $request->kelas);
                  });
        }

        if ($request->has('siswa')) {
            $query->where('id_siswa', $request->siswa);
        }

        $penilaian = $query->get();
        return response()->json($penilaian);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_siswa' => 'required|exists:siswa,id',
            'id_mapel' => 'required|exists:mata_pelajaran,id',
            'id_guru' => 'required|exists:users,id',
            'semester' => 'required|in:ganjil,genap',
            'nilai_harian_1' => 'nullable|numeric|min:0|max:100',
            'nilai_harian_2' => 'nullable|numeric|min:0|max:100',
            'nilai_harian_3' => 'nullable|numeric|min:0|max:100',
            'nilai_UTS' => 'nullable|numeric|min:0|max:100',
            'nilai_harian_4' => 'nullable|numeric|min:0|max:100',
            'nilai_harian_5' => 'nullable|numeric|min:0|max:100',
            'nilai_harian_6' => 'nullable|numeric|min:0|max:100',
            'nilai_UAS' => 'nullable|numeric|min:0|max:100',
            'nilai_Akhir' => 'nullable|numeric|min:0|max:100',
        ]);

        $validated['update_terakhir'] = now();

        // Upsert: update if exists, create if not
        $penilaian = Penilaian::updateOrCreate(
            [
                'id_siswa' => $validated['id_siswa'],
                'id_mapel' => $validated['id_mapel'],
                'semester' => $validated['semester'],
            ],
            $validated
        );

        return response()->json($penilaian->load(['siswa', 'mapel', 'guru']), 201);
    }

    public function show($id)
    {
        $penilaian = Penilaian::with(['siswa', 'mapel', 'guru'])->findOrFail($id);
        return response()->json($penilaian);
    }

    public function update(Request $request, $id)
    {
        $penilaian = Penilaian::findOrFail($id);

        $validated = $request->validate([
            'nilai_harian_1' => 'sometimes|nullable|numeric|min:0|max:100',
            'nilai_harian_2' => 'sometimes|nullable|numeric|min:0|max:100',
            'nilai_harian_3' => 'sometimes|nullable|numeric|min:0|max:100',
            'nilai_UTS' => 'sometimes|nullable|numeric|min:0|max:100',
            'nilai_harian_4' => 'sometimes|nullable|numeric|min:0|max:100',
            'nilai_harian_5' => 'sometimes|nullable|numeric|min:0|max:100',
            'nilai_harian_6' => 'sometimes|nullable|numeric|min:0|max:100',
            'nilai_UAS' => 'sometimes|nullable|numeric|min:0|max:100',
            'nilai_Akhir' => 'sometimes|nullable|numeric|min:0|max:100',
        ]);

        $validated['update_terakhir'] = now();
        $penilaian->update($validated);

        return response()->json($penilaian->load(['siswa', 'mapel', 'guru']));
    }

    public function destroy($id)
    {
        $penilaian = Penilaian::findOrFail($id);
        $penilaian->delete();
        return response()->json(['message' => 'Penilaian deleted successfully']);
    }
}
