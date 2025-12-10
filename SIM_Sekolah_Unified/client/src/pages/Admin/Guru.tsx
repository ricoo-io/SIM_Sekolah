import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
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
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2 } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { User } from '@/lib/types';
import { toast } from 'sonner';

const GuruData: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    password: '',
    role: 'guru' as 'admin' | 'guru',
    wali_kelas: false,
  });

  const loadData = async () => {
    try {
      const usersList = await usersApi.getAll();
      setUsers(usersList);
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
      const safeWaliKelas = formData.role === 'admin' ? false : (formData.wali_kelas || false);

      if (editingUser) {
        const updateData: Partial<User> = {
          nama: formData.nama,
          nip: formData.nip,
          role: formData.role,
          wali_kelas: safeWaliKelas,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await usersApi.update(editingUser.id, updateData);
        toast.success('User berhasil diperbarui');
      } else {
        await usersApi.create({
          ...formData,
          wali_kelas: safeWaliKelas,
        });
        toast.success('User berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const message = error.response?.data?.message || 'Gagal menyimpan data';
      toast.error(message);
    }
  };

  const handleEdit = (item: User) => {
    setEditingUser(item);
    setFormData({
      nama: item.nama,
      nip: item.nip,
      password: '',
      role: item.role,
      wali_kelas: item.role === 'admin' ? false : item.wali_kelas,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      await usersApi.delete(id);
      toast.success('User berhasil dihapus');
      loadData();
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      nama: '',
      nip: '',
      password: '',
      role: 'guru',
      wali_kelas: false,
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'nip',
      header: 'NIP',
    },
    {
      accessorKey: 'nama',
      header: 'Nama',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'wali_kelas',
      header: 'Wali Kelas',
      cell: ({ row }) => (
        row.original.wali_kelas ? (
          <Badge variant="outline" className="border-success text-success">Ya</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
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
        title="Data Guru & Admin"
        description="Kelola data guru dan administrator"
        action={{
          label: 'Tambah User',
          onClick: () => {
            resetForm();
            setIsDialogOpen(true);
          },
        }}
      />

      <DataTable
        columns={columns}
        data={users}
        searchKey="nama"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>NIP</Label>
              <Input
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password {editingUser && '(kosongkan jika tidak diubah)'}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v: 'admin' | 'guru') => {
                  setFormData({ 
                    ...formData, 
                    role: v,
                    wali_kelas: v === 'admin' ? false : formData.wali_kelas 
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="guru">Guru</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role === 'guru' && (
              <div className="flex items-center justify-between">
                <Label>Wali Kelas</Label>
                <Switch
                  checked={formData.wali_kelas}
                  onCheckedChange={(checked) => setFormData({ ...formData, wali_kelas: checked })}
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit">{editingUser ? 'Simpan' : 'Tambah'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuruData;
