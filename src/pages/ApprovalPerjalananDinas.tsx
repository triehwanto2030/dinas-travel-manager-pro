
import React, { useState } from 'react';
import { Search, Eye, Check, X, Calendar, MapPin, User, Building } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ApprovalPerjalananDinas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock data - akan diganti dengan real data dari Supabase
  const pendingApprovals = [
    {
      id: 1,
      employee: { name: 'John Doe', id: 'EMP001', department: 'Sales' },
      destination: 'Surabaya',
      purpose: 'Client Meeting',
      startDate: '2025-07-10',
      endDate: '2025-07-12',
      budget: 1800000,
      status: 'Submitted',
      submittedAt: '2025-07-08'
    },
    {
      id: 2,
      employee: { name: 'Jane Smith', id: 'EMP002', department: 'Marketing' },
      destination: 'Bandung',
      purpose: 'Product Launch',
      startDate: '2025-07-15',
      endDate: '2025-07-17',
      budget: 2500000,
      status: 'Submitted',
      submittedAt: '2025-07-09'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleApprove = (id: number) => {
    toast({
      title: "Berhasil!",
      description: "Perjalanan dinas telah disetujui",
    });
  };

  const handleReject = (id: number) => {
    toast({
      title: "Berhasil!",
      description: "Perjalanan dinas telah ditolak",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
      <Header />
      
      <div className="flex w-full">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 w-full">
          <main className="p-6 w-full">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Approval Perjalanan Dinas</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola persetujuan perjalanan dinas karyawan</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Menunggu Approval</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disetujui Hari Ini</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ditolak Hari Ini</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daftar Perjalanan Dinas Menunggu Approval
                </CardTitle>
                
                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari perjalanan dinas..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Tujuan</TableHead>
                      <TableHead>Keperluan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Tanggal Pengajuan</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.employee.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.employee.id} • {item.employee.department}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {item.destination}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {item.purpose}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{item.startDate}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">s/d {item.endDate}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.budget)}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {item.submittedAt}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 text-green-600 hover:text-green-800"
                              onClick={() => handleApprove(item.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 text-red-600 hover:text-red-800"
                              onClick={() => handleReject(item.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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

export default ApprovalPerjalananDinas;
