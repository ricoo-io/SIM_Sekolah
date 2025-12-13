import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Siswa from "./pages/Admin/Siswa";
import Guru from "./pages/Admin/Guru";
import Kelas from "./pages/Admin/Kelas";
import Mapel from "./pages/Admin/Mapel";
import AssignGuru from "./pages/Admin/AssignGuru";
import Nilai from "./pages/Guru/Nilai";
import WaliKelas from "./pages/Guru/WaliKelas";
import DetailSiswa from "./pages/Guru/DetailSiswa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/siswa" element={<Siswa />} />
              <Route path="/guru" element={<Guru />} />
              <Route path="/kelas" element={<Kelas />} />
              <Route path="/mapel" element={<Mapel />} />
              <Route path="/assign-guru" element={<AssignGuru />} />
              <Route path="/nilai" element={<Nilai />} />
              <Route path="/wali-kelas" element={<WaliKelas />} />
              <Route path="/guru/siswa/:id" element={<DetailSiswa />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
