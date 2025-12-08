<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    public function index()
    {
        $kelas = Kelas::with('waliKelas')->get();
        return response()->json($kelas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_guru' => 'nullable|exists:users,id',
            'nama_kelas' => 'required|string',
            'tingkat' => 'required|in:7,8,9',
        ]);

        $kelas = Kelas::create($validated);
        return response()->json($kelas->load('waliKelas'), 201);
    }

    public function show($id)
    {
        $kelas = Kelas::with('waliKelas', 'siswa')->findOrFail($id);
        return response()->json($kelas);
    }

    public function update(Request $request, $id)
    {
        $kelas = Kelas::findOrFail($id);

        $validated = $request->validate([
            'id_guru' => 'sometimes|nullable|exists:users,id',
            'nama_kelas' => 'sometimes|string',
            'tingkat' => 'sometimes|in:7,8,9',
        ]);

        $kelas->update($validated);
        return response()->json($kelas->load('waliKelas'));
    }

    public function destroy($id)
    {
        $kelas = Kelas::findOrFail($id);
        $kelas->delete();
        return response()->json(['message' => 'Kelas deleted successfully']);
    }
}
