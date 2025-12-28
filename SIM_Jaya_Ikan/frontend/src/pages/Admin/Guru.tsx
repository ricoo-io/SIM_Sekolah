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
import { usersApi, guruMapelApi, kelasApi } from '@/lib/api';
import { User, Kelas, GuruMataPelajaran } from '@/lib/types';
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

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<User | null>(null);
  const [detailWaliKelas, setDetailWaliKelas] = useState<Kelas | null>(null);
  const [detailAssignments, setDetailAssignments] = useState<GuruMataPelajaran[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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
    
    const isDuplicateNip = users.some(
      (u) => 
        u.nip === formData.nip && 
        (!editingUser || u.id !== editingUser.id)
    );

    if (isDuplicateNip) {
      toast.error('NIP sudah terdaftar');
      return;
    }

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
      id: 'edit',
      header: 'Edit',
      cell: ({ row }) => (
      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEdit(row.original); }}>
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
    {
      id: 'delete',
      header: 'Delete',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(row.original.id); }}>
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const handleViewDetail = async (user: User) => {
      setSelectedGuru(user);
      setIsDetailOpen(true);
      setIsLoadingDetail(true);
      try {
          const [allKelas, allAssignments] = await Promise.all([
              kelasApi.getAll(),
              guruMapelApi.getAll()
          ]);

          const waliKelas = allKelas.find(k => k.id_guru === user.id) || null;
          const assignments = allAssignments.filter(a => a.id_guru === user.id);

          setDetailWaliKelas(waliKelas);
          setDetailAssignments(assignments);
      } catch (error) {
          console.error("Failed to load details", error);
          toast.error("Gagal memuat detail user");
      } finally {
          setIsLoadingDetail(false);
      }
  };

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
        onRowClick={(row) => handleViewDetail(row)}
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail User</DialogTitle>
          </DialogHeader>
          {selectedGuru && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {selectedGuru.nama.substring(0, 2).toUpperCase()}
                 </div>
                 <div>
                    <h3 className="font-semibold text-lg">{selectedGuru.nama}</h3>
                    <p className="text-sm text-muted-foreground">NIP. {selectedGuru.nip}</p>
                 </div>
              </div>

              {selectedGuru.role === 'guru' && (
              <div className="space-y-4">
                 <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Informasi Wali Kelas</h4>
                    {isLoadingDetail ? (
                        <p className="text-sm">Memuat...</p>
                    ) : selectedGuru.wali_kelas ? (
                        detailWaliKelas ? (
                            <p className="text-base font-medium">Wali Kelas {detailWaliKelas.nama_kelas}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Belum ditentukan</p>
                        )
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Bukan Wali Kelas</p>
                    )}
                 </div>

                 <div className="rounded-lg border">
                    <div className="p-3 border-b bg-muted/30">
                        <h4 className="text-sm font-medium">Daftar Mengajar</h4>
                    </div>
                    <div className="p-2 max-h-[200px] overflow-auto">
                        {isLoadingDetail ? (
                            <div className="p-4 text-center text-sm">Memuat data...</div>
                        ) : detailAssignments.length > 0 ? (
                            <ul className="space-y-1">
                                {detailAssignments.map((a) => (
                                    <li key={a.id} className="text-sm p-2 hover:bg-muted/50 rounded flex justify-between items-center">
                                        <span>{a.mapel?.mata_pelajaran}</span>
                                        <Badge variant="outline" className="text-xs">Kelas {a.kelas?.nama_kelas}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Belum ada penugasan mengajar
                            </div>
                        )}
                    </div>
                 </div>
              </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuruData;
