import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Kelas, AuthState } from '@/lib/types';
import { authApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType extends AuthState {
  login: (nip: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [kelasWali, setKelasWali] = useState<Kelas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
      
        const token = localStorage.getItem('auth_token');
        if (token) {
          const currentUser = await authApi.fetchCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);

        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (nip: string, password: string) => {
    const result = await authApi.login(nip, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setKelasWali(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        kelasWali,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
