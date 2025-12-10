

export type UserRole = 'admin' | 'guru';
export type Tingkat = '7' | '8' | '9';
export type Semester = 'ganjil' | 'genap';

export interface User {
  id: number;
  nama: string;
  nip: string;
  password?: string;
  role: UserRole;
  wali_kelas: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Kelas {
  id: number;
  id_guru: number | null;
  nama_kelas: string;
  tingkat: Tingkat;
  wali_kelas?: User;
  jumlah_siswa?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Siswa {
  id: number;
  nis: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  alamat: string;
  ibu: string;
  ayah: string;
  wali: string;
  kontak_wali: string;
  id_kelas: number;
  kelas?: Kelas;
  created_at?: string;
  updated_at?: string;
}

export interface MataPelajaran {
  id: number;
  mata_pelajaran: string;
  kkm: number;
  created_at?: string;
  updated_at?: string;
}

export interface GuruMataPelajaran {
  id: number;
  id_guru: number;
  id_mapel: number;
  id_kelas: number;
  guru?: User;
  mapel?: MataPelajaran;
  kelas?: Kelas;
  created_at?: string;
  updated_at?: string;
}

export interface Penilaian {
  id: number;
  id_siswa: number;
  id_mapel: number;
  id_guru: number;
  semester: Semester;
  nilai_harian_1: number | null;
  nilai_harian_2: number | null;
  nilai_harian_3: number | null;
  nilai_UTS: number | null;
  nilai_harian_4: number | null;
  nilai_harian_5: number | null;
  nilai_harian_6: number | null;
  nilai_UAS: number | null;
  nilai_Akhir: number | null;
  update_terakhir?: string;
  siswa?: Siswa;
  mapel?: MataPelajaran;
  created_at?: string;
  updated_at?: string;
}

export interface Rapot {
  id: number;
  id_siswa: number;
  tahun_ajaran: string;
  semester: Semester;
  sakit: number;
  izin: number;
  alpha: number;
  catatan_wali_kelas: string;
  siswa?: Siswa;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  kelasWali?: Kelas | null;
}
