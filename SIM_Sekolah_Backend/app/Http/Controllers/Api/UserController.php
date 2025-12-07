<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all()->makeHidden(['password']);
        return response()->json($users);
    }

    public function guru()
    {
        $guru = User::where('role', 'guru')->get()->makeHidden(['password']);
        return response()->json($guru);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string',
            'nip' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,guru',
            'wali_kelas' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json($user->makeHidden(['password']), 201);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user->makeHidden(['password']));
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'sometimes|string',
            'nip' => 'sometimes|string|unique:users,nip,' . $id,
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|in:admin,guru',
            'wali_kelas' => 'sometimes|boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json($user->makeHidden(['password']));
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
