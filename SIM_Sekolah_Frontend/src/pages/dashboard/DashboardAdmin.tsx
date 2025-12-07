import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  School, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Siswa, User, MataPelajaran, Kelas, Penilaian } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    siswa: 0,
    guru: 0,
    mapel: 0,
    kelas: 0,
  });
  const [incompleteGrades, setIncompleteGrades] = useState<{siswa: Siswa; mapel: string; missing: string}[]>([]);
  const [chartData, setChartData] = useState<{name: string; nilai: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {

  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-1">Selamat datang! Berikut ringkasan data sekolah.</p>
      </div>

      {/* Statistik Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Siswa"
          value={stats.siswa}
          icon={GraduationCap}
          variant="primary"
        />
        <StatsCard
          title="Total Guru"
          value={stats.guru}
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Mata Pelajaran"
          value={stats.mapel}
          icon={BookOpen}
          variant="warning"
        />
        <StatsCard
          title="Total Kelas"
          value={stats.kelas}
          icon={School}
          variant="info"
        />
      </div>

      {/* Grafik Penilaian */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-card rounded-xl border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Rata-rata Nilai per Mapel</h3>
              <p className="text-sm text-muted-foreground">Semester Ganjil 2024/2025</p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
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
                <Bar dataKey="nilai" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Belum ada data nilai
            </div>
          )}
        </div>

        {/* Data Nilai Belum Lengkap */}
        <div className="bg-card rounded-xl border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Nilai Belum Lengkap</h3>
              <p className="text-sm text-muted-foreground">Siswa yang perlu dilengkapi nilainya</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          
          {incompleteGrades.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {incompleteGrades.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.siswa.nama}</p>
                    <p className="text-xs text-muted-foreground">{item.mapel}</p>
                  </div>
                  <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">
                    {item.missing}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Semua nilai sudah lengkap
            </div>
          )}
        </div>
      </div>

      {/* Aksi Cepat */}
      <div className="bg-card rounded-xl border p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/siswa')}>
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs">Kelola Siswa</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/guru')}>
            <Users className="w-5 h-5" />
            <span className="text-xs">Kelola Guru</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/kelas')}>
            <School className="w-5 h-5" />
            <span className="text-xs">Kelola Kelas</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/mapel')}>
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Mata Pelajaran</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
