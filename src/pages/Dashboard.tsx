import React, { useState } from 'react';
import { Plane, FileText, Users, TrendingUp, ClipboardCheck } from 'lucide-react';
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
      iconColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: isAdmin ? 'Total Claim' : 'Total Claim Saya',
      value: statsLoading ? '-' : String(dashboardStats?.totalClaims || 0),
      change: isAdmin ? 'Semua claim' : 'Claim perjalanan Anda',
      changeType: 'increase' as const,
      icon: FileText,
      iconColor: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Claim Pending',
      value: statsLoading ? '-' : String(dashboardStats?.pendingClaims || 0),
      change: isAdmin ? 'Menunggu persetujuan' : 'Claim Anda menunggu',
      changeType: dashboardStats?.pendingClaims && dashboardStats.pendingClaims > 0 ? 'increase' as const : 'decrease' as const,
      icon: ClipboardCheck,
      iconColor: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      title: 'Budget Terpakai',
      value: statsLoading ? '-' : `${dashboardStats?.budgetUsed || 0}%`,
      change: isAdmin ? 'Dari budget bulanan' : 'Budget perjalanan Anda',
      changeType: (dashboardStats?.budgetUsed || 0) > 80 ? 'increase' as const : 'decrease' as const,
      icon: TrendingUp,
      iconColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
      <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Recent Trips */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                ✈️ {isAdmin ? 'Perjalanan Dinas Terbaru' : 'Perjalanan Dinas Saya'}
              </h3>
              <div className="space-y-4">
                {tripsLoading ? (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                ) : recentTrips && recentTrips.length > 0 ? (
                  recentTrips.map((trip, index) => (
                    <TripCard key={trip.id || index} {...trip} />
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Belum ada perjalanan dinas
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div>
            <BudgetOverview />
          </div>
        </div>
      </MainLayout>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
};

export default Dashboard;
