import React, { useState } from 'react';
import { Plane, FileText, Users, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import TripCard from '@/components/TripCard';
import BudgetOverview from '@/components/BudgetOverview';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Swal from 'sweetalert2';
import { useDashboardStats, useRecentTrips } from '@/hooks/useDashboardStats';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentTrips, isLoading: tripsLoading } = useRecentTrips();

  const stats = [
    {
      title: 'Total Perjalanan Dinas',
      value: statsLoading ? '-' : String(dashboardStats?.totalTrips || 0),
      change: 'Data real-time',
      changeType: 'increase' as const,
      icon: Plane,
      iconColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Claim Pending',
      value: statsLoading ? '-' : String(dashboardStats?.pendingClaims || 0),
      change: 'Menunggu persetujuan',
      changeType: dashboardStats?.pendingClaims && dashboardStats.pendingClaims > 0 ? 'increase' as const : 'decrease' as const,
      icon: FileText,
      iconColor: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      title: 'Karyawan Aktif',
      value: statsLoading ? '-' : String(dashboardStats?.activeEmployees || 0),
      change: 'Total karyawan terdaftar',
      changeType: 'increase' as const,
      icon: Users,
      iconColor: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Budget Terpakai',
      value: statsLoading ? '-' : `${dashboardStats?.budgetUsed || 0}%`,
      change: 'Dari budget bulanan',
      changeType: (dashboardStats?.budgetUsed || 0) > 80 ? 'increase' as const : 'decrease' as const,
      icon: TrendingUp,
      iconColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ];

  const showWelcomeMessage = () => {
    Swal.fire({
      title: 'Selamat Datang di Travel Pro!',
      text: 'Kelola perjalanan dinas perusahaan dengan mudah dan efisien',
      icon: 'success',
      confirmButtonText: 'Mulai Sekarang',
      confirmButtonColor: '#3b82f6'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
      <Header />
      
      <div className="flex w-full">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 w-full">
          <main className="p-6 w-full">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-8 mb-8 text-white w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Selamat Datang di Travel Pro</h1>
                  <p className="text-blue-100 mb-4">Kelola perjalanan dinas perusahaan dengan mudah dan efisien</p>
                  <Button 
                    onClick={showWelcomeMessage}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Mulai Sekarang
                  </Button>
                </div>
                <div className="hidden md:block">
                  <div className="text-6xl">✈️</div>
                </div>
              </div>
            </div>

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
                    ✈️ Perjalanan Dinas Terbaru
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
          </main>
          
          <Footer />
        </div>
      </div>

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
