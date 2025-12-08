import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users,
  ClipboardList,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { guruMapelApi, siswaApi, penilaianApi, kelasApi } from '@/lib/api';
import { GuruMataPelajaran, Penilaian } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardGuru: React.FC = () => {
  const { user, kelasWali } = useAuth();
  const navigate = useNavigate();
  const [guruMapel, setGuruMapel] = useState<GuruMataPelajaran[]>([]);
  const [stats, setStats] = useState({
    kelasDiajar: 0,
    mapelDiajar: 0,
    totalSiswa: 0,
  });
  const [chartData, setChartData] = useState<{name: string; nilai: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const assignments = await guruMapelApi.getByGuru(user.id);
        setGuruMapel(assignments);

        const uniqueKelas = [...new Set(assignments.map(a => a.id_kelas))];
        const uniqueMapel = [...new Set(assignments.map(a => a.id_mapel))];

        // Count total students in taught classes
        let totalSiswa = 0;
        for (const kelasId of uniqueKelas) {
          const siswaKelas = await siswaApi.getByKelas(kelasId);
          totalSiswa += siswaKelas.length;
        }

        setStats({
          kelasDiajar: uniqueKelas.length,
          mapelDiajar: uniqueMapel.length,
          totalSiswa,
        });

        const penilaianList = await penilaianApi.getAll();
        const chartByKelas = uniqueKelas.map(kelasId => {
          const assignment = assignments.find(a => a.id_kelas === kelasId);
          const nilaiKelas = penilaianList.filter(
            p => p.id_guru === user.id && p.siswa?.id_kelas === kelasId && p.nilai_Akhir !== null
          );
          const avg = nilaiKelas.length > 0
            ? nilaiKelas.reduce((sum, p) => sum + (p.nilai_Akhir || 0), 0) / nilaiKelas.length
            : 0;
          return {
            name: assignment?.kelas?.nama_kelas || `Kelas ${kelasId}`,
            nilai: Math.round(avg),
          };
        }).filter(d => d.nilai > 0);
        setChartData(chartByKelas);

      } catch (error) {
        console.error('Error loading guru dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (isLoading) {
   return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Guru</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang, {user?.nama}!
          {kelasWali && <span className="text-primary font-medium"> (Wali Kelas {kelasWali.nama_kelas})</span>}
        </p>
      </div>

      {/* Data Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Kelas Diajar"
          value={stats.kelasDiajar}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Mata Pelajaran"
          value={stats.mapelDiajar}
          icon={BookOpen}
          variant="success"
        />
        <StatsCard
          title="Total Siswa"
          value={stats.totalSiswa}
          icon={Users}
          variant="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Nilai */}
        <div className="bg-card rounded-xl border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Rata-rata Nilai per Kelas</h3>
              <p className="text-sm text-muted-foreground">Kelas yang Anda ajar</p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="nilai" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Belum ada data nilai
            </div>
          )}
        </div>

        {/* Jadwal Mengajar */}
        <div className="bg-card rounded-xl border p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Jadwal Mengajar</h3>
          {guruMapel.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {guruMapel.map((gm) => (
                <div key={gm.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-foreground">{gm.mapel?.mata_pelajaran}</p>
                    <p className="text-xs text-muted-foreground">Kelas {gm.kelas?.nama_kelas}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/nilai')}>
                    Input Nilai
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Belum ada jadwal mengajar
            </div>
          )}
        </div>
      </div>

      {/* Aksi Cepat*/}
      <div className="bg-card rounded-xl border p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/nilai')}>
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs">Input Nilai</span>
          </Button>
          {user?.wali_kelas && (
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/wali-kelas')}>
              <FileText className="w-5 h-5" />
              <span className="text-xs">Wali Kelas</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
