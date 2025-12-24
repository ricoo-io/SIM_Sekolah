import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { mapelApi } from '@/lib/api';
import { MataPelajaran } from '@/lib/types';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

const MapelData: React.FC = () => {
  const [mapel, setMapel] = useState<MataPelajaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<MataPelajaran | null>(null);
  const [formData, setFormData] = useState({
    mata_pelajaran: '',
    kkm: 75,
  });

  const loadData = async () => {
    try {
      const mapelList = await mapelApi.getAll();
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
    
    // Check for duplicate name (case insensitive)
    const normalizedName = formData.mata_pelajaran.trim().toLowerCase();
    const isDuplicate = mapel.some(
      (m) =>
        m.mata_pelajaran.trim().toLowerCase() === normalizedName &&
        (!editingMapel || m.id !== editingMapel.id)
    );
    
    if (isDuplicate) {
      toast.error('Mata pelajaran dengan nama tersebut sudah ada');
      return;
    }
    
    try {
      if (editingMapel) {
        await mapelApi.update(editingMapel.id, formData);
        toast.success('Mata pelajaran berhasil diperbarui');
      } else {
        await mapelApi.create(formData);
        toast.success('Mata pelajaran berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (item: MataPelajaran) => {
    setEditingMapel(item);
    setFormData({
      mata_pelajaran: item.mata_pelajaran,
      kkm: item.kkm,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus mata pelajaran ini?')) {
      await mapelApi.delete(id);
      toast.success('Mata pelajaran berhasil dihapus');
      loadData();
    }
  };

  const resetForm = () => {
    setEditingMapel(null);
    setFormData({
      mata_pelajaran: '',
      kkm: 75,
    });
  };

  const columns: ColumnDef<MataPelajaran>[] = [
    { accessorKey: 'mata_pelajaran', header: 'Mata Pelajaran' },
    { 
      accessorKey: 'kkm', 
      header: 'KKM',
      cell: ({ row }) => (
        <span className="font-medium text-primary">{row.original.kkm}</span>
      )
    },
    {
      id: 'edit',
      header: 'Edit',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => handleEdit(row.original)}>
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
    {
      id: 'delete',
      header: 'Delete',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(row.original.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mata Pelajaran"
        description="Kelola data mata pelajaran dan KKM"
        action={{
          label: 'Tambah Mapel',
          onClick: () => {
            resetForm();
            setIsDialogOpen(true);
          },
        }}
      />

      <DataTable
        data={mapel}
        columns={columns}
        searchKey="mata_pelajaran"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMapel ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Mata Pelajaran</Label>
              <Input
                value={formData.mata_pelajaran}
                onChange={(e) => setFormData({ ...formData, mata_pelajaran: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>KKM (Kriteria Ketuntasan Minimal)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={formData.kkm}
                onChange={(e) => setFormData({ ...formData, kkm: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit">{editingMapel ? 'Simpan' : 'Tambah'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapelData;
