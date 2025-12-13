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

  /* Refactored State for Grouped Data */
  const [incompleteGrades, setIncompleteGrades] = useState<
    { mapel: string; guru: string; kelas: string; missing: string; count: number }[]
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

        const kelasMap = new Map(kelasList.map(k => [k.id, k.nama_kelas]));
        const groupedIncomplete: Record<
          string,
          { mapel: string; guru: string; kelas: string; missing: Set<string>; count: number }
        > = {};

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
            const groupKey = `${mapel.id}-${siswa.id_kelas}`;

            const missingComponents: string[] = [];

            if (!nilai) {
              missingComponents.push('Semua nilai');
            } else {
              if (nilai.nilai_harian_1 === null) missingComponents.push('NH1');
              if (nilai.nilai_harian_2 === null) missingComponents.push('NH2');
              if (nilai.nilai_harian_3 === null) missingComponents.push('NH3');
              if (nilai.nilai_UTS === null) missingComponents.push('UTS');
              if (nilai.nilai_harian_4 === null) missingComponents.push('NH4');
              if (nilai.nilai_harian_5 === null) missingComponents.push('NH5');
              if (nilai.nilai_harian_6 === null) missingComponents.push('NH6');
              if (nilai.nilai_UAS === null) missingComponents.push('UAS');
            }

            if (missingComponents.length > 0) {
              if (!groupedIncomplete[groupKey]) {
                groupedIncomplete[groupKey] = {
                  mapel: mapel.mata_pelajaran,
                  guru: guruNama,
                  kelas: kelasNama,
                  missing: new Set(),
                  count: 0,
                };
              }
              groupedIncomplete[groupKey].count += 1;
              missingComponents.forEach(c => groupedIncomplete[groupKey].missing.add(c));
            }
          });
        });


        const incompleteArray = Object.values(groupedIncomplete).map(group => ({
          ...group,
          missing: Array.from(group.missing).join(', '),
        }));

        setIncompleteGrades(incompleteArray);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-5 shadow-card col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Laporan Pengisian Nilai</h3>
              <p className="text-sm text-muted-foreground">Ringkasan kelas yang belum lengkap nilainya</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>

          {incompleteGrades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-1">
              {incompleteGrades.map((item, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-4 border border-border/50 hover:border-border transition-colors">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm">{item.mapel}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.kelas}</p>
                      </div>
                      <span className="text-xs font-medium bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                        {item.count} Siswa
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground border-t-2 border-gray-200 pt-2">
                      <Users className="w-3 h-3" />
                      <span className="truncate">{item.guru}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.missing.split(', ').slice(0, 3).map((m, i) => (
                         <span key={i} className="text-[10px] uppercase bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                           {m}
                         </span>
                      ))}
                      {item.missing.split(', ').length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-1 py-0.5">
                          +{item.missing.split(', ').length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Semua nilai sudah lengkap!</p>
              </div>
            </div>
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

