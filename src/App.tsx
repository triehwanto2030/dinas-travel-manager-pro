
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Karyawan from "./pages/Karyawan";
import ManajemenKaryawan from "./pages/ManajemenKaryawan";
import LineApproval from "./pages/LineApproval";
import PerjalananDinas from "./pages/PerjalananDinas";
import ClaimDinas from "./pages/ClaimDinas";
import ApprovalPerjalananDinas from "./pages/ApprovalPerjalananDinas";
import ApprovalClaimDinas from "./pages/ApprovalClaimDinas";
import ManajemenUser from "./pages/ManajemenUser";
import RoleManajemen from "./pages/RoleManajemen";
import PengaturanAplikasi from "./pages/PengaturanAplikasi";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/perjalanan-dinas" element={<ProtectedRoute><PerjalananDinas /></ProtectedRoute>} />
              <Route path="/approval-perjalanan-dinas" element={<ProtectedRoute><ApprovalPerjalananDinas /></ProtectedRoute>} />
              <Route path="/claim-dinas" element={<ProtectedRoute><ClaimDinas /></ProtectedRoute>} />
              <Route path="/approval-claim-dinas" element={<ProtectedRoute><ApprovalClaimDinas /></ProtectedRoute>} />
              <Route path="/karyawan" element={<ProtectedRoute><Karyawan /></ProtectedRoute>} />
              <Route path="/manajemen-karyawan" element={<ProtectedRoute><ManajemenKaryawan /></ProtectedRoute>} />
              <Route path="/approval" element={<ProtectedRoute><LineApproval /></ProtectedRoute>} />
              <Route path="/manajemen-user" element={<ProtectedRoute><ManajemenUser /></ProtectedRoute>} />
              <Route path="/role-manajemen" element={<ProtectedRoute><RoleManajemen /></ProtectedRoute>} />
              <Route path="/pengaturan-aplikasi" element={<ProtectedRoute><PengaturanAplikasi /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
