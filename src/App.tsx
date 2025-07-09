
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Dashboard from "./pages/Dashboard";
import Karyawan from "./pages/Karyawan";
import LineApproval from "./pages/LineApproval";
import PerjalananDinas from "./pages/PerjalananDinas";
import ClaimDinas from "./pages/ClaimDinas";
import ApprovalPerjalananDinas from "./pages/ApprovalPerjalananDinas";
import ApprovalClaimDinas from "./pages/ApprovalClaimDinas";
import ManajemenUser from "./pages/ManajemenUser";
import RoleManajemen from "./pages/RoleManajemen";
import PengaturanAplikasi from "./pages/PengaturanAplikasi";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/perjalanan-dinas" element={<PerjalananDinas />} />
            <Route path="/approval-perjalanan-dinas" element={<ApprovalPerjalananDinas />} />
            <Route path="/claim-dinas" element={<ClaimDinas />} />
            <Route path="/approval-claim-dinas" element={<ApprovalClaimDinas />} />
            <Route path="/karyawan" element={<Karyawan />} />
            <Route path="/approval" element={<LineApproval />} />
            <Route path="/manajemen-user" element={<ManajemenUser />} />
            <Route path="/role-manajemen" element={<RoleManajemen />} />
            <Route path="/pengaturan-aplikasi" element={<PengaturanAplikasi />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
