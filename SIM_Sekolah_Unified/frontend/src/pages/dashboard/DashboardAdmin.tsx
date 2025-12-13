import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Users,
  BookOpen,
  School,
  AlertTriangle,
} from 'lucide-react';
import {
  siswaApi,
  usersApi,
  mapelApi,
  kelasApi,
  penilaianApi,
  guruMapelApi,
} from '@/lib/api';
import { Siswa } from '@/lib/types';

export const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    siswa: 0,
    guru: 0,
    mapel: 0,
    kelas: 0,
  });

  const [incompleteGrades, setIncompleteGrades] = useState<
    { siswa: Siswa; mapel: string; guru: string; kelas: string; missing: string }[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          siswaList,
          usersList,
          mapelList,
          kelasList,
          penilaianList,
          guruMapelList,
        ] = await Promise.all([
          siswaApi.getAll(),
          usersApi.getAll(),
          mapelApi.getAll(),
          kelasApi.getAll(),
          penilaianApi.getAll(),
          guruMapelApi.getAll(),
        ]);

        setStats({
          siswa: siswaList.length,
          guru: usersList.filter(u => u.role === 'guru').length,
          mapel: mapelList.length,
          kelas: kelasList.length,
        });

        const incomplete: { siswa: Siswa; mapel: string; guru: string; kelas: string; missing: string }[] = [];

        const kelasMap = new Map(kelasList.map(k => [k.id, k.nama_kelas]));

        siswaList.forEach(siswa => {
          mapelList.forEach(mapel => {
            const assignment = guruMapelList.find(
              gm => gm.id_mapel === mapel.id && gm.id_kelas === siswa.id_kelas,
            );
            const guruAssigned = assignment
              ? usersList.find(u => u.id === assignment.id_guru)
              : undefined;

            const nilai = penilaianList.find(
              p => p.id_siswa === siswa.id && p.id_mapel === mapel.id,
            );

            const guruNama = nilai
              ? usersList.find(u => u.id === nilai.id_guru)?.nama ?? '-'
              : guruAssigned?.nama ?? '-';

            const kelasNama = kelasMap.get(siswa.id_kelas) ?? '-';

            if (!nilai) {
              incomplete.push({
                siswa,
                mapel: mapel.mata_pelajaran,
                guru: guruNama,
                kelas: kelasNama,
                missing: 'Semua nilai',
              });
              return;
            }

            const missing: string[] = [];
            if (nilai.nilai_harian_1 === null) missing.push('NH1');
            if (nilai.nilai_harian_2 === null) missing.push('NH2');
            if (nilai.nilai_harian_3 === null) missing.push('NH3');
            if (nilai.nilai_UTS === null) missing.push('UTS');
            if (nilai.nilai_harian_4 === null) missing.push('NH4');
            if (nilai.nilai_harian_5 === null) missing.push('NH5');
            if (nilai.nilai_harian_6 === null) missing.push('NH6');
            if (nilai.nilai_UAS === null) missing.push('UAS');

            if (missing.length > 0) {
              incomplete.push({
                siswa,
                mapel: mapel.mata_pelajaran,
                guru: guruNama,
                kelas: kelasNama,
                missing: missing.join(', '),
              });
            }
          });
        });

        setIncompleteGrades(incomplete.slice(0, 50));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-1">Selamat datang! Berikut ringkasan data sekolah.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Siswa" value={stats.siswa} icon={GraduationCap} variant="primary" />
        <StatsCard title="Total Guru" value={stats.guru} icon={Users} variant="success" />
        <StatsCard title="Mata Pelajaran" value={stats.mapel} icon={BookOpen} variant="warning" />
        <StatsCard title="Total Kelas" value={stats.kelas} icon={School} variant="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-card rounded-xl border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Nilai Belum Lengkap</h3>
              <p className="text-sm text-muted-foreground">Siswa yang perlu dilengkapi nilainya</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>

          {incompleteGrades.length > 0 ? (
            <div className="space-y-3 min-h-[300px] max-h-[300px] overflow-y-auto pr-2">
              {incompleteGrades.map((item, idx) => (
                <div key={idx} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{item.siswa.nama}</p>
                      <p className="text-xs text-muted-foreground">Kelas {item.kelas}</p>
                      <p className="text-xs text-muted-foreground">{item.mapel} • {item.guru}</p>
                    </div>
                    <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded-full self-start">
                      {item.missing}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-start text-muted-foreground">Semua nilai sudah lengkap</div>
          )}
        </div>
      </div>

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
