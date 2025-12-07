import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { School, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !password) {
      toast.error('Mohon isi NIP dan Password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(nip, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login gagal');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Judul - Sebelah Kiri */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <img src="public/Logo_Jaya_Ikan.png" className="h-14 w-14 object-cover rounded-xl" alt="Logo"/>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">SMP JAYA IKAN</h1>
              <p className="text-primary-foreground/80 text-sm">Sistem Informasi Sekolah</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
            Sistem Informasi<br />Manajemen Sekolah
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Platform terintegrasi untuk mengelola data akademik dab penilaian siswa dengan mudah dan efisien.
          </p>
        </div>

        <div className="relative z-10 text-primary-foreground/60 text-sm">
          © 2025 SMP JAYA IKAN | Kelompok 7. All rights reserved.
        </div>
      </div>

      {/* Form Login - Sebelah Kanan */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md rounded-xl shadow-lg bg-white p-8 border border-gray-100 mx-auto">        
          <div className="w-full space-y-8">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <img src="public/Logo_Jaya_Ikan.png" className="h-12 w-12 object-cover rounded-xl" alt="Logo"/>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SMP JAYA IKAN</h1>
                <p className="text-muted-foreground text-xs">Sistem Informasi Sekolah</p>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-foreground">Selamat Datang</h2>
              <p className="text-muted-foreground mt-2">Silakan masuk ke akun Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP / Username</Label>
                <Input
                  id="nip"
                  type="text"
                  placeholder="Masukkan NIP"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                  
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                variant="gradient"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Masuk
                  </>
                )}
              </Button>
            </form>

            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Demo Akun:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium">Admin:</span> NIP: admin123 | Password: password</p>
                <p><span className="font-medium">Guru:</span> NIP: 1234567890 | Password: password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
