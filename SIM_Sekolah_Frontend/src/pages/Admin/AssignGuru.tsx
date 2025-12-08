import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
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
import { Trash2 } from 'lucide-react';
import { guruMapelApi, usersApi, mapelApi, kelasApi } from '@/lib/api';
import { GuruMataPelajaran, User, MataPelajaran, Kelas } from '@/lib/types';
import { toast } from 'sonner';

const AssignGuru: React.FC = () => {
  const [assignments, setAssignments] = useState<GuruMataPelajaran[]>([]);
  const [guru, setGuru] = useState<User[]>([]);
  const [mapel, setMapel] = useState<MataPelajaran[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_guru: '',
    id_mapel: '',
    id_kelas: '',
  });

  const loadData = async () => {
    try {
      const [assignmentsList, guruList, mapelList, kelasList] = await Promise.all([
        guruMapelApi.getAll(),
        usersApi.getGuru(),
        mapelApi.getAll(),
        kelasApi.getAll(),
      ]);
      setAssignments(assignmentsList);
      setGuru(guruList);
      setMapel(mapelList);
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
      const exists = assignments.find(
        a => a.id_guru === parseInt(formData.id_guru) &&
             a.id_mapel === parseInt(formData.id_mapel) &&
             a.id_kelas === parseInt(formData.id_kelas)
      );
      
      if (exists) {
        toast.error('Penugasan sudah ada');
        return;
      }

      await guruMapelApi.create({
        id_guru: parseInt(formData.id_guru),
        id_mapel: parseInt(formData.id_mapel),
        id_kelas: parseInt(formData.id_kelas),
      });
      toast.success('Penugasan berhasil ditambahkan');
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus penugasan ini?')) {
      await guruMapelApi.delete(id);
      toast.success('Penugasan berhasil dihapus');
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      id_guru: '',
      id_mapel: '',
      id_kelas: '',
    });
  };

  const columns = [
    {
      key: 'guru',
      header: 'Guru',
      render: (item: GuruMataPelajaran) => item.guru?.nama || '-',
    },
    {
      key: 'mapel',
      header: 'Mata Pelajaran',
      render: (item: GuruMataPelajaran) => item.mapel?.mata_pelajaran || '-',
    },
    {
      key: 'kelas',
      header: 'Kelas',
      render: (item: GuruMataPelajaran) => item.kelas?.nama_kelas || '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: GuruMataPelajaran) => (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penugasan Guru"
        description="Assign guru ke mata pelajaran dan kelas"
        action={{
          label: 'Tambah Penugasan',
          onClick: () => {
            resetForm();
            setIsDialogOpen(true);
          },
        }}
      />

      <DataTable
        data={assignments}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="Belum ada penugasan"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Penugasan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Guru</Label>
              <Select value={formData.id_guru} onValueChange={(v) => setFormData({ ...formData, id_guru: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih guru" />
                </SelectTrigger>
                <SelectContent>
                  {guru.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>{g.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select value={formData.id_mapel} onValueChange={(v) => setFormData({ ...formData, id_mapel: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  {mapel.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.mata_pelajaran}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit">Tambah</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignGuru;
