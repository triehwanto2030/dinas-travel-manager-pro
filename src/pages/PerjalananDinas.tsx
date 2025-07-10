
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Download, Upload, Receipt } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import PerjalananDinasForm from '@/components/PerjalananDinasForm';
import ClaimDinasForm from '@/components/ClaimDinasForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useBusinessTrips } from '@/hooks/useBusinessTrips';

const PerjalananDinas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [claimFormOpen, setClaimFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedData, setSelectedData] = useState<any>(null);

  const { data: businessTrips, isLoading } = useBusinessTrips();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Draft': { class: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'Submitted': { class: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
      'Approved': { class: 'bg-green-100 text-green-800', label: 'Approved' },
      'Rejected': { class: 'bg-red-100 text-red-800', label: 'Rejected' },
      'Completed': { class: 'bg-blue-100 text-blue-800', label: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Draft;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddNew = () => {
    setFormMode('create');
    setSelectedData(null);
    setFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setFormMode('edit');
    setSelectedData(item);
    setFormOpen(true);
  };

  const handleView = (item: any) => {
    setFormMode('view');
    setSelectedData(item);
    setFormOpen(true);
  };

  const handleClaim = (item: any) => {
    setSelectedData(item);
    setClaimFormOpen(true);
  };

  // Filter business trips based on search term
  const filteredTrips = businessTrips?.filter(trip => 
    trip.employees.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Perjalanan Dinas</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola perjalanan dinas karyawan</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import Excel
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Excel
                  </Button>
                  <Button 
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Perjalanan Dinas
                  </Button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daftar Perjalanan Dinas
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
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Tujuan</TableHead>
                        <TableHead>Keperluan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrips.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.employees.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.employees.id}</p>
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
                              <p className="text-sm text-gray-900 dark:text-white">{item.start_date}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">s/d {item.end_date}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {item.estimated_budget ? formatCurrency(item.estimated_budget) : '-'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-2"
                                onClick={() => handleView(item)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-2"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {item.status === 'Approved' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-2 text-green-600 hover:text-green-800"
                                  onClick={() => handleClaim(item)}
                                  title="Claim Dinas"
                                >
                                  <Receipt className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredTrips.length === 0 && !isLoading && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data perjalanan dinas'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
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

      {/* Form Modal */}
      <PerjalananDinasForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        mode={formMode}
        data={selectedData}
      />

      {/* Claim Form Modal */}
      <ClaimDinasForm
        isOpen={claimFormOpen}
        onClose={() => setClaimFormOpen(false)}
        tripData={selectedData}
      />
    </div>
  );
};

export default PerjalananDinas;
