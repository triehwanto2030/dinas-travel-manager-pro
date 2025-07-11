
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Calendar, MapPin, User, Building } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PerjalananDinasForm from '@/components/PerjalananDinasForm';
import { useBusinessTrips, useDeleteBusinessTrip } from '@/hooks/useBusinessTrips';
import Swal from 'sweetalert2';

const PerjalananDinas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const { data: businessTrips, isLoading, error } = useBusinessTrips();
  const deleteBusinessTrip = useDeleteBusinessTrip();

  console.log('Business trips data:', businessTrips);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Draft': { class: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'Submitted': { class: 'bg-yellow-100 text-yellow-800', label: 'Menunggu Supervisor' },
      'Supervisor Approved': { class: 'bg-blue-100 text-blue-800', label: 'Menunggu HR Manager' },
      'HR Manager Approved': { class: 'bg-purple-100 text-purple-800', label: 'Menunggu Staff FA' },
      'Approved': { class: 'bg-green-100 text-green-800', label: 'Approved' },
      'Rejected': { class: 'bg-red-100 text-red-800', label: 'Rejected' },
      'Completed': { class: 'bg-blue-100 text-blue-800', label: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Draft;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const handleView = (item: any) => {
    console.log('View item:', item);
    Swal.fire({
      title: 'Detail Perjalanan Dinas',
      html: `
        <div class="text-left space-y-2">
          <p><strong>Karyawan:</strong> ${item.employees?.name}</p>
          <p><strong>Tujuan:</strong> ${item.destination}</p>
          <p><strong>Tujuan:</strong> ${item.purpose}</p>
          <p><strong>Tanggal:</strong> ${new Date(item.start_date).toLocaleDateString('id-ID')} - ${new Date(item.end_date).toLocaleDateString('id-ID')}</p>
          <p><strong>Cash Advance:</strong> ${item.estimated_budget ? formatCurrency(item.estimated_budget) : '-'}</p>
          <p><strong>Status:</strong> ${item.status}</p>
        </div>
      `,
      confirmButtonText: 'Tutup'
    });
  };

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
    setEditingTrip(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: any) => {
    const result = await Swal.fire({
      title: 'Hapus Perjalanan Dinas?',
      text: `Apakah Anda yakin ingin menghapus perjalanan dinas ke ${item.destination}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        console.log('Deleting trip:', item.id);
        await deleteBusinessTrip.mutateAsync(item.id);
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Perjalanan dinas telah dihapus',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting trip:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus perjalanan dinas',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // Filter business trips - only show approved, rejected, or completed
  const filteredTrips = businessTrips?.filter(trip => {
    if (!trip.employees) return false;
    
    // Only show final status trips (not in approval process)
    const finalStatuses = ['Approved', 'Rejected', 'Completed'];
    if (!finalStatuses.includes(trip.status)) return false;
    
    const matchesSearch = trip.employees.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || trip.employees.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  }) || [];

  // Get unique departments for filter
  const departments = [...new Set(
    businessTrips?.map(trip => trip.employees?.department).filter(dept => dept && dept.trim() !== '') || []
  )];

  // Calculate stats
  const approvedCount = businessTrips?.filter(trip => trip.status === 'Approved').length || 0;
  const rejectedCount = businessTrips?.filter(trip => trip.status === 'Rejected').length || 0;
  const completedCount = businessTrips?.filter(trip => trip.status === 'Completed').length || 0;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex w-full">
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div className="flex-1 w-full">
            <main className="p-6 w-full">
              <div className="text-center py-8">
                <p className="text-red-600">Error loading data: {error.message}</p>
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
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex w-full">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="flex-1 w-full">
          <main className="p-6 w-full">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Perjalanan Dinas</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola data perjalanan dinas karyawan</p>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingTrip(null);
                        setIsDialogOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Perjalanan Dinas
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTrip ? 'Edit Perjalanan Dinas' : 'Tambah Perjalanan Dinas Baru'}
                      </DialogTitle>
                    </DialogHeader>
                    <PerjalananDinasForm 
                      isOpen={isDialogOpen}
                      onClose={() => setIsDialogOpen(false)}
                      mode={editingTrip ? 'edit' : 'create'}
                      data={editingTrip}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disetujui</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ditolak</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{rejectedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selesai</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daftar Perjalanan Dinas
                </CardTitle>
                
                <div className="flex flex-col md:flex-row gap-4 mt-4">
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
                      <SelectItem value="Approved">Disetujui</SelectItem>
                      <SelectItem value="Rejected">Ditolak</SelectItem>
                      <SelectItem value="Completed">Selesai</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Department Filter */}
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
                        <TableHead>ID Perjalanan</TableHead>
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Jabatan</TableHead>
                        <TableHead>Tujuan</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cash Advance</TableHead>
                        <TableHead>AKSI</TableHead>
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
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={item.employees?.avatar_url || ''} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  {item.employees?.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{item.employees?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {item.employees?.id || 'N/A'} 
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">
                                    {item.employees?.grade || 'N/A'}
                                  </span>
                                </p>
                              </div>
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
                            {item.estimated_budget ? formatCurrency(item.estimated_budget) : '-'}
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
                                disabled={deleteBusinessTrip.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredTrips.length === 0 && !isLoading && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                              ? 'Tidak ada data yang sesuai dengan filter'
                              : 'Tidak ada perjalanan dinas yang menunggu approval'
                            }
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
    </div>
  );
};

export default PerjalananDinas;
