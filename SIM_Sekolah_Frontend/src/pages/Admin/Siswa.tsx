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
import { Pencil, Trash2 } from 'lucide-react';
import { siswaApi, kelasApi } from '@/lib/api';
import { Siswa, Kelas } from '@/lib/types';
import { toast } from 'sonner';

const SiswaData: React.FC = () => {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<string>('all');
  const [formData, setFormData] = useState({
    nis: '',
    nama: '',
    alamat: '',
    ibu: '',
    ayah: '',
    wali: '',
    kontak_wali: '',
    id_kelas: '',
  });

  const loadData = async () => {
    try {
      const [siswaList, kelasList] = await Promise.all([
        siswaApi.getAll(),
        kelasApi.getAll(),
      ]);
      setSiswa(siswaList);
      setKelas(kelasList);
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
          id_kelas: parseInt(formData.id_kelas),
        });
        toast.success('Siswa berhasil diperbarui');
      } else {
        await siswaApi.create({
          ...formData,
          id_kelas: parseInt(formData.id_kelas),
        });
        toast.success('Siswa berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: Siswa) => {
    setEditingSiswa(item);
    setFormData({
      nis: item.nis,
      nama: item.nama,
      alamat: item.alamat,
      ibu: item.ibu,
      ayah: item.ayah,
      wali: item.wali,
      kontak_wali: item.kontak_wali,
      id_kelas: item.id_kelas.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) {
      await siswaApi.delete(id);
      toast.success('Siswa berhasil dihapus');
      loadData();
    }
  };

  const resetForm = () => {
    setEditingSiswa(null);
    setFormData({
      nis: '',
      nama: '',
      alamat: '',
      ibu: '',
      ayah: '',
      wali: '',
      kontak_wali: '',
      id_kelas: '',
    });
  };

  const filteredSiswa = siswa.filter(s => {
    // Only filter by Class here. Text search is handled by DataTable.
    return selectedKelas === 'all' || s.id_kelas.toString() === selectedKelas;
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
      accessorKey: 'kelas.nama_kelas',
      header: 'Kelas',
      cell: ({ row }) => row.original.kelas?.nama_kelas || '-'
    },
    {
      accessorKey: 'kontak_wali',
      header: 'Kontak Wali',
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row.original)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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
        searchKey="nama" // Activates Global Search
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSiswa ? 'Edit Siswa' : 'Tambah Siswa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Alamat</Label>
              <Input
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                required
              />
            </div>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit">{editingSiswa ? 'Simpan' : 'Tambah'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiswaData;
