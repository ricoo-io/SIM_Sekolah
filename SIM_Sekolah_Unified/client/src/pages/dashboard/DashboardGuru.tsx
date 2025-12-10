import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Users,
  ClipboardList,
  FileText,
  ListChecks,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { guruMapelApi, siswaApi, penilaianApi, mapelApi } from '@/lib/api';
import { MataPelajaran, Penilaian } from '@/lib/types';

export const DashboardGuru: React.FC = () => {
  const { user, kelasWali } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    kelasDiajar: 0,
    mapelDiajar: 0,
    totalSiswa: 0,
  });

  const [progressList, setProgressList] = useState<
    { id: number; label: string; percent: number; done: number; total: number }[]
  >([]);

  const [perhatianList, setPerhatianList] = useState<
    { siswa: string; mapel: string; nilai: number; kkm: number; kelas?: string }[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const assignments = await guruMapelApi.getByGuru(user.id);

        const uniqueKelas = [...new Set(assignments.map(a => a.id_kelas))];
        const uniqueMapel = [...new Set(assignments.map(a => a.id_mapel))];

        const kelasSiswaCount: Record<number, number> = {};
        for (const kelasId of uniqueKelas) {
          const siswaKelas = await siswaApi.getByKelas(kelasId);
          kelasSiswaCount[kelasId] = siswaKelas.length;
        }

        setStats({
          kelasDiajar: uniqueKelas.length,
          mapelDiajar: uniqueMapel.length,
          totalSiswa: Object.values(kelasSiswaCount).reduce((a, b) => a + b, 0),
        });

        const [penilaianList, mapelList] = await Promise.all([
          penilaianApi.getAll(),
          mapelApi.getAll(),
        ]);

        const mapelLookup: Record<number, MataPelajaran> = {};
        mapelList.forEach(m => (mapelLookup[m.id] = m));

        const isNilaiComplete = (p: Penilaian) => {
          const harian = [
            p.nilai_harian_1,
            p.nilai_harian_2,
            p.nilai_harian_3,
            p.nilai_harian_4,
            p.nilai_harian_5,
            p.nilai_harian_6,
          ];
          const hasNH = harian.some(n => n != null);
          const hasUTS = p.nilai_UTS != null;
          const hasUAS = p.nilai_UAS != null;
          return hasNH && hasUTS && hasUAS;
        };

        const progressData = assignments.map(a => {
          const total = kelasSiswaCount[a.id_kelas] || 0;
          const done = penilaianList.filter(
            p =>
              p.id_mapel === a.id_mapel &&
              p.siswa?.id_kelas === a.id_kelas &&
              isNilaiComplete(p),
          ).length;
          const percent = total ? Math.round((done / total) * 100) : 0;
          return {
            id: a.id,
            label: `${a.mapel?.mata_pelajaran || 'Mapel'} ${a.kelas?.nama_kelas || ''}`.trim(),
            percent: Math.min(percent, 100),
            done,
            total,
          };
        });
        setProgressList(progressData);

        if (kelasWali) {
          const perhatian = penilaianList
            .filter(p => p.siswa?.id_kelas === kelasWali.id && p.nilai_Akhir !== null)
            .map(p => {
              const kkm = p.mapel?.kkm ?? mapelLookup[p.id_mapel]?.kkm ?? 75;
              return {
                siswa: p.siswa?.nama || 'Siswa',
                mapel: p.mapel?.mata_pelajaran || mapelLookup[p.id_mapel]?.mata_pelajaran || 'Mapel',
                nilai: p.nilai_Akhir || 0,
                kkm,
                kelas: p.siswa?.kelas?.nama_kelas,
              };
            })
            .filter(p => p.nilai < p.kkm)
            .sort((a, b) => a.nilai - b.nilai)
            .slice(0, 8);
          setPerhatianList(perhatian);
        }
      } catch (error) {
        console.error('Error loading guru dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, kelasWali]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Kelas Diajar" value={stats.kelasDiajar} icon={Users} variant="primary" />
        <StatsCard title="Mapel Diajar" value={stats.mapelDiajar} icon={BookOpen} variant="success" />
        <StatsCard title="Total Siswa" value={stats.totalSiswa} icon={Users} variant="info" />
        <StatsCard title="Peran" value={user?.role || '-'} icon={ClipboardList} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Status Pengisian Nilai</h3>
              <p className="text-sm text-muted-foreground">Progress per kelas / mapel</p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>

          {progressList.length > 0 ? (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 flex-grow">
              {progressList.map(item => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.percent}%</span>
                  </div>
                  <Progress value={item.percent} />
                  <p className="text-xs text-muted-foreground">
                    {item.done} dari {item.total} siswa sudah lengkap (NH, UTS, UAS)
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground flex-grow">
              Belum ada data penilaian
            </div>
          )}

        </div>

        <div className="bg-card rounded-xl border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Siswa Perlu Perhatian</h3>
              <p className="text-sm text-muted-foreground">Nilai di bawah KKM</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
          </div>

          {perhatianList.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {perhatianList.map((p, idx) => (
                <div key={`${p.siswa}-${idx}`} className="flex items-start justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-semibold text-foreground">{p.siswa}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.mapel} • {p.kelas || kelasWali?.nama_kelas}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive">{p.nilai}</p>
                    <p className="text-xs text-muted-foreground">KKM {p.kkm}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Tidak ada siswa di bawah KKM
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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