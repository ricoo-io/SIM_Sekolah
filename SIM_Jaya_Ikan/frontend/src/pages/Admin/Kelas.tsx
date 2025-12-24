import React, { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Pencil, Trash2, Eye, Users, UserPlus } from 'lucide-react';
import { kelasApi, usersApi, siswaApi } from '@/lib/api';
import { Kelas, User, Tingkat, Siswa } from '@/lib/types';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

const NO_WALI = 'none';

const normalizeName = (name: string) => name.trim().toLowerCase();
const getTingkatFromName = (name: string) => {
  const match = name.trim().match(/^(\d+)/);
  return match ? match[1] : null;
};
const sortKelas = (items: Kelas[]) =>
  [...items].sort((a, b) => {
    const diff = Number(a.tingkat) - Number(b.tingkat);
    if (diff !== 0) return diff;
    return a.nama_kelas.localeCompare(b.nama_kelas, 'id');
  });

const KelasData: React.FC = () => {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [guru, setGuru] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [formData, setFormData] = useState({
    nama_kelas: '',
    tingkat: '7' as Tingkat,
    id_guru: NO_WALI,
  });
  const [filterTingkat, setFilterTingkat] = useState<string>('all');

 
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedKelasForDetail, setSelectedKelasForDetail] = useState<Kelas | null>(null);
  const [studentsInClass, setStudentsInClass] = useState<Siswa[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedKelasForAssign, setSelectedKelasForAssign] = useState<Kelas | null>(null);
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([]);
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<Set<number>>(new Set());
  const [assignFilter, setAssignFilter] = useState<string>('no-class');
  const [searchAssign, setSearchAssign] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const assignedGuruIds = useMemo(
    () => new Set(kelas.filter(k => k.id_guru !== null).map(k => k.id_guru as number)),
    [kelas]
  );

  const availableGuru = useMemo(
    () => guru.filter(g => !assignedGuruIds.has(g.id) || editingKelas?.id_guru === g.id),
    [guru, assignedGuruIds, editingKelas]
  );

  const loadData = async () => {
    try {
      const [kelasList, guruList] = await Promise.all([
        kelasApi.getAll(),
        usersApi.getGuru(),
      ]);
      setKelas(sortKelas(kelasList));
      setGuru(guruList.filter(g => g.wali_kelas));
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
      const data = {
        nama_kelas: formData.nama_kelas,
        tingkat: formData.tingkat,
        id_guru: formData.id_guru === NO_WALI ? null : parseInt(formData.id_guru, 10),
      };
      
      const isDuplicate = kelas.some(
        (k) =>
          normalizeName(k.nama_kelas) === normalizeName(formData.nama_kelas) &&
          (!editingKelas || k.id !== editingKelas.id)
      );
      if (isDuplicate) {
        toast.error('Nama kelas sudah ada, gunakan nama lain');
        return;
      }

      const tingkatFromName = getTingkatFromName(formData.nama_kelas);
      if (!tingkatFromName) {
        toast.error('Nama kelas harus diawali angka tingkat (misal 7A, 8B)');
        return;
      }
      if (tingkatFromName !== formData.tingkat) {
        toast.error('Angka pada nama kelas harus sama dengan pilihan tingkat');
        return;
      }

      if (editingKelas) {
        await kelasApi.update(editingKelas.id, data);
        toast.success('Kelas berhasil diperbarui');
      } else {
        await kelasApi.create(data);
        toast.success('Kelas berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: Kelas) => {
    setEditingKelas(item);
    setFormData({
      nama_kelas: item.nama_kelas,
      tingkat: item.tingkat,
      id_guru: item.id_guru ? item.id_guru.toString() : NO_WALI,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus kelas ini?')) {
      await kelasApi.delete(id);
      toast.success('Kelas berhasil dihapus');
      loadData();
    }
  };

  const handleViewDetail = async (item: Kelas) => {
    setSelectedKelasForDetail(item);
    setIsDetailOpen(true);
    setIsLoadingStudents(true);
    try {
      const students = await siswaApi.getByKelas(item.id);
      setStudentsInClass(students);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Gagal memuat data siswa');
      setStudentsInClass([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleOpenAssign = async (item: Kelas) => {
    setSelectedKelasForAssign(item);
    setSelectedSiswaIds(new Set());
    setAssignFilter('no-class');
    setSearchAssign('');
    setIsAssignOpen(true);
    try {
      const allStudents = await siswaApi.getAll();
      setAllSiswa(allStudents);
    } catch (error) {
      console.error('Failed to fetch all students:', error);
      toast.error('Gagal memuat data siswa');
    }
  };

  const filteredSiswaForAssign = useMemo(() => {
    let filtered = allSiswa;
    
  
    if (assignFilter === 'no-class') {
      filtered = filtered.filter(s => s.id_kelas === null);
    } else if (assignFilter !== 'all') {
      filtered = filtered.filter(s => s.id_kelas?.toString() === assignFilter);
    }
    
    if (selectedKelasForAssign) {
      filtered = filtered.filter(s => s.id_kelas !== selectedKelasForAssign.id);
    }
    
    if (searchAssign) {
      const search = searchAssign.toLowerCase();
      filtered = filtered.filter(s => 
        s.nama.toLowerCase().includes(search) || 
        s.nis.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [allSiswa, assignFilter, selectedKelasForAssign, searchAssign]);

  const toggleSiswaSelection = (id: number) => {
    setSelectedSiswaIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedSiswaIds(new Set(filteredSiswaForAssign.map(s => s.id)));
  };

  const deselectAll = () => {
    setSelectedSiswaIds(new Set());
  };

  const handleBulkAssign = async () => {
    if (!selectedKelasForAssign || selectedSiswaIds.size === 0) return;
    
    setIsAssigning(true);
    try {
      const result = await siswaApi.bulkAssignKelas(
        Array.from(selectedSiswaIds),
        selectedKelasForAssign.id
      );
      toast.success(result.message);
      setIsAssignOpen(false);
      loadData();
    } catch (error) {
      console.error('Bulk assign failed:', error);
      toast.error('Gagal memindahkan siswa');
    } finally {
      setIsAssigning(false);
    }
  };

  const resetForm = () => {
    setEditingKelas(null);
    setFormData({
      nama_kelas: '',
      tingkat: '7',
      id_guru: NO_WALI,
    });
  };

  const filteredData = useMemo(() => {
    if (filterTingkat === 'all') return kelas;
    return kelas.filter(k => k.tingkat === filterTingkat);
  }, [kelas, filterTingkat]);

  const columns: ColumnDef<Kelas>[] = [
    { accessorKey: 'nama_kelas', header: 'Nama Kelas' },
    {
      accessorKey: 'tingkat',
      header: 'Tingkat',
      cell: ({ row }) => (
        <Badge variant="outline">Kelas {row.original.tingkat}</Badge>
      ),
    },
    {
      accessorKey: 'wali_kelas',
      header: 'Wali Kelas',
      cell: ({ row }) => row.original.wali_kelas?.nama || <span className="text-muted-foreground">Belum ada</span>,
    },
    {
      accessorKey: 'jumlah_siswa',
      header: 'Jumlah Siswa',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.jumlah_siswa || 0} Siswa
        </Badge>
      ),
    },
    {
      id: 'assign',
      header: 'Assign',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-primary" onClick={() => handleOpenAssign(row.original)} title="Assign Siswa">
          <UserPlus className="w-4 h-4" />
        </Button>
      ),
    },
    {
      id: 'detail',
      header: 'Detail',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleViewDetail(row.original)} title="Lihat Siswa">
          <Users className="w-4 h-4" />
        </Button>
      ),
    },
    {
      id: 'edit',
      header: 'Edit',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => handleEdit(row.original)} title="Edit Kelas">
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
    {
      id: 'delete',
      header: 'Delete',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(row.original.id)} title="Hapus Kelas">
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Kelas"
        description="Kelola data kelas dan wali kelas"
        action={{
          label: 'Tambah Kelas',
          onClick: () => {
            resetForm();
            setIsDialogOpen(true);
          },
        }}
      />

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="nama_kelas"
        filterElement={
          <div className="w-full sm:w-[200px]">
            <Select value={filterTingkat} onValueChange={setFilterTingkat}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tingkat</SelectItem>
                <SelectItem value="7">Kelas 7</SelectItem>
                <SelectItem value="8">Kelas 8</SelectItem>
                <SelectItem value="9">Kelas 9</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingKelas ? 'Edit Kelas' : 'Tambah Kelas'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kelas</Label>
              <Input
                value={formData.nama_kelas}
                onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                placeholder="Contoh: 7A, 8B, 9C"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tingkat</Label>
              <Select value={formData.tingkat} onValueChange={(v: Tingkat) => setFormData({ ...formData, tingkat: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Kelas 7</SelectItem>
                  <SelectItem value="8">Kelas 8</SelectItem>
                  <SelectItem value="9">Kelas 9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Wali Kelas</Label>
              <Select value={formData.id_guru} onValueChange={(v) => setFormData({ ...formData, id_guru: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih wali kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_WALI}>Belum ditentukan</SelectItem>
                  {availableGuru.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>{g.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit">{editingKelas ? 'Simpan' : 'Tambah'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Detail Siswa */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-primary" />
              Daftar Siswa - Kelas {selectedKelasForDetail?.nama_kelas}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto mt-4">
            {isLoadingStudents ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-3 text-muted-foreground">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p>Memuat data siswa...</p>
              </div>
            ) : studentsInClass.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead className="w-[120px]">NIS</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead className="w-[150px]">Jenis Kelamin</TableHead>
                      <TableHead>Alamat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsInClass.map((siswa, index) => {
                      const isL = siswa.jenis_kelamin === 'L';
                      return (
                        <TableRow key={siswa.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="text-center">{index + 1}</TableCell>
                          <TableCell className="font-medium font-mono text-xs">{siswa.nis}</TableCell>
                          <TableCell className="font-medium">{siswa.nama}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={isL ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-pink-50 text-pink-700 border-pink-200"}
                            >
                              {isL ? 'Laki-laki' : 'Perempuan'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{siswa.alamat}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                <p>Tidak ada siswa di kelas ini</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t mt-2">
            <Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Assign Siswa */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="w-5 h-5 text-primary" />
              Assign Siswa ke Kelas {selectedKelasForAssign?.nama_kelas}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4 py-4">
            <div className="flex-1">
              <Input 
                placeholder="Cari nama atau NIS..." 
                value={searchAssign}
                onChange={(e) => setSearchAssign(e.target.value)}
              />
            </div>
            <Select value={assignFilter} onValueChange={setAssignFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter sumber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-class">Tanpa Kelas</SelectItem>
                <SelectItem value="all">Semua Siswa</SelectItem>
                {kelas.filter(k => k.id !== selectedKelasForAssign?.id).map((k) => (
                  <SelectItem key={k.id} value={k.id.toString()}>Dari {k.nama_kelas}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 pb-2">
            <Button variant="outline" size="sm" onClick={selectAllFiltered}>
              Pilih Semua ({filteredSiswaForAssign.length})
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Batal Pilih
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedSiswaIds.size} siswa dipilih
            </span>
          </div>

          <div className="flex-1 overflow-auto border rounded-md">
            {filteredSiswaForAssign.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[120px]">NIS</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="w-[150px]">Kelas Sekarang</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSiswaForAssign.map((siswa) => (
                    <TableRow 
                      key={siswa.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSiswaSelection(siswa.id)}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedSiswaIds.has(siswa.id)}
                          onCheckedChange={() => toggleSiswaSelection(siswa.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{siswa.nis}</TableCell>
                      <TableCell className="font-medium">{siswa.nama}</TableCell>
                      <TableCell>
                        {siswa.kelas?.nama_kelas || <span className="text-muted-foreground">Belum ada</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p>Tidak ada siswa yang tersedia</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t mt-2">
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Batal</Button>
            <Button 
              onClick={handleBulkAssign} 
              disabled={selectedSiswaIds.size === 0 || isAssigning}
            >
              {isAssigning ? 'Memproses...' : `Assign ${selectedSiswaIds.size} Siswa`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KelasData;
