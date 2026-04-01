import React, { useState } from 'react';
import { Plane, FileText, TrendingUp, ClipboardCheck } from 'lucide-react';
import StatCard from '@/components/StatCard';
import TripCard from '@/components/TripCard';
import BudgetOverview from '@/components/BudgetOverview';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats, useRecentTrips } from '@/hooks/useDashboardStats';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentTrips, isLoading: tripsLoading } = useRecentTrips();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const stats = [
    {
      title: isAdmin ? 'Total Perjalanan Dinas' : 'Perjalanan Dinas Saya',
      value: statsLoading ? '-' : String(dashboardStats?.totalTrips || 0),
      change: isAdmin ? 'Data real-time' : 'Total pengajuan Anda',
      changeType: 'increase' as const,
      icon: Plane,
      iconColor: 'bg-gradient-to-br from-primary to-primary/70'
    },
    {
      title: isAdmin ? 'Total Claim' : 'Total Claim Saya',
      value: statsLoading ? '-' : String(dashboardStats?.totalClaims || 0),
      change: isAdmin ? 'Semua claim' : 'Claim perjalanan Anda',
      changeType: 'increase' as const,
      icon: FileText,
      iconColor: 'bg-gradient-to-br from-[hsl(142,71%,45%)] to-[hsl(142,60%,35%)]'
    },
    {
      title: 'Claim Pending',
      value: statsLoading ? '-' : String(dashboardStats?.pendingClaims || 0),
      change: isAdmin ? 'Menunggu persetujuan' : 'Claim Anda menunggu',
      changeType: dashboardStats?.pendingClaims && dashboardStats.pendingClaims > 0 ? 'increase' as const : 'decrease' as const,
      icon: ClipboardCheck,
      iconColor: 'bg-gradient-to-br from-[hsl(38,92%,50%)] to-[hsl(25,80%,45%)]'
    },
    {
      title: 'Budget Terpakai',
      value: statsLoading ? '-' : `${dashboardStats?.budgetUsed || 0}%`,
      change: isAdmin ? 'Dari budget bulanan' : 'Budget perjalanan Anda',
      changeType: (dashboardStats?.budgetUsed || 0) > 80 ? 'increase' as const : 'decrease' as const,
      icon: TrendingUp,
      iconColor: 'bg-gradient-to-br from-[hsl(280,70%,50%)] to-[hsl(260,60%,40%)]'
    }
  ];

  return (
    <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {isAdmin ? 'Perjalanan Dinas Terbaru' : 'Perjalanan Dinas Saya'}
            </h3>
            <div className="space-y-3">
              {tripsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
              ) : recentTrips && recentTrips.length > 0 ? (
                recentTrips.map((trip, index) => <TripCard key={trip.id || index} {...trip} />)
              ) : (
                <div className="text-center py-10">
                  <Plane className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Belum ada perjalanan dinas</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <BudgetOverview />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
