<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;

class SiswaController extends Controller
{
    public function index(Request $request)
    {
        $query = Siswa::with('kelas');

        if ($request->has('kelas')) {
            $query->where('id_kelas', $request->kelas);
        }

        $siswa = $query->get();
        return response()->json($siswa);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nis' => 'required|string|unique:siswa',
            'nama' => 'required|string',
            'alamat' => 'required|string',
            'ibu' => 'required|string',
            'ayah' => 'required|string',
            'wali' => 'required|string',
            'kontak_wali' => 'required|string',
            'id_kelas' => 'required|exists:kelas,id',
        ]);

        $siswa = Siswa::create($validated);
        return response()->json($siswa->load('kelas'), 201);
    }

    public function show($id)
    {
        $siswa = Siswa::with('kelas')->findOrFail($id);
        return response()->json($siswa);
    }

    public function update(Request $request, $id)
    {
        $siswa = Siswa::findOrFail($id);

        $validated = $request->validate([
            'nis' => 'sometimes|string|unique:siswa,nis,' . $id,
            'nama' => 'sometimes|string',
            'alamat' => 'sometimes|string',
            'ibu' => 'sometimes|string',
            'ayah' => 'sometimes|string',
            'wali' => 'sometimes|string',
            'kontak_wali' => 'sometimes|string',
            'id_kelas' => 'sometimes|exists:kelas,id',
        ]);

        $siswa->update($validated);
        return response()->json($siswa->load('kelas'));
    }

    public function destroy($id)
    {
        $siswa = Siswa::findOrFail($id);
        $siswa->delete();
        return response()->json(['message' => 'Siswa deleted successfully']);
    }
}
