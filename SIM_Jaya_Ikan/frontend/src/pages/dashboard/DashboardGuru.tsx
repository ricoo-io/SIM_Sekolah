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
  AlertTriangle,
  TrendingUp,
  Pencil,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    { id: number; id_kelas: number; id_mapel: number; label: string; percent: number; done: number; total: number }[]
  >([]);

  const [perhatianList, setPerhatianList] = useState<
    { id_siswa: number; id_mapel: number; id_kelas: number; siswa: string; mapel: string; nilai: number; kkm: number; kelas?: string }[]
  >([]);

  const [filterTahunAjaran, setFilterTahunAjaran] = useState<string>('2024/2025');
  const [filterSemester, setFilterSemester] = useState<string>('ganjil');

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
              p.tahun_ajaran === filterTahunAjaran &&
              p.semester === filterSemester &&
              isNilaiComplete(p),
          ).length;
          const percent = total ? Math.round((done / total) * 100) : 0;
          return {
            id: a.id,
            id_kelas: a.id_kelas,
            id_mapel: a.id_mapel,
            label: `${a.mapel?.mata_pelajaran || 'Mapel'} ${a.kelas?.nama_kelas || ''}`.trim(),
            percent: Math.min(percent, 100),
            done,
            total,
          };
        });
        setProgressList(progressData);

        const assignmentsLookup = new Set(assignments.map(a => `${a.id_kelas}-${a.id_mapel}`));

        const perhatian = penilaianList
          .filter(p => {
            if (p.nilai_Akhir === null) return false;
            const key = `${p.siswa?.id_kelas}-${p.id_mapel}`;
            const matchesTahunAjaran = p.tahun_ajaran === filterTahunAjaran;
            const matchesSemester = p.semester === filterSemester;
            return assignmentsLookup.has(key) && matchesTahunAjaran && matchesSemester;
          })
          .map(p => {
            const kkm = p.mapel?.kkm ?? mapelLookup[p.id_mapel]?.kkm ?? 75;
            return {
              id_siswa: p.id_siswa,
              id_mapel: p.id_mapel,
              id_kelas: p.siswa?.id_kelas || 0,
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
      } catch (error) {
        console.error('Error loading guru dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, kelasWali, filterTahunAjaran, filterSemester]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Kelas Diajar" value={stats.kelasDiajar} icon={Users} variant="primary" />
        <StatsCard title="Mapel Diajar" value={stats.mapelDiajar} icon={BookOpen} variant="success" />
        <StatsCard title="Total Siswa" value={stats.totalSiswa} icon={Users} variant="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Status Pengisian Nilai</h3>
              <p className="text-sm text-muted-foreground">Progress per kelas / mapel</p>
            </div>
            <div className="flex gap-2">
              <Select value={filterTahunAjaran} onValueChange={setFilterTahunAjaran}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ganjil">Ganjil</SelectItem>
                  <SelectItem value="genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {progressList.length > 0 ? (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 flex-grow">
              {progressList.map(item => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.percent}%</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs"
                        onClick={() => navigate(`/nilai?kelas=${item.id_kelas}&mapel=${item.id_mapel}`)}
                      >
                        Input Nilai
                      </Button>
                    </div>
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
              <p className="text-sm text-muted-foreground">Nilai tidak tuntas</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
          </div>

          {perhatianList.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {perhatianList.map((p, idx) => (
                <div
                  key={`${p.siswa}-${idx}`}
                  className="flex items-start justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/nilai?kelas=${p.id_kelas}&mapel=${p.id_mapel}`)}
                >
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
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
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