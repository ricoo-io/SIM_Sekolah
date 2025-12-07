/**
 * API Service Layer - Laravel Backend Integration
 * 
 * This file contains all API calls to the Laravel backend.
 */

import apiClient from './axios';
import { TOKEN_KEY } from './config';
import { User, Kelas, Siswa, MataPelajaran, GuruMataPelajaran, Penilaian, Rapot } from './types';

// AUTH API
export const authApi = {
  login: async (nip: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await apiClient.post('/login', { nip, password });
      const { user, token } = response.data;
      
      // Store token in localStorage
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
  getAll: async (): Promise<User[]> => {
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