
import React, { useState } from 'react';
import { Plane, FileText, Users, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import TripCard from '@/components/TripCard';
import BudgetOverview from '@/components/BudgetOverview';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    {
      title: 'Total Perjalanan Dinas',
      value: '11',
      change: '+12% dari bulan lalu',
      changeType: 'increase' as const,
      icon: Plane,
      iconColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Claim Pending',
      value: '1',
      change: '-5% dari bulan lalu',
      changeType: 'decrease' as const,
      icon: FileText,
      iconColor: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      title: 'Karyawan Aktif',
      value: '11',
      change: '+3% dari bulan lalu',
      changeType: 'increase' as const,
      icon: Users,
      iconColor: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Budget Terpakai',
      value: '67%',
      change: '+8% dari bulan lalu',
      changeType: 'increase' as const,
      icon: TrendingUp,
      iconColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ];

  const recentTrips = [
    {
      name: 'Lisa Anderson',
      destination: 'malang',
      date: '2025-07-06',
      amount: 'Rp 1.500.000',
      status: 'approved' as const
    },
    {
      name: 'Lisa Anderson',
      destination: 'malang',
      date: '2025-07-06',
      amount: 'Rp 1.500.000',
      status: 'approved' as const
    },
    {
      name: 'Jesika',
      destination: 'jkt',
      date: '2025-07-04',
      amount: 'Rp 2.000.000',
      status: 'approved' as const
    },
    {
      name: 'Jesika',
      destination: 'jkt',
      date: '2025-07-04',
      amount: 'Rp 2.000.000',
      status: 'submitted' as const
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 lg:ml-64">
          <main className="p-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-8 mb-8 text-white">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Trips */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    ✈️ Perjalanan Dinas Terbaru
                  </h3>
                  <div className="space-y-4">
                    {recentTrips.map((trip, index) => (
                      <TripCard key={index} {...trip} />
                    ))}
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
