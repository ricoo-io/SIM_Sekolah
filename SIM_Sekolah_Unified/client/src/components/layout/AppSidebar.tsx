import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  ClipboardList,
  FileText,
  LogOut,
  UserCog,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ('admin' | 'guru')[];
  waliKelasOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Data Siswa', href: '/siswa', icon: <GraduationCap className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Data Guru', href: '/guru', icon: <Users className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Data Kelas', href: '/kelas', icon: <School className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Mata Pelajaran', href: '/mapel', icon: <BookOpen className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Assign Guru', href: '/assign-guru', icon: <UserCog className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Input Nilai', href: '/nilai', icon: <ClipboardList className="w-5 h-5" />, roles: ['guru'] },
  { label: 'Wali Kelas', href: '/wali-kelas', icon: <FileText className="w-5 h-5" />, roles: ['guru'], waliKelasOnly: true },
];

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, kelasWali, logout } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(item => {
    if (item.roles && !item.roles.includes(user?.role || 'guru')) return false;
    if (item.waliKelasOnly && !user?.wali_kelas) return false;
    return true;
  });

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 h-screen gradient-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center ">
              <img src="public/Logo_Jaya_Ikan.png" className="h-10 w-10 object-cover rounded-xl" alt="Logo"/>
            </div>
            <div>
              <h1 className="font-bold text-sm text-sidebar-accent-foreground">SMP JAYA IKAN</h1>
              <p className="text-xs text-sidebar-foreground/60">Sistem Informasi</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-primary">
                {user?.nama.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                {user?.nama}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {user?.role}
                {user?.wali_kelas && kelasWali && ` • Wali Kelas ${kelasWali.nama_kelas}`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
              {location.pathname === item.href && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
