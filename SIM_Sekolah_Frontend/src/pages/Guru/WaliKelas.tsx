import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Users, TrendingUp, AlertTriangle, FileText, Save, PencilIcon } from 'lucide-react';
import { siswaApi, penilaianApi, mapelApi, rapotApi } from '@/lib/api';
import { Siswa, Penilaian, MataPelajaran, Rapot, Semester } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

const WaliKelas: React.FC = () => {
  const { kelasWali } = useAuth();
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [mapel, setMapel] = useState<MataPelajaran[]>([]);
  const [penilaian, setPenilaian] = useState<Penilaian[]>([]);
  const [rapot, setRapot] = useState<Record<number, Rapot>>({});
  const [semester, setSemester] = useState<Semester>('ganjil');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isAbsensiDialogOpen, setIsAbsensiDialogOpen] = useState(false);
  const [isNilaiDialogOpen, setIsNilaiDialogOpen] = useState(false);
  const [absensiForm, setAbsensiForm] = useState({
    sakit: 0,
    izin: 0,
    alpha: 0,
    catatan_wali_kelas: '',
  });

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

  // Calculate stats
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
    
      
      const hasIncomplete = mapel.some(m => {
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
    
      return hasIncomplete;
    }).length;
  };

  const getStudentsBelowKkm = () => {
    return siswa.filter(s => {
      const nilaiSiswaAll = penilaian.filter(p => p.id_siswa === s.id);
    
      
      const hasBelowKkm = mapel.some(m => {
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
    
      return hasBelowKkm;
    }).length;
  };

  const getNilaiStatusCounts = (siswaId: number) => {
    let tuntas = 0;
    let belumTuntas = 0;
    let remedial = 0;

    mapel.forEach(m => {
      const nilai = penilaian.find(p => p.id_siswa === siswaId && p.id_mapel === m.id);
      const nilaiAkhir = nilai?.nilai_Akhir;

      const hasAllComponents =
        nilai?.nilai_harian_1 !== null &&
        nilai?.nilai_harian_2 !== null &&
        nilai?.nilai_harian_3 !== null &&
        nilai?.nilai_harian_4 !== null &&
        nilai?.nilai_harian_5 !== null &&
        nilai?.nilai_harian_6 !== null &&
        nilai?.nilai_UTS !== null &&
        nilai?.nilai_UAS !== null &&
        nilaiAkhir !== null &&
        nilaiAkhir !== undefined;

      if (!hasAllComponents) {
        belumTuntas += 1;
        return;
      }

      if (nilaiAkhir >= m.kkm) {
        tuntas += 1;
      } else {
        remedial += 1;
      }
    });

    return { tuntas, belumTuntas, remedial };
  };

  // Ranking data
  const rankingData = siswa
    .map(s => {
      const avg = getSiswaAverage(s.id);
      return { name: s.nama.split(' ')[0], nilai: avg || 0, full: s.nama };
    })
    .sort((a, b) => b.nilai - a.nilai)
    .slice(0, 10);

  const handleOpenAbsensi = (s: Siswa) => {
    setSelectedSiswa(s);
    const existing = rapot[s.id];
    setAbsensiForm({
      sakit: existing?.sakit || 0,
      izin: existing?.izin || 0,
      alpha: existing?.alpha || 0,
      catatan_wali_kelas: existing?.catatan_wali_kelas || '',
    });
    setIsAbsensiDialogOpen(true);
  };

  const handleOpenNilai = () => {
    setIsAbsensiDialogOpen(false);
    setIsNilaiDialogOpen(true);
  };

  const handleBackToAbsensi = () => {
    setIsNilaiDialogOpen(false);
    setIsAbsensiDialogOpen(true);
  };

  const handleSaveAbsensi = async () => {
    if (!selectedSiswa) return;

    try {
      await rapotApi.upsert({
        id_siswa: selectedSiswa.id,
        tahun_ajaran: '2024/2025',
        semester,
        sakit: absensiForm.sakit,
        izin: absensiForm.izin,
        alpha: absensiForm.alpha,
        catatan_wali_kelas: absensiForm.catatan_wali_kelas,
      });
      toast.success('Data absensi berhasil disimpan');
      setIsAbsensiDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

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
      <PageHeader title={`Wali Kelas ${kelasWali.nama_kelas}`} description="Monitoring nilai dan absensi siswa" />

      <div className="flex gap-4">
        <div className="space-y-2">
          <Label>Semester</Label>
          <Select value={semester} onValueChange={(v: Semester) => setSemester(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ganjil">Ganjil</SelectItem>
              <SelectItem value="genap">Genap</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
        <StatsCard title="Di Bawah KKM" value={getStudentsBelowKkm()} icon={AlertTriangle} variant="info" />
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
          <h3 className="font-semibold text-foreground mb-4">Kelengkapan per Mapel</h3>
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

              const totalSiswaMapel = siswa.length; // semua siswa harusnya punya nilai mapel ini
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

      {/* Student list */}
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
              <TableHead className="text-center">Rata-rata</TableHead>
              <TableHead className="text-center">Absensi</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Nilai</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {siswa.map((s, idx) => {
              const avg = getSiswaAverage(s.id);
              const r = rapot[s.id];

              return (
                <TableRow key={s.id}>
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
                        const nilaiAkhir = nilai?.nilai_Akhir;
                        const hasAllComponents =
                          nilai?.nilai_harian_1 !== null &&
                          nilai?.nilai_harian_2 !== null &&
                          nilai?.nilai_harian_3 !== null &&
                          nilai?.nilai_harian_4 !== null &&
                          nilai?.nilai_harian_5 !== null &&
                          nilai?.nilai_harian_6 !== null &&
                          nilai?.nilai_UTS !== null &&
                          nilai?.nilai_UAS !== null &&
                          nilaiAkhir !== null &&
                          nilaiAkhir !== undefined;
                        return !hasAllComponents;
                      });

                       
                      if (hasIncomplete) {
                        return (
                          <Badge variant="secondary" className="border-warning text-warning bg-warning/10">
                            Belum Lengkap
                          </Badge>
                        );
                      }

                      
                      const hasRemedial = mapel.some(m => {
                        const nilai = nilaiSiswaAll.find(p => p.id_mapel === m.id);
                        return nilai?.nilai_Akhir !== null && 
                          nilai?.nilai_Akhir !== undefined && 
                          nilai.nilai_Akhir < m.kkm;
                      });

                      
                      if (hasRemedial) {
                        return (
                          <Badge variant="destructive">
                            Remedial
                          </Badge>
                        );
                      }

                       
                      return (
                        <Badge variant="outline" className="border-success text-success">
                          Tuntas
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedSiswa(s);
                        setIsNilaiDialogOpen(true);
                      }}
                      title="Lihat Nilai"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenAbsensi(s)} title="Catatan & Absensi">
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Absensi Dialog */}
      <Dialog open={isAbsensiDialogOpen} onOpenChange={setIsAbsensiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catatan Wali Kelas - {selectedSiswa?.nama}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Sakit (hari)</Label>
                <Input
                  type="number"
                  min={0}
                  value={absensiForm.sakit}
                  onChange={e => setAbsensiForm({ ...absensiForm, sakit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Izin (hari)</Label>
                <Input
                  type="number"
                  min={0}
                  value={absensiForm.izin}
                  onChange={e => setAbsensiForm({ ...absensiForm, izin: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alpha (hari)</Label>
                <Input
                  type="number"
                  min={0}
                  value={absensiForm.alpha}
                  onChange={e => setAbsensiForm({ ...absensiForm, alpha: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catatan Wali Kelas</Label>
              <Textarea
                value={absensiForm.catatan_wali_kelas}
                onChange={e => setAbsensiForm({ ...absensiForm, catatan_wali_kelas: e.target.value })}
                placeholder="Masukkan catatan untuk rapor..."
                rows={4}
              />
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAbsensiDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSaveAbsensi}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Nilai Dialog */}
      <Dialog open={isNilaiDialogOpen} onOpenChange={setIsNilaiDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Detail Nilai</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-4">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Nama Siswa</p>
                <p className="font-semibold">{selectedSiswa?.nama}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NIS</p>
                <p className="font-semibold">{selectedSiswa?.nis}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata</p>
                <p className="font-semibold text-lg">{selectedSiswa ? getSiswaAverage(selectedSiswa.id) || '-' : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Semester</p>
                <p className="font-semibold capitalize">{semester}</p>
              </div>
            </div>

            {/* Nilai Table */}
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="min-w-12">No</TableHead>
                    <TableHead className="min-w-40">Mata Pelajaran</TableHead>
                    <TableHead className="text-center min-w-16">KKM</TableHead>
                    <TableHead className="text-center min-w-16">NH1</TableHead>
                    <TableHead className="text-center min-w-16">NH2</TableHead>
                    <TableHead className="text-center min-w-16">NH3</TableHead>
                    <TableHead className="text-center min-w-16">NH4</TableHead>
                    <TableHead className="text-center min-w-16">NH5</TableHead>
                    <TableHead className="text-center min-w-16">NH6</TableHead>
                    <TableHead className="text-center min-w-16">UTS</TableHead>
                    <TableHead className="text-center min-w-16">UAS</TableHead>
                    <TableHead className="text-center min-w-24">Nilai Akhir</TableHead>
                    <TableHead className="text-center min-w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mapel.map((m, idx) => {
                    const nilai = penilaian.find(p => p.id_siswa === selectedSiswa?.id && p.id_mapel === m.id);
                    const nilaiAkhir = nilai?.nilai_Akhir;
                    const isTuntas = nilaiAkhir !== null && nilaiAkhir !== undefined && nilaiAkhir >= m.kkm;

                    const hasAllComponents =
                      nilai?.nilai_harian_1 !== null &&
                      nilai?.nilai_harian_2 !== null &&
                      nilai?.nilai_harian_3 !== null &&
                      nilai?.nilai_harian_4 !== null &&
                      nilai?.nilai_harian_5 !== null &&
                      nilai?.nilai_harian_6 !== null &&
                      nilai?.nilai_UTS !== null &&
                      nilai?.nilai_UAS !== null &&
                      nilaiAkhir !== null &&
                      nilaiAkhir !== undefined;

                    return (
                      <TableRow key={m.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{m.mata_pelajaran}</TableCell>
                        <TableCell className="text-center">{m.kkm}</TableCell>
                        <TableCell className="text-center">{nilai?.nilai_harian_1 || '-'}</TableCell>
                        <TableCell className="text-center">{nilai?.nilai_harian_2 || '-'}</TableCell>
                        <TableCell className="text-center">{nilai?.nilai_harian_3 || '-'}</TableCell>
                        <TableCell className="text-center">{nilai?.nilai_harian_4 || '-'}</TableCell>
                        <TableCell className="text-center">{nilai?.nilai_harian_5 || '-'}</TableCell>
                        <TableCell className="text-center">{nilai?.nilai_harian_6 || '-'}</TableCell>
                        <TableCell className="text-center">{nilai?.nilai_UTS || '-'}</TableCell>
                        <TableCell className="text-center">{nilai?.nilai_UAS || '-'}</TableCell>
                        <TableCell className="text-center">
                          {nilaiAkhir !== null && nilaiAkhir !== undefined ? (
                            <span className={isTuntas ? 'text-success font-semibold' : 'text-destructive font-semibold'}>{nilaiAkhir}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {!hasAllComponents ? (
                            <Badge variant="secondary" className="border-warning text-warning bg-warning/10">
                              Belum Lengkap
                            </Badge>
                          ) : isTuntas ? (
                            <Badge variant="outline" className="border-success text-success">
                              Tuntas
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Remedial</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              {(() => {
                const counts = selectedSiswa
                  ? getNilaiStatusCounts(selectedSiswa.id)
                  : { tuntas: 0, belumTuntas: 0, remedial: 0 };

                return (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Mapel</p>
                      <p className="font-semibold">{mapel.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tuntas</p>
                      <p className="font-semibold text-success">{counts.tuntas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Belum Lengkap</p>
                      <p className="font-semibold text-warning">{counts.belumTuntas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remedial</p>
                      <p className="font-semibold text-destructive">{counts.remedial}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 border-t pt-4">
            <Button variant="outline" onClick={() => setIsNilaiDialogOpen(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaliKelas;