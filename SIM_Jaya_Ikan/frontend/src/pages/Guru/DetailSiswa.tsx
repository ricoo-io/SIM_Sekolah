
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { siswaApi, penilaianApi, mapelApi, rapotApi } from '@/lib/api';
import { Siswa, Penilaian, MataPelajaran, Rapot, Semester } from '@/lib/types';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DetailSiswa: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { kelasWali } = useAuth();
  const [semester, setSemester] = useState<Semester>('ganjil');
  const [tahunAjaran, setTahunAjaran] = useState<string>('2024/2025');
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [mapel, setMapel] = useState<MataPelajaran[]>([]);
  const [allPenilaian, setAllPenilaian] = useState<Penilaian[]>([]);
  const [allRapots, setAllRapots] = useState<Rapot[]>([]);
  const [rapot, setRapot] = useState<Rapot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [absensiForm, setAbsensiForm] = useState<{
    sakit: number | string;
    izin: number | string;
    alpha: number | string;
    catatan_wali_kelas: string;
  }>({
    sakit: 0,
    izin: 0,
    alpha: 0,
    catatan_wali_kelas: '',
  });

  const loadData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const studentId = parseInt(id);
      const [siswaData, mapelList, penilaianList, rapotList] = await Promise.all([
        siswaApi.getById(studentId),
        mapelApi.getAll(),
        penilaianApi.getBySiswa(studentId),
        rapotApi.getBySiswa(studentId),
      ]);

      setSiswa(siswaData);
      setMapel(mapelList);
      setAllPenilaian(penilaianList);
      setAllRapots(rapotList);

    } catch (error) {
      console.error('Error loading student details:', error);
      toast.error('Gagal memuat data siswa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const studentId = parseInt(id);
    
    const currentRapot = allRapots.find(r => 
      r.id_siswa === studentId && 
      r.semester.toLowerCase() === semester.toLowerCase() &&
      r.tahun_ajaran === tahunAjaran
    );
    
    setRapot(currentRapot || null);

    if (currentRapot) {
      setAbsensiForm({
        sakit: currentRapot.sakit,
        izin: currentRapot.izin,
        alpha: currentRapot.alpha,
        catatan_wali_kelas: currentRapot.catatan_wali_kelas || '',
      });
    } else {
      setAbsensiForm({ sakit: 0, izin: 0, alpha: 0, catatan_wali_kelas: '' });
    }
  }, [allRapots, semester, tahunAjaran, id]);

  const handleSaveAbsensi = async () => {
    if (!siswa || !id) return;
    try {
      const payload = {
        id_siswa: parseInt(id),
        tahun_ajaran: tahunAjaran,
        semester,
        sakit: Number(absensiForm.sakit) || 0,
        izin: Number(absensiForm.izin) || 0,
        alpha: Number(absensiForm.alpha) || 0,
        catatan_wali_kelas: absensiForm.catatan_wali_kelas,
      };

      if (rapot && rapot.id) {
        console.log('Updating existing rapot:', rapot.id, payload);
        await rapotApi.update(rapot.id, payload);
      } else {
        console.log('Creating new rapot:', payload);
        await rapotApi.upsert(payload);
      }
      
      toast.success('Data absensi dan catatan berhasil disimpan');
      
      // Update local state without full reload
      const updatedRapots = await rapotApi.getBySiswa(parseInt(id));
      setAllRapots(updatedRapots);
      
    } catch (error: any) {
      console.error('Error saving absensi:', error);
      const errorMessage = error?.response?.data?.message || 'Gagal menyimpan data';
      toast.error(errorMessage);
    }
  };

  const filteredPenilaian = React.useMemo(() => {
     return allPenilaian.filter(p => p.semester === semester && p.tahun_ajaran === tahunAjaran);
  }, [allPenilaian, semester, tahunAjaran]);

  const chartData = React.useMemo(() => {
      const groups: Record<string, number[]> = {};
      
      allPenilaian.forEach(p => {
          const key = `${p.tahun_ajaran} ${p.semester}`;
          if (!groups[key]) groups[key] = [];
          if (p.nilai_Akhir) groups[key].push(Number(p.nilai_Akhir));
      });

      return Object.keys(groups).map(key => {
          const scores = groups[key];
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          return {
              period: key,
              nilai: Math.round(avg),
              // Helper for sorting
              year: parseInt(key.split('/')[0]),
              isGenap: key.includes('genap')
          };
      }).sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return (a.isGenap ? 1 : 0) - (b.isGenap ? 1 : 0);
      });
  }, [allPenilaian]);

  if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
  }

  if (!siswa) {
      return (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-muted-foreground">Siswa tidak ditemukan</p>
              <Button variant="outline" onClick={() => navigate(-1)}>Kembali</Button>
          </div>
      )
  }

  const getAverageScore = () => {
      const validScores = filteredPenilaian
        .map(p => Number(p.nilai_Akhir))
        .filter(v => Number.isFinite(v));
      
      if (validScores.length === 0) return 0;
      return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Detail Siswa</h1>
               <p className="text-muted-foreground">Detail nilai dan akademik siswa</p>
            </div>
          </div>
      </div>

       <div className="space-y-6">
           <Card>
              <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="w-5 h-5 text-primary" />
                      Data Siswa
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nama Lengkap</p>
                          <p className="font-semibold text-base">{siswa.nama}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">NIS</p>
                          <p className="font-semibold text-base">{siswa.nis}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Kelas</p>
                          <p className="font-semibold text-base">{siswa.kelas?.nama_kelas}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Jenis Kelamin</p>
                          <p className="font-semibold text-base">{siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alamat</p>
                          <p className="font-semibold text-base">{siswa.alamat || '-'}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Kontak Wali</p>
                          <p className="font-semibold text-base">{siswa.kontak_wali || '-'}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nama Ayah</p>
                          <p className="font-semibold text-base">{siswa.ayah || '-'}</p>
                      </div>
                       <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nama Ibu</p>
                          <p className="font-semibold text-base">{siswa.ibu || '-'}</p>
                      </div>
                       <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nama Wali</p>
                          <p className="font-semibold text-base">{siswa.wali || '-'}</p>
                      </div>
                  </div>
              </CardContent>
           </Card>
      </div>

      { chartData.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Grafik Perkembangan Akademik
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="period" 
                                tick={{fontSize: 12}} 
                                tickFormatter={(val) => {
                                    const [year, sem] = val.split(' ');
                                    return `${year.split('/')[0]} ${sem === 'ganjil' ? 'Ganjil' : 'Genap'}`;
                                }}
                            />
                            <YAxis domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px' }}
                                formatter={(val: number) => [`${val}`, 'Rata-rata Nilai']}
                                labelFormatter={(label) => `Periode: ${label}`}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="nilai" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2} 
                                activeDot={{ r: 8 }} 
                                name="Rata-rata Nilai Akhir"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}

       <div className="space-y-6">
          <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                          <BookOpen className="w-5 h-5 text-primary" />
                          Rekap Nilai
                      </CardTitle>
                      
                       <div className="flex items-center gap-2">
                        <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
                          <SelectTrigger className="w-32 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2023/2024">2023/2024</SelectItem>
                            <SelectItem value="2024/2025">2024/2025</SelectItem>
                            <SelectItem value="2025/2026">2025/2026</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={semester} onValueChange={(v: Semester) => setSemester(v)}>
                          <SelectTrigger className="w-28 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ganjil">Ganjil</SelectItem>
                            <SelectItem value="genap">Genap</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                  </CardHeader>
              <CardContent className="space-y-6">
                  <div className="border rounded-lg overflow-x-auto">
                      <Table>
                          <TableHeader>
                              <TableRow>
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
                              {mapel.map(m => {
                                  const nilai = filteredPenilaian.find(p => p.id_mapel === m.id);
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
                                                  <Badge variant="secondary" className="border-warning text-warning bg-warning/10">Belum Lengkap</Badge>
                                              ) : isTuntas ? (
                                                  <Badge variant="outline" className="border-success text-success">Tuntas</Badge>
                                              ) : (
                                                  <Badge variant="destructive">Remedial</Badge>
                                              )}
                                          </TableCell>
                                      </TableRow>
                                  )
                              })}
                   
                               <TableRow className="bg-muted/50 font-medium">
                                  <TableCell colSpan={10}>Rata-rata Nilai Akhir</TableCell>
                                  <TableCell className="text-center text-lg">{getAverageScore()}</TableCell>
                                  <TableCell></TableCell>
                              </TableRow>
                          </TableBody>
                      </Table>
                  </div>

         
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                      {(() => {
                          let tuntas = 0;
                          let belumTuntas = 0;
                          let remedial = 0;

                          mapel.forEach(m => {
                              const nilai = filteredPenilaian.find(p => p.id_mapel === m.id);
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

                              if (nilaiAkhir !== null && nilaiAkhir !== undefined && nilaiAkhir >= m.kkm) {
                                  tuntas += 1;
                              } else {
                                  remedial += 1;
                              }
                          });

                          return (
                              <>
                                  <div>
                                      <p className="text-sm text-muted-foreground">Total Mapel</p>
                                      <p className="font-semibold">{mapel.length}</p>
                                  </div>
                                  <div>
                                      <p className="text-sm text-muted-foreground">Tuntas</p>
                                      <p className="font-semibold text-success">{tuntas}</p>
                                  </div>
                                  <div>
                                      <p className="text-sm text-muted-foreground">Belum Lengkap</p>
                                      <p className="font-semibold text-warning">{belumTuntas}</p>
                                  </div>
                                  <div>
                                      <p className="text-sm text-muted-foreground">Remedial</p>
                                      <p className="font-semibold text-destructive">{remedial}</p>
                                  </div>
                              </>
                          );
                      })()}
                  </div>

                  {kelasWali && siswa.id_kelas === kelasWali.id && (
                    <>
                      <div className="border-t pt-6 mt-6">
                        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <GraduationCap className="w-5 h-5 text-primary" />
                             Absensi & Catatan
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="grid grid-cols-3 gap-4 md:col-span-1">
                                <div className="space-y-2">
                                    <Label className="text-xs">Sakit</Label>
                                    <Input 
                                        type="number" 
                                        min={0}
                                        value={absensiForm.sakit}
                                        onChange={e => setAbsensiForm({...absensiForm, sakit: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Izin</Label>
                                    <Input 
                                        type="number" 
                                        min={0}
                                        value={absensiForm.izin}
                                        onChange={e => setAbsensiForm({...absensiForm, izin: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Alpha</Label>
                                    <Input 
                                        type="number" 
                                        min={0}
                                        value={absensiForm.alpha}
                                        onChange={e => setAbsensiForm({...absensiForm, alpha: e.target.value})}
                                    />
                                </div>
                             </div>
                             
                             <div className="space-y-2 md:col-span-2">
                                <Label>Catatan Wali Kelas</Label>
                                <Textarea 
                                    placeholder="Catatan perkembangan siswa..." 
                                    rows={3}
                                    value={absensiForm.catatan_wali_kelas}
                                    onChange={e => setAbsensiForm({...absensiForm, catatan_wali_kelas: e.target.value})}
                                />
                             </div>
                         </div>
      
                         <div className="flex justify-end mt-4">
                             <Button onClick={handleSaveAbsensi}>
                                <Save className="w-4 h-4 mr-2" />
                                Simpan Data
                             </Button>
                         </div>
                      </div>
                    </>
                  )}
              </CardContent>
          </Card>
       </div>
    </div>
  );
};

export default DetailSiswa;
