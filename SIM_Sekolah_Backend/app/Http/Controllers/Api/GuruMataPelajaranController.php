<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuruMataPelajaran;
use Illuminate\Http\Request;

class GuruMataPelajaranController extends Controller
{
    public function index(Request $request)
    {
        $query = GuruMataPelajaran::with(['guru', 'mapel', 'kelas']);

        if ($request->has('guru')) {
            $query->where('id_guru', $request->guru);
        }

        $assignments = $query->get();
        return response()->json($assignments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_guru' => 'required|exists:users,id',
            'id_mapel' => 'required|exists:mata_pelajaran,id',
            'id_kelas' => 'required|exists:kelas,id',
        ]);

        $assignment = GuruMataPelajaran::create($validated);
        return response()->json($assignment->load(['guru', 'mapel', 'kelas']), 201);
    }

    public function show($id)
    {
        $assignment = GuruMataPelajaran::with(['guru', 'mapel', 'kelas'])->findOrFail($id);
        return response()->json($assignment);
    }

    public function update(Request $request, $id)
    {
        $assignment = GuruMataPelajaran::findOrFail($id);

        $validated = $request->validate([
            'id_guru' => 'sometimes|exists:users,id',
            'id_mapel' => 'sometimes|exists:mata_pelajaran,id',
            'id_kelas' => 'sometimes|exists:kelas,id',
        ]);

        $assignment->update($validated);
        return response()->json($assignment->load(['guru', 'mapel', 'kelas']));
    }

    public function destroy($id)
    {
        $assignment = GuruMataPelajaran::findOrFail($id);
        $assignment->delete();
        return response()->json(['message' => 'Assignment deleted successfully']);
    }
}
