
import apiClient from './axios';
import { TOKEN_KEY } from './config';
import { User, Kelas, Siswa, MataPelajaran, GuruMataPelajaran, Penilaian, Rapot } from './types';

// AUTH API
export const authApi = {
  login: async (nip: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await apiClient.post('/login', { nip, password });
      const { user, token } = response.data;
      
      localStorage.setItem(TOKEN_KEY, token);
      
      return { success: true, user };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'NIP atau password salah' 
      };
    }
  },
  
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  
  getCurrentUser: (): User | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    
    return null;
  },

  fetchCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/user');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

// API User
export const usersApi = {
  getAll: async (): Promise<User[]> =>  {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  getGuru: async (): Promise<User[]> => {
    const response = await apiClient.get('/users-guru');
    return response.data;
  },
  
  create: async (user: Omit<User, 'id'>): Promise<User> => {
    const response = await apiClient.post('/users', user);
    return response.data;
  },
  
  update: async (id: number, data: Partial<User>): Promise<User | null> => {
    try {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  delete: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/users/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// KELAS API
export const kelasApi = {
  getAll: async (): Promise<Kelas[]> => {
    const response = await apiClient.get('/kelas');
    return response.data;
  },
  
  create: async (kelas: Omit<Kelas, 'id'>): Promise<Kelas> => {
    const response = await apiClient.post('/kelas', kelas);
    return response.data;
  },
  
  update: async (id: number, data: Partial<Kelas>): Promise<Kelas | null> => {
    try {
      const response = await apiClient.put(`/kelas/${id}`, data);
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  delete: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/kelas/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// SISWA API
export const siswaApi = {
  getAll: async (): Promise<Siswa[]> => {
    const response = await apiClient.get('/siswa');
    return response.data;
  },
  
  getByKelas: async (kelasId: number): Promise<Siswa[]> => {
    const response = await apiClient.get(`/siswa?kelas=${kelasId}`);
    return response.data;
  },

  getById: async (id: number): Promise<Siswa> => {
    const response = await apiClient.get(`/siswa/${id}`);
    return response.data;
  },
  
  create: async (siswa: Omit<Siswa, 'id'>): Promise<Siswa> => {
    const response = await apiClient.post('/siswa', siswa);
    return response.data;
  },
  
  update: async (id: number, data: Partial<Siswa>): Promise<Siswa | null> => {
    try {
      const response = await apiClient.put(`/siswa/${id}`, data);
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  delete: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/siswa/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// MATA PELAJARAN API
export const mapelApi = {
  getAll: async (): Promise<MataPelajaran[]> => {
    const response = await apiClient.get('/mapel');
    return response.data;
  },
  
  create: async (mapel: Omit<MataPelajaran, 'id'>): Promise<MataPelajaran> => {
    const response = await apiClient.post('/mapel', mapel);
    return response.data;
  },
  
  update: async (id: number, data: Partial<MataPelajaran>): Promise<MataPelajaran | null> => {
    try {
      const response = await apiClient.put(`/mapel/${id}`, data);
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  delete: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/mapel/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// GURU MATA PELAJARAN API
export const guruMapelApi = {
  getAll: async (): Promise<GuruMataPelajaran[]> => {
    const response = await apiClient.get('/guru-mapel');
    return response.data;
  },
  
  getByGuru: async (guruId: number): Promise<GuruMataPelajaran[]> => {
    const response = await apiClient.get(`/guru-mapel?guru=${guruId}`);
    return response.data;
  },
  
  create: async (data: Omit<GuruMataPelajaran, 'id'>): Promise<GuruMataPelajaran> => {
    const response = await apiClient.post('/guru-mapel', data);
    return response.data;
  },
  
  delete: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/guru-mapel/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// PENILAIAN API
export const penilaianApi = {
  getAll: async (): Promise<Penilaian[]> => {
    const response = await apiClient.get('/penilaian');
    return response.data;
  },
  
  getByMapelAndKelas: async (mapelId: number, kelasId: number): Promise<Penilaian[]> => {
    const response = await apiClient.get(`/penilaian?mapel=${mapelId}&kelas=${kelasId}`);
    return response.data;
  },
  
  getBySiswa: async (siswaId: number): Promise<Penilaian[]> => {
    const response = await apiClient.get(`/penilaian?siswa=${siswaId}`);
    return response.data;
  },
  
  upsert: async (data: Omit<Penilaian, 'id'>): Promise<Penilaian> => {
    const response = await apiClient.post('/penilaian', data);
    return response.data;
  },
};

// RAPOT API
export const rapotApi = {
  getAll: async (): Promise<Rapot[]> => {
    const response = await apiClient.get('/rapot');
    return response.data;
  },
  
  getBySiswa: async (siswaId: number): Promise<Rapot[]> => {
    const response = await apiClient.get(`/rapot?siswa=${siswaId}`);
    return response.data;
  },
  
  upsert: async (data: Omit<Rapot, 'id'>): Promise<Rapot> => {
    const response = await apiClient.post('/rapot', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Rapot>): Promise<Rapot> => {
    const response = await apiClient.put(`/rapot/${id}`, data);
    return response.data;
  },
};
