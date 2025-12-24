import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Trash2, FileText, User, Users } from 'lucide-react';
import { siswaApi, kelasApi, penilaianApi, mapelApi } from '@/lib/api';
import { Siswa, Kelas, Penilaian, MataPelajaran, Semester } from '@/lib/types';
import { toast } from 'sonner';

const SiswaData: React.FC = () => {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [penilaian, setPenilaian] = useState<Penilaian[]>([]);
  const [mapel, setMapel] = useState<MataPelajaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNilaiDialogOpen, setIsNilaiDialogOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<string>('all');
  const [semester, setSemester] = useState<Semester>('ganjil');
  const [tahunAjaran, setTahunAjaran] = useState<string>('2024/2025');
  const [formData, setFormData] = useState({
    nis: '',
    nama: '',
    jenis_kelamin: 'L',
    alamat: '',
    ibu: '',
    ayah: '',
    wali: '',
    kontak_wali: '',
    id_kelas: '',
  });

  const loadData = async () => {
    try {
      const [siswaList, kelasList, penilaianList, mapelList] = await Promise.all([
        siswaApi.getAll(),
        kelasApi.getAll(),
        penilaianApi.getAll(),
        mapelApi.getAll(),
      ]);
      setSiswa(siswaList);
      setKelas(kelasList);
      setPenilaian(penilaianList);
      setMapel(mapelList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSiswa) {
        await siswaApi.update(editingSiswa.id, {
          ...formData,
          jenis_kelamin: formData.jenis_kelamin as 'L' | 'P',
          id_kelas: formData.id_kelas ? parseInt(formData.id_kelas) : null,
        });
        toast.success('Siswa berhasil diperbarui');
      } else {
        await siswaApi.create({
          ...formData,
          jenis_kelamin: formData.jenis_kelamin as 'L' | 'P',
          id_kelas: parseInt(formData.id_kelas),
        });
        toast.success('Siswa berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleViewDetail = (item: Siswa) => {
    setSelectedSiswa(item);
    setIsDetailDialogOpen(true);
  };

  const handleEditFromDetail = () => {
    if (selectedSiswa) {
      setEditingSiswa(selectedSiswa);
      setFormData({
        nis: selectedSiswa.nis,
        nama: selectedSiswa.nama,
        jenis_kelamin: selectedSiswa.jenis_kelamin,
        alamat: selectedSiswa.alamat,
        ibu: selectedSiswa.ibu,
        ayah: selectedSiswa.ayah,
        wali: selectedSiswa.wali,
        kontak_wali: selectedSiswa.kontak_wali,
        id_kelas: selectedSiswa.id_kelas?.toString() || '',
      });
      setIsDetailDialogOpen(false);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      await siswaApi.delete(id);
      toast.success('Siswa berhasil dihapus');
      loadData();
    }
  };

  const handleViewNilai = (s: Siswa) => {
    setSelectedSiswa(s);
    setSemester('ganjil');
    setTahunAjaran('2024/2025'); 
    setIsNilaiDialogOpen(true);
  };

  const getSiswaAverage = (siswaId: number) => {
    const nilaiValid = penilaian
      .filter(p => 
        p.id_siswa === siswaId && 
        p.semester === semester && 
        p.tahun_ajaran === tahunAjaran
      )
      .map(p => Number(p.nilai_Akhir))
      .filter(v => Number.isFinite(v));

    if (nilaiValid.length === 0) return null;

    const total = nilaiValid.reduce((sum, v) => sum + v, 0);
    return Math.round(total / nilaiValid.length);
  };

  const getNilaiStatusCounts = (siswaId: number) => {
    let tuntas = 0;
    let belumTuntas = 0;
    let remedial = 0;

    mapel.forEach(m => {
      const nilai = penilaian.find(p => 
        p.id_siswa === siswaId && 
        p.id_mapel === m.id &&
        p.semester === semester &&
        p.tahun_ajaran === tahunAjaran
      );
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

  const resetForm = () => {
    setEditingSiswa(null);
    setFormData({
      nis: '',
      nama: '',
      jenis_kelamin: 'L',
      alamat: '',
      ibu: '',
      ayah: '',
      wali: '',
      kontak_wali: '',
      id_kelas: '',
    });
  };

  const filteredSiswa = siswa.filter(s => {
    return selectedKelas === 'all' || s.id_kelas?.toString() === selectedKelas;
  });

  const columns: ColumnDef<Siswa>[] = [
    {
      accessorKey: 'nis',
      header: 'NIS',
    },
    {
      accessorKey: 'nama',
      header: 'Nama',
    },
    {
      accessorKey: 'jenis_kelamin',
      header: 'Jenis Kelamin',
      cell: ({ row }) => {
        const isL = row.original.jenis_kelamin === 'L';
        return (
          <Badge 
            variant="outline" 
            className={isL ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-pink-50 text-pink-700 border-pink-200"}
          >
            {isL ? 'Laki-laki' : 'Perempuan'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'kelas.nama_kelas',
      header: 'Kelas',
      cell: ({ row }) => row.original.kelas?.nama_kelas || '-'
    },
    {
      accessorKey: 'kontak_wali',
      header: 'Kontak Wali',
    },
    {
      id: 'nilai',
      header: 'Nilai',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => handleViewNilai(row.original)}>
          <FileText className="w-4 h-4" />
        </Button>
      ),
    },
    {
      id: 'actions',
      header: 'Detail',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => handleViewDetail(row.original)}>
          <User className="w-4 h-4" />
        </Button>
      ),
    },
    {
      id: 'delete',
      header: 'Delete',
      cell: ({ row }) => (
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-destructive"
          onClick={() => handleDelete(row.original.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Siswa"
        description="Kelola data siswa sekolah"
        action={{
          label: 'Tambah Siswa',
          onClick: () => {
            resetForm();
            setIsDialogOpen(true);
          },
        }}
      />

      <DataTable
        columns={columns}
        data={filteredSiswa}
        searchKey="nama"
        filterElement={
          <div className="w-full sm:w-[200px]">
            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelas.map((k) => (
                  <SelectItem key={k.id} value={k.id.toString()}>
                    {k.nama_kelas}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Siswa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>NIS</Label>
                  <Input
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kelas</Label>
                  <Select value={formData.id_kelas} onValueChange={(v) => setFormData({ ...formData, id_kelas: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {kelas.map((k) => (
                        <SelectItem key={k.id} value={k.id.toString()}>{k.nama_kelas}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <Select value={formData.jenis_kelamin} onValueChange={(v) => setFormData({ ...formData, jenis_kelamin: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Alamat</Label>
                  <Input
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Ayah</Label>
                  <Input
                    value={formData.ayah}
                    onChange={(e) => setFormData({ ...formData, ayah: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Ibu</Label>
                  <Input
                    value={formData.ibu}
                    onChange={(e) => setFormData({ ...formData, ibu: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wali</Label>
                  <Input
                    value={formData.wali}
                    onChange={(e) => setFormData({ ...formData, wali: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kontak Wali</Label>
                  <Input
                    value={formData.kontak_wali}
                    onChange={(e) => setFormData({ ...formData, kontak_wali: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit">Tambah</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Data Siswa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
               <User className="w-4 h-4" /> Informasi Pribadi
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">NIS</Label>
                  <p className="font-medium">{selectedSiswa?.nis}</p>
                </div>
                <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Kelas</Label>
                   <p className="font-medium">{selectedSiswa?.kelas?.nama_kelas || '-'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nama Lengkap</Label>
                  <p className="font-medium">{selectedSiswa?.nama}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Jenis Kelamin</Label>
                   <div className="flex items-center gap-2">
                    {selectedSiswa?.jenis_kelamin === 'L' ? (
                       <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Laki-laki</Badge>
                    ) : (
                       <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">Perempuan</Badge>
                    )}
                   </div>
                </div>
                 <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Alamat</Label>
                  <p className="font-medium">{selectedSiswa?.alamat}</p>
                </div>
              </div>
            </div>

            <div>
               <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Users className="w-4 h-4" /> Data Orang Tua & Wali
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                 <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nama Ayah</Label>
                  <p className="font-medium">{selectedSiswa?.ayah}</p>
                 </div>
                 <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nama Ibu</Label>
                  <p className="font-medium">{selectedSiswa?.ibu}</p>
                 </div>
                 <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Wali</Label>
                  <p className="font-medium">{selectedSiswa?.wali}</p>
                 </div>
                 <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Kontak Wali</Label>
                  <p className="font-medium">{selectedSiswa?.kontak_wali}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
            <Button onClick={handleEditFromDetail}>
              Edit Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Data Siswa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            
      
            <div className="space-y-4">
               <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Informasi Pribadi</h3>
               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>NIS</Label>
                  <Input
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kelas</Label>
                  <Select value={formData.id_kelas} onValueChange={(v) => setFormData({ ...formData, id_kelas: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {kelas.map((k) => (
                        <SelectItem key={k.id} value={k.id.toString()}>{k.nama_kelas}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <Select value={formData.jenis_kelamin} onValueChange={(v) => setFormData({ ...formData, jenis_kelamin: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Alamat</Label>
                  <Input
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    required
                  />
                </div>
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Data Orang Tua & Wali</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Ayah</Label>
                  <Input
                    value={formData.ayah}
                    onChange={(e) => setFormData({ ...formData, ayah: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Ibu</Label>
                  <Input
                    value={formData.ibu}
                    onChange={(e) => setFormData({ ...formData, ibu: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wali</Label>
                  <Input
                    value={formData.wali}
                    onChange={(e) => setFormData({ ...formData, wali: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kontak Wali</Label>
                  <Input
                    value={formData.kontak_wali}
                    onChange={(e) => setFormData({ ...formData, kontak_wali: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isNilaiDialogOpen} onOpenChange={setIsNilaiDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Detail Nilai</DialogTitle>
            <div className="flex gap-2 mr-6">
              <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                </SelectContent>
              </Select>

              <Select value={semester} onValueChange={(v: Semester) => setSemester(v)}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ganjil">Ganjil</SelectItem>
                  <SelectItem value="genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-4">

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
                <p className="text-sm text-muted-foreground">Kelas</p>
                <p className="font-semibold">{selectedSiswa?.kelas?.nama_kelas || '-'}</p>
              </div>
            </div>

    
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
                    const nilai = penilaian.find(p => 
                      p.id_siswa === selectedSiswa?.id && 
                      p.id_mapel === m.id &&
                      p.semester === semester &&
                      p.tahun_ajaran === tahunAjaran
                    );
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

export default SiswaData;