<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MataPelajaran;
use Illuminate\Http\Request;

class MataPelajaranController extends Controller
{
    public function index()
    {
        $mapel = MataPelajaran::all();
        return response()->json($mapel);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mata_pelajaran' => 'required|string',
            'kkm' => 'required|integer|min:0|max:100',
        ]);

        $mapel = MataPelajaran::create($validated);
        return response()->json($mapel, 201);
    }

    public function show($id)
    {
        $mapel = MataPelajaran::findOrFail($id);
        return response()->json($mapel);
    }

    public function update(Request $request, $id)
    {
        $mapel = MataPelajaran::findOrFail($id);

        $validated = $request->validate([
            'mata_pelajaran' => 'sometimes|string',
            'kkm' => 'sometimes|integer|min:0|max:100',
        ]);

        $mapel->update($validated);
        return response()->json($mapel);
    }

    public function destroy($id)
    {
        $mapel = MataPelajaran::findOrFail($id);
        $mapel->delete();
        return response()->json(['message' => 'Mata Pelajaran deleted successfully']);
    }
}
