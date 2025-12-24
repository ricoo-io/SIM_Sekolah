import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Save } from 'lucide-react';
import { guruMapelApi, siswaApi, penilaianApi, mapelApi } from '@/lib/api';
import { GuruMataPelajaran, Siswa, Penilaian, MataPelajaran, Semester } from '@/lib/types';
import { toast } from 'sonner';

const NilaiPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<GuruMataPelajaran[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [semester, setSemester] = useState<Semester>('ganjil');
  const [tahunAjaran, setTahunAjaran] = useState<string>('2024/2025');
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [penilaian, setPenilaian] = useState<Record<number, Penilaian>>({});
  const [mapelKkm, setMapelKkm] = useState<number>(75);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadAssignments = async () => {
      if (!user) return;
      try {
        const data = await guruMapelApi.getByGuru(user.id);
        setAssignments(data);
        
        // Auto-select based on query params
        const kelasParam = searchParams.get('kelas');
        const mapelParam = searchParams.get('mapel');
        if (kelasParam && mapelParam) {
          const matchingAssignment = data.find(
            a => a.id_kelas === parseInt(kelasParam) && a.id_mapel === parseInt(mapelParam)
          );
          if (matchingAssignment) {
            setSelectedAssignment(matchingAssignment.id.toString());
          }
        }
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAssignments();
  }, [user, searchParams]);

  useEffect(() => {
    const loadGrades = async () => {
      if (!selectedAssignment) {
        setSiswa([]);
        setPenilaian({});
        return;
      }

      const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
      if (!assignment) return;

      try {
        const [siswaList, allPenilaian, mapelList] = await Promise.all([
          siswaApi.getByKelas(assignment.id_kelas),
          penilaianApi.getAll(),
          mapelApi.getAll(),
        ]);
        
        setSiswa(siswaList);
        
        const mapel = mapelList.find(m => m.id === assignment.id_mapel);
        setMapelKkm(mapel?.kkm || 75);

        const penilaianMap: Record<number, Penilaian> = {};
        siswaList.forEach(s => {
          const existing = allPenilaian.find(
            p => p.id_siswa === s.id && p.id_mapel === assignment.id_mapel && p.semester === semester && p.tahun_ajaran === tahunAjaran
          );
          if (existing) {
            penilaianMap[s.id] = existing;
          } else {
            penilaianMap[s.id] = {
              id: 0,
              id_siswa: s.id,
              id_mapel: assignment.id_mapel,
              id_guru: user!.id,
              semester,
              tahun_ajaran: tahunAjaran,
              nilai_harian_1: null,
              nilai_harian_2: null,
              nilai_harian_3: null,
              nilai_UTS: null,
              nilai_harian_4: null,
              nilai_harian_5: null,
              nilai_harian_6: null,
              nilai_UAS: null,
              nilai_Akhir: null,
            };
          }
        });
        setPenilaian(penilaianMap);
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    };
    loadGrades();
  }, [selectedAssignment, semester, tahunAjaran, assignments, user]);

  const handleNilaiChange = (siswaId: number, field: keyof Penilaian, value: string) => {
    let numValue: number | null = null;
    if (value !== '') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        const rounded = Math.round(parsed * 100) / 100;
        numValue = Math.min(100, Math.max(0, rounded));
      }
    }
    setPenilaian(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: numValue,
      },
    }));
  };

  const calculateNilaiAkhir = (p: Penilaian): number | null => {
    const nhValues = [
      p.nilai_harian_1,
      p.nilai_harian_2,
      p.nilai_harian_3,
      p.nilai_harian_4,
      p.nilai_harian_5,
      p.nilai_harian_6,
    ];

    const nhWithZeros = nhValues.map(n => Number(n ?? 0));
    
    const avgNh = nhWithZeros.reduce((sum, n) => sum + n, 0) / 6;
    
    const uts = Number(p.nilai_UTS ?? 0);
    const uas = Number(p.nilai_UAS ?? 0);

    const nilaiAkhir = avgNh * 0.4 + uts * 0.3 + uas * 0.3;
    return Math.round(nilaiAkhir * 10) / 10;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedPenilaian = { ...penilaian };
      Object.keys(updatedPenilaian).forEach(key => {
        const siswaId = parseInt(key);
        updatedPenilaian[siswaId] = {
          ...updatedPenilaian[siswaId],
          nilai_Akhir: calculateNilaiAkhir(updatedPenilaian[siswaId]),
        };
      });

      for (const siswaId of Object.keys(updatedPenilaian)) {
        const p = updatedPenilaian[parseInt(siswaId)];
        await penilaianApi.upsert({
          id_siswa: p.id_siswa,
          id_mapel: p.id_mapel,
          id_guru: p.id_guru,
          semester: p.semester,
          tahun_ajaran: tahunAjaran,
          nilai_harian_1: p.nilai_harian_1,
          nilai_harian_2: p.nilai_harian_2,
          nilai_harian_3: p.nilai_harian_3,
          nilai_UTS: p.nilai_UTS,
          nilai_harian_4: p.nilai_harian_4,
          nilai_harian_5: p.nilai_harian_5,
          nilai_harian_6: p.nilai_harian_6,
          nilai_UAS: p.nilai_UAS,
          nilai_Akhir: p.nilai_Akhir,
        });
      }
      
      setPenilaian(updatedPenilaian);
      toast.success('Nilai berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan nilai');
    } finally {
      setIsSaving(false);
    }
  };

  const getNilaiStatus = (nilai: number | null) => {
    if (nilai === null) return '';
    return nilai >= mapelKkm ? 'text-success' : 'text-destructive';
  };

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
        title="Input Nilai"
        description="Input nilai siswa per mata pelajaran"
      />

      <div className="bg-card rounded-xl border p-5 shadow-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Mata Pelajaran & Kelas</Label>
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mapel & kelas" />
              </SelectTrigger>
              <SelectContent>
                {assignments.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.mapel?.mata_pelajaran} - Kelas {a.kelas?.nama_kelas}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tahun Ajaran</Label>
            <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024/2025">2024/2025</SelectItem>
                <SelectItem value="2025/2026">2025/2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Semester</Label>
            <Select value={semester} onValueChange={(v: Semester) => setSemester(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ganjil">Ganjil</SelectItem>
                <SelectItem value="genap">Genap</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button onClick={handleSave} disabled={!selectedAssignment || isSaving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </div>

      {selectedAssignment && siswa.length > 0 && (
        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <p className="text-sm text-muted-foreground">KKM: <span className="font-semibold text-foreground">{mapelKkm}</span></p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="whitespace-nowrap">Nama Siswa</TableHead>
                  <TableHead className="text-center w-20">NH1</TableHead>
                  <TableHead className="text-center w-20">NH2</TableHead>
                  <TableHead className="text-center w-20">NH3</TableHead>
                  <TableHead className="text-center w-20 bg-primary/10">UTS</TableHead>
                  <TableHead className="text-center w-20">NH4</TableHead>
                  <TableHead className="text-center w-20">NH5</TableHead>
                  <TableHead className="text-center w-20">NH6</TableHead>
                  <TableHead className="text-center w-20 bg-primary/10">UAS</TableHead>
                  <TableHead className="text-center w-24 bg-accent/20">NA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siswa.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium whitespace-nowrap">{s.nama}</TableCell>
                    {(['nilai_harian_1', 'nilai_harian_2', 'nilai_harian_3', 'nilai_UTS', 'nilai_harian_4', 'nilai_harian_5', 'nilai_harian_6', 'nilai_UAS'] as const).map((field) => (
                      <TableCell key={field} className={field === 'nilai_UTS' || field === 'nilai_UAS' ? 'bg-primary/5' : ''}>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          value={penilaian[s.id]?.[field] !== null && penilaian[s.id]?.[field] !== undefined ? penilaian[s.id]?.[field] : ''}
                          onChange={(e) => handleNilaiChange(s.id, field, e.target.value)}
                          className="w-20 h-8 text-center text-sm p-1"
                        />
                      </TableCell>
                    ))}
                    <TableCell className={`text-center font-bold bg-accent/10 ${getNilaiStatus(penilaian[s.id]?.nilai_Akhir)}`}>
                      {penilaian[s.id]?.nilai_Akhir !== null && penilaian[s.id]?.nilai_Akhir !== undefined ? penilaian[s.id].nilai_Akhir : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {selectedAssignment && siswa.length === 0 && (
        <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground">
          Tidak ada siswa di kelas ini
        </div>
      )}
    </div>
  );
};

export default NilaiPage;
