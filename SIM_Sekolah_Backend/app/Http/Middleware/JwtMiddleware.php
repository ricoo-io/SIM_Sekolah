<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;
use App\Models\User;

class JwtMiddleware
{
    public function handle($request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Token not provided'], 401);
        }

        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            $user = User::find($decoded->sub);

            if (!$user) {
                return response()->json(['message' => 'User not found'], 401);
            }

            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            return $next($request);
        } catch (Exception $e) {
            return response()->json(['message' => 'Invalid token'], 401);
        }
    }
}
