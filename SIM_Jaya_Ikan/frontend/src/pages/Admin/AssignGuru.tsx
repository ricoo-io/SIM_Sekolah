import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Combobox } from '@/components/ui/combobox';
import { Trash2, UserPlus, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { guruMapelApi, usersApi, mapelApi, kelasApi } from '@/lib/api';
import { GuruMataPelajaran, User, MataPelajaran, Kelas } from '@/lib/types';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AssignGuru: React.FC = () => {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [allAssignments, setAllAssignments] = useState<GuruMataPelajaran[]>([]);
  const [guru, setGuru] = useState<User[]>([]);
  const [mapel, setMapel] = useState<MataPelajaran[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Manage Dialog State
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  
  // Form State for Adding Assignment
  const [formData, setFormData] = useState({
    id_guru: '',
    id_mapel: '',
  });

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [kelasList, assignmentsList, allUsers, mapelList] = await Promise.all([
        kelasApi.getAll(),
        guruMapelApi.getAll(),
        usersApi.getAll(),
        mapelApi.getAll(),
      ]);
      
      // Sort kelas by tingkat then name (optional, but good UX)
      const sortedKelas = kelasList.sort((a, b) => {
         const tA = parseInt(a.tingkat) || 0;
         const tB = parseInt(b.tingkat) || 0;
         if (tA !== tB) return tA - tB;
         return a.nama_kelas.localeCompare(b.nama_kelas);
      });

      setKelas(sortedKelas);
      setAllAssignments(assignmentsList);
      setGuru(allUsers.filter(u => u.role === 'guru'));
      setMapel(mapelList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenManage = (item: Kelas) => {
    setSelectedKelas(item);
    setFormData({ id_guru: '', id_mapel: '' }); // Reset form
    setIsManageOpen(true);
  };

  const currentClassAssignments = useMemo(() => {
    if (!selectedKelas) return [];
    return allAssignments.filter(a => a.id_kelas === selectedKelas.id);
  }, [selectedKelas, allAssignments]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKelas) return;
    if (!formData.id_guru || !formData.id_mapel) {
      toast.error('Mohon pilih Mata Pelajaran dan Guru');
      return;
    }

    try {

      const exists = currentClassAssignments.find(
        a => a.id_mapel === parseInt(formData.id_mapel) && 
             a.id_guru === parseInt(formData.id_guru)
      );
      
      if (exists) {
        toast.error('Guru ini sudah mengajar mapel tersebut di kelas ini');
        return;
      }
  

      await guruMapelApi.create({
        id_kelas: selectedKelas.id,
        id_guru: parseInt(formData.id_guru),
        id_mapel: parseInt(formData.id_mapel),
      });

      toast.success('Pengajar berhasil ditambahkan');
      
      const newAssignments = await guruMapelApi.getAll();
      setAllAssignments(newAssignments);
      
      setFormData({ id_guru: '', id_mapel: '' });
    } catch (error) {
       console.error(error);
       toast.error('Gagal menambah pengajar');
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deleteId) return;
    try {
      await guruMapelApi.delete(deleteId);
      toast.success('Pengajar berhasil dihapus');
      
      const newAssignments = await guruMapelApi.getAll();
      setAllAssignments(newAssignments);
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus pengajar');
    } finally {
      setDeleteId(null);
    }
  };

  const guruOptions = useMemo(() => 
    guru.map(g => ({ label: `${g.nama} (${g.nip})`, value: g.id.toString() })), 
  [guru]);

  const mapelOptions = useMemo(() => 
    mapel.map(m => ({ label: m.mata_pelajaran, value: m.id.toString() })), 
  [mapel]);


  const columns: ColumnDef<Kelas>[] = [
    {
      accessorKey: 'nama_kelas',
      header: 'Nama Kelas',
      cell: ({ row }) => (
        <span className="font-semibold text-base">{row.original.nama_kelas}</span>
      )
    },
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
      cell: ({ row }) => row.original.wali_kelas?.nama || <span className="text-muted-foreground italic">Belum ditentukan</span>,
    },
    {
        id: 'guru_count',
        header: 'Status Pengajar',
        cell: ({ row }) => {
            const classAssignments = allAssignments.filter(a => a.id_kelas === row.original.id);
            const assignedMapelIds = new Set(classAssignments.map(a => a.id_mapel));
            const missingMapels = mapel.filter(m => !assignedMapelIds.has(m.id));
            const isComplete = missingMapels.length === 0 && mapel.length > 0;

            return (
               <div className="flex items-center gap-2">
                   {isComplete ? (
                       <Badge variant="outline" className="border-success text-success">
                           Lengkap
                       </Badge>
                   ) : mapel.length === 0 ? (
                       <Badge variant="secondary">No Mapel</Badge>
                   ) : (
                       <TooltipProvider>
                           <Tooltip>
                               <TooltipTrigger asChild>
                                   <Badge variant="secondary" className="cursor-help border-warning text-warning bg-warning/10">
                                       {missingMapels.length} Mapel Kosong
                                   </Badge>
                               </TooltipTrigger>
                               <TooltipContent>
                                   <p className="font-semibold mb-1">Belum ada pengajar untuk:</p>
                                   <ul className="list-disc pl-4 text-xs">
                                       {missingMapels.slice(0, 5).map(m => (
                                           <li key={m.id}>{m.mata_pelajaran}</li>
                                       ))}
                                       {missingMapels.length > 5 && <li>...dan {missingMapels.length - 5} lainnya</li>}
                                   </ul>
                               </TooltipContent>
                           </Tooltip>
                       </TooltipProvider>
                   )}
               </div>
            );
        }
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <Button size="sm" onClick={() => handleOpenManage(row.original)} className="gap-2">
          <BookOpen className="w-4 h-4" />
          Kelola Pengajar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plotting Guru Mata Pelajaran"
        description="Atur guru pengajar untuk setiap kelas"
      />

      <DataTable
        data={kelas}
        columns={columns}
        searchKey="nama_kelas"
      />


      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
         <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="text-xl">
                    Guru Pengajar - Kelas {selectedKelas?.nama_kelas}
                </DialogTitle>
            </DialogHeader>

 
            <div className="bg-muted/30 p-4 rounded-lg space-y-4 border">
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Tambah Pengajar
                </h4>
                <form onSubmit={handleAddAssignment} className="flex flex-col sm:flex-row gap-4 items-end">
                     <div className="flex-1 space-y-2 w-full">
                        <Label>Mata Pelajaran</Label>
                        <Combobox 
                            options={mapelOptions}
                            value={formData.id_mapel}
                            onChange={(v) => setFormData(prev => ({...prev, id_mapel: v}))}
                            placeholder="Pilih Mapel..."
                            searchPlaceholder="Cari mapel..."
                            modal
                        />
                     </div>
                     <div className="flex-1 space-y-2 w-full">
                        <Label>Guru Pengampu</Label>
                        <Combobox 
                            options={guruOptions}
                            value={formData.id_guru}
                            onChange={(v) => setFormData(prev => ({...prev, id_guru: v}))}
                            placeholder="Pilih Guru..."
                            searchPlaceholder="Cari guru..."
                            modal
                        />
                     </div>
                     <Button type="submit">Tambah</Button>
                </form>
            </div>

        
            <div className="flex-1 overflow-auto border rounded-md mt-4">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[250px]">Mata Pelajaran</TableHead>
                            <TableHead>Guru Pengampu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mapel.map((m) => {
                            const assignments = currentClassAssignments.filter(a => a.id_mapel === m.id);
                            return (
                                <TableRow key={m.id}>
                                    <TableCell className="font-medium py-3 align-top">{m.mata_pelajaran}</TableCell>
                                    <TableCell className="py-2">
                                        {assignments.length > 0 ? (
                                            <div className="space-y-2">
                                                {assignments.map((asg) => (
                                                    <div key={asg.id} className="flex items-center justify-between p-2 rounded-md border bg-card/50 hover:bg-accent/40 transition-colors group">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-medium text-sm">{asg.guru?.nama}</span>
                                                            <span className="text-xs text-muted-foreground font-mono">NIP. {asg.guru?.nip}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                                                            onClick={() => setDeleteId(asg.id)}
                                                            title="Hapus Pengajar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-destructive/80 italic text-sm p-2 border border-dashed rounded-md bg-destructive/5">
                                                <AlertTriangle className="w-4 h-4" />
                                                Belum ada pengajar
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
         </DialogContent>
      </Dialog>


      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengajar?</AlertDialogTitle>
            <AlertDialogDescription>
              Hapus penugasan mengajar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssignment} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default AssignGuru;
