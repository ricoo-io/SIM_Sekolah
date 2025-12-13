import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertTriangle, FileText, PencilIcon } from 'lucide-react';
import { siswaApi, penilaianApi, mapelApi, rapotApi } from '@/lib/api';
import { Siswa, Penilaian, MataPelajaran, Rapot, Semester } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WaliKelas: React.FC = () => {
  const { kelasWali } = useAuth();
  const navigate = useNavigate();
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [mapel, setMapel] = useState<MataPelajaran[]>([]);
  const [penilaian, setPenilaian] = useState<Penilaian[]>([]);
  const [rapot, setRapot] = useState<Record<number, Rapot>>({});
  const [semester, setSemester] = useState<Semester>('ganjil');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!kelasWali) return;

    try {
      const [siswaList, mapelList, penilaianList, rapotList] = await Promise.all([
        siswaApi.getByKelas(kelasWali.id),
        mapelApi.getAll(),
        penilaianApi.getAll(),
        rapotApi.getAll(),
      ]);

      setSiswa(siswaList);
      setMapel(mapelList);
      setPenilaian(penilaianList.filter(p => p.siswa?.id_kelas === kelasWali.id && p.semester === semester));

      const rapotMap: Record<number, Rapot> = {};
      rapotList
        .filter(r => r.siswa?.id_kelas === kelasWali.id && r.semester === semester)
        .forEach(r => {
          rapotMap[r.id_siswa] = r;
        });
      setRapot(rapotMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [kelasWali, semester]);

  const getSiswaAverage = (siswaId: number) => {
    const nilaiValid = penilaian
      .filter(p => p.id_siswa === siswaId)
      .map(p => Number(p.nilai_Akhir))
      .filter(v => Number.isFinite(v));

    if (nilaiValid.length === 0) return null;

    const total = nilaiValid.reduce((sum, v) => sum + v, 0);
    return Math.round(total / nilaiValid.length);
  };

  const getStudentsWithIncomplete = () => {
    return siswa.filter(s => {
      const nilaiSiswaAll = penilaian.filter(p => p.id_siswa === s.id);
      return mapel.some(m => {
        const nilai = nilaiSiswaAll.find(p => p.id_mapel === m.id);
        if (!nilai) return true;
        const hasAllComponents =
          nilai.nilai_harian_1 !== null &&
          nilai.nilai_harian_2 !== null &&
          nilai.nilai_harian_3 !== null &&
          nilai.nilai_harian_4 !== null &&
          nilai.nilai_harian_5 !== null &&
          nilai.nilai_harian_6 !== null &&
          nilai.nilai_UTS !== null &&
          nilai.nilai_UAS !== null;
        return !hasAllComponents;
      });
    }).length;
  };

  const getStudentsBelowKkm = () => {
    return siswa.filter(s => {
      const nilaiSiswaAll = penilaian.filter(p => p.id_siswa === s.id);
      return mapel.some(m => {
        const nilai = nilaiSiswaAll.find(p => p.id_mapel === m.id);
        if (!nilai) return false;
        const nilaiAkhir = nilai.nilai_Akhir;
        const hasAllComponents =
          nilai.nilai_harian_1 !== null &&
          nilai.nilai_harian_2 !== null &&
          nilai.nilai_harian_3 !== null &&
          nilai.nilai_harian_4 !== null &&
          nilai.nilai_harian_5 !== null &&
          nilai.nilai_harian_6 !== null &&
          nilai.nilai_UTS !== null &&
          nilai.nilai_UAS !== null &&
          nilaiAkhir !== null &&
          nilaiAkhir !== undefined;
        return hasAllComponents && nilaiAkhir < m.kkm;
      });
    }).length;
  };

  const rankingData = siswa
    .map(s => {
      const avg = getSiswaAverage(s.id);
      return { name: s.nama.split(' ')[0], nilai: avg || 0, full: s.nama };
    })
    .sort((a, b) => b.nilai - a.nilai)
    .slice(0, 10);

  if (!kelasWali) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Anda bukan wali kelas</h2>
          <p className="text-muted-foreground">Halaman ini hanya untuk guru wali kelas</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Wali Kelas ${kelasWali.nama_kelas}`}
        description="Monitoring nilai dan absensi siswa"
      >
        <div className="flex items-center gap-2">
          <Label className="whitespace-nowrap">Semester</Label>
          <Select value={semester} onValueChange={(v: Semester) => setSemester(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ganjil">Ganjil</SelectItem>
              <SelectItem value="genap">Genap</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard title="Jumlah Siswa" value={siswa.length} icon={Users} variant="primary" />
        <StatsCard
          title="Rata-rata Kelas"
          value={(() => {
            const allAverages = siswa.map(s => getSiswaAverage(s.id)).filter((avg): avg is number => avg !== null);
            if (allAverages.length === 0) return 0;
            return Math.round(allAverages.reduce((a, b) => a + b, 0) / allAverages.length);
          })()}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard title="Nilai Belum Lengkap" value={getStudentsWithIncomplete()} icon={AlertTriangle} variant="warning" />
        <StatsCard title="NA Tidak Tuntas KKM" value={getStudentsBelowKkm()} icon={AlertTriangle} variant="info" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Peringkat Kelas</h3>
          {rankingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rankingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(value, _name, props) => [value, props.payload.full]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="nilai" radius={[0, 4, 4, 0]}>
                  {rankingData.map((entry, index) => (
                    <Cell key={index} fill={index < 3 ? 'hsl(var(--success))' : 'hsl(var(--primary))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Belum ada data nilai</div>
          )}
        </div>

        <div className="bg-card rounded-xl border p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Ketuntasan per Mapel</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {mapel.map(m => {
              const nilaiMapel = penilaian.filter(p => p.id_mapel === m.id);
              const tuntas = nilaiMapel.filter(p => {
                const hasAllComponents =
                  p.nilai_harian_1 !== null &&
                  p.nilai_harian_2 !== null &&
                  p.nilai_harian_3 !== null &&
                  p.nilai_harian_4 !== null &&
                  p.nilai_harian_5 !== null &&
                  p.nilai_harian_6 !== null &&
                  p.nilai_UTS !== null &&
                  p.nilai_UAS !== null &&
                  p.nilai_Akhir !== null &&
                  p.nilai_Akhir !== undefined;

                return hasAllComponents && p.nilai_Akhir >= m.kkm;
              }).length;

              const totalSiswaMapel = siswa.length; 
              const percentage = totalSiswaMapel > 0 ? Math.round((tuntas / totalSiswaMapel) * 100) : 0;

              return (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{m.mata_pelajaran}</span>
                    <span className="text-muted-foreground">
                      {tuntas}/{totalSiswaMapel} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daftar Siswa */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-foreground">Daftar Siswa</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>No</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="text-center">Rata-rata NA</TableHead>
              <TableHead className="text-center">Absensi</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {siswa.map((s, idx) => {
              const avg = getSiswaAverage(s.id);
              const r = rapot[s.id];

              return (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/guru/siswa/${s.id}`)}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{s.nis}</TableCell>
                  <TableCell className="font-medium">{s.nama}</TableCell>
                  <TableCell className="text-center">
                    {avg !== null ? (
                      <span className={avg >= 75 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>{avg}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {r ? <span className="text-muted-foreground">S:{r.sakit} I:{r.izin} A:{r.alpha}</span> : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {(() => {
                      const nilaiSiswaAll = penilaian.filter(p => p.id_siswa === s.id);
                      const hasIncomplete = mapel.some(m => {
                        const nilai = nilaiSiswaAll.find(p => p.id_mapel === m.id);
                        const isScoreFilled = (val: number | null | undefined) => val !== null && val !== undefined;
                        const nilaiAkhir = nilai?.nilai_Akhir;
                        const hasAllComponents =
                          isScoreFilled(nilai?.nilai_harian_1) &&
                          isScoreFilled(nilai?.nilai_harian_2) &&
                          isScoreFilled(nilai?.nilai_harian_3) &&
                          isScoreFilled(nilai?.nilai_harian_4) &&
                          isScoreFilled(nilai?.nilai_harian_5) &&
                          isScoreFilled(nilai?.nilai_harian_6) &&
                          isScoreFilled(nilai?.nilai_UTS) &&
                          isScoreFilled(nilai?.nilai_UAS) &&
                          isScoreFilled(nilaiAkhir);
                        return !hasAllComponents;
                      });

                      if (hasIncomplete) {
                        return (
                          <Badge variant="secondary" className="border-warning text-warning bg-warning/10">
                            Belum Lengkap
                          </Badge>
                        );
                      }

                      return (
                        <Badge variant="outline" className="border-success text-success">
                          Lengkap
                        </Badge>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WaliKelas;