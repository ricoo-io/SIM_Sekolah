<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rapot;
use Illuminate\Http\Request;

class RapotController extends Controller
{
    public function index(Request $request)
    {
        $query = Rapot::with('siswa.kelas');

        if ($request->has('siswa')) {
            $query->where('id_siswa', $request->siswa);
        }

        $rapot = $query->get();
        return response()->json($rapot);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_siswa' => 'required|exists:siswa,id',
            'tahun_ajaran' => 'required|string',
            'semester' => 'required|in:ganjil,genap',
            'sakit' => 'required|integer|min:0',
            'izin' => 'required|integer|min:0',
            'alpha' => 'required|integer|min:0',
            'catatan_wali_kelas' => 'nullable|string',
        ]);

        $rapot = Rapot::updateOrCreate(
            [
                'id_siswa' => $validated['id_siswa'],
                'tahun_ajaran' => $validated['tahun_ajaran'],
                'semester' => $validated['semester'],
            ],
            $validated
        );

        return response()->json($rapot->load('siswa'), 201);
    }

    public function show($id)
    {
        $rapot = Rapot::with('siswa')->findOrFail($id);
        return response()->json($rapot);
    }

    public function update(Request $request, $id)
    {
        $rapot = Rapot::findOrFail($id);

        $validated = $request->validate([
            'sakit' => 'sometimes|integer|min:0',
            'izin' => 'sometimes|integer|min:0',
            'alpha' => 'sometimes|integer|min:0',
            'catatan_wali_kelas' => 'sometimes|nullable|string',
        ]);

        $rapot->update($validated);
        return response()->json($rapot->load('siswa'));
    }

    public function destroy($id)
    {
        $rapot = Rapot::findOrFail($id);
        $rapot->delete();
        return response()->json(['message' => 'Rapot deleted successfully']);
    }
}
