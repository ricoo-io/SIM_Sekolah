import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { kelasApi, usersApi } from '@/lib/api';
import { Kelas, User, Tingkat } from '@/lib/types';
import { toast } from 'sonner';

const NO_WALI = 'none';

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

  const loadData = async () => {
    try {
      const [kelasList, guruList] = await Promise.all([
        kelasApi.getAll(),
        usersApi.getGuru(),
      ]);
      setKelas(kelasList);
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

  const resetForm = () => {
    setEditingKelas(null);
    setFormData({
      nama_kelas: '',
      tingkat: '7',
      id_guru: NO_WALI,
    });
  };

  const columns = [
    { key: 'nama_kelas', header: 'Nama Kelas' },
    {
      key: 'tingkat',
      header: 'Tingkat',
      render: (item: Kelas) => (
        <Badge variant="outline">Kelas {item.tingkat}</Badge>
      ),
    },
    {
      key: 'wali_kelas',
      header: 'Wali Kelas',
      render: (item: Kelas) => item.wali_kelas?.nama || <span className="text-muted-foreground">Belum ada</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Kelas) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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
        data={kelas}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="Belum ada data kelas"
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
                  {guru.map((g) => (
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
    </div>
  );
};

export default KelasData;
