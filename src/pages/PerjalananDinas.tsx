
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessTrips, useUpdateBusinessTrip, useDeleteBusinessTrip } from '@/hooks/useBusinessTrips';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import UserAvatarCell from '@/components/AvatarCell';

const PerjalananDinas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [claimFormOpen, setClaimFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedData, setSelectedData] = useState<any>(null);

  const { data: businessTrips, isLoading, error } = useBusinessTrips();
  const updateBusinessTrip = useUpdateBusinessTrip();
  const deleteBusinessTrip = useDeleteBusinessTrip();
  const { toast } = useToast();

  console.log('Business trips data in PerjalananDinas:', businessTrips);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

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

  const generateTripId = (date: string, index: number) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const sequence = String(index + 1).padStart(2, '0');
    return `PD${year}${month}${day}${sequence}`;
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
    if (item.status !== 'Approved') {
      toast({
        title: "Tidak dapat claim",
        description: "Perjalanan dinas harus berstatus 'Approved' untuk dapat di-claim",
        variant: "destructive",
      });
      return;
    }
    console.log('Opening claim form for trip:', item);
    setSelectedData(item);
    setClaimFormOpen(true);
  };

  const handleDelete = async (item: any) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus perjalanan dinas ini?')) {
      try {
        await deleteBusinessTrip.mutateAsync(item.id);
        toast({
          title: "Berhasil!",
          description: "Perjalanan dinas berhasil dihapus",
        });
      } catch (error) {
        toast({
          title: "Error!",
          description: "Gagal menghapus perjalanan dinas",
          variant: "destructive",
        });
      }
    }
  };

  // Filter business trips based on search term, status, and department
  const filteredTrips = businessTrips?.filter(trip => {
    if (!trip.employees) return false;
    
    const matchesSearch = trip.employees.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || trip.employees.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  }) || [];

  // Get unique departments for filter - filter out empty/null values
  const departments = [...new Set(
    businessTrips?.map(trip => trip.employees?.department).filter(dept => dept && dept.trim() !== '') || []
  )];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
        <Header />
        <div className="flex w-full">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 w-full">
            <main className="p-6 w-full">
              <div className="text-center py-8">
                <p className="text-red-600">Error loading data: {error.message}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Refresh Page
                </Button>
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
        <Header />
        <div className="flex w-full">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 w-full">
            <main className="p-6 w-full">
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
      <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Daftar Perjalanan Dinas</h1>
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
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
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
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Department Filter */}
              {departments.length > 0 && (
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Departemen</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Perjalanan</TableHead>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cash Advance</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {generateTripId(item.created_at, index)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <UserAvatarCell employeeUsed={item.employees} classname="w-8 h-8">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.employees?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.employees?.employee_id || 'N/A'} 
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">
                                {item.employees?.grade || 'N/A'}
                              </span>
                            </p>
                          </div>
                        </UserAvatarCell>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.employees?.position || 'N/A'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.employees?.department || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.destination}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.purpose}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(item.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          s/d {new Date(item.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {item.cash_advance ? formatCurrency(item.cash_advance) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2"
                          onClick={() => handleView(item)}
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {/* {item.status === 'Submitted' && ( */}
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(item)}
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        {/* )} */}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTrips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' 
                        ? 'Tidak ada data yang sesuai dengan filter'
                        : 'Belum ada data perjalanan dinas'
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
