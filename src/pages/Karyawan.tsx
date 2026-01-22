
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Download, ArrowUpDown } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import KaryawanForm from '@/components/KaryawanForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, EmployeeFormData } from '@/hooks/useEmployees';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';

const Karyawan = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formState, setFormState] = useState({
    isOpen: false,
    mode: 'add' as 'add' | 'edit' | 'view',
    selectedData: null as any
  });

  const { data: employees = [], isLoading } = useEmployees();
  const { data: companies = [] } = useCompanies();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();

  const stats = [
    { title: 'Total Karyawan', value: employees.length.toString(), color: 'bg-blue-500' },
    { title: 'Karyawan Aktif', value: employees.length.toString(), color: 'bg-green-500' },
    { title: 'Departemen', value: '5', color: 'bg-purple-500' },
    { title: 'Bergabung Bulan Ini', value: '1', color: 'bg-orange-500' }
  ];

  const openForm = (mode: 'add' | 'edit' | 'view', data?: any) => {
    setFormState({
      isOpen: true,
      mode,
      selectedData: data
    });
  };

  const closeForm = () => {
    setFormState({
      isOpen: false,
      mode: 'add',
      selectedData: null
    });
  };

  const handleFormSubmit = async (formData: EmployeeFormData) => {
    try {
      console.log('Form submission data:', formData);
      
      if (formState.mode === 'add') {
        console.log('Creating employee with form data:', formData);
        await createEmployee.mutateAsync(formData);

        toast({
          title: "Berhasil!",
          description: "Karyawan berhasil ditambahkan",
        });
      } else if (formState.mode === 'edit') {
        console.log('Updating employee with form data:', formData);
        await updateEmployee.mutateAsync({ id: formState.selectedData.id, ...formData });

        toast({
          title: "Berhasil!",
          description: "Data karyawan berhasil diperbarui",
        });
      }
      closeForm();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (employee: any) => {
    Swal.fire({
      title: 'Hapus Karyawan?',
      text: `Apakah Anda yakin ingin menghapus ${employee.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteEmployee.mutateAsync(employee.id);
          toast({
            title: "Terhapus!",
            description: "Karyawan berhasil dihapus",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Terjadi kesalahan saat menghapus data",
            variant: "destructive",
          });
        }
      }
    });
  };

  const filteredData = employees.filter(karyawan => {
    const matchesSearch = karyawan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         karyawan.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (karyawan.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesDepartment = !departmentFilter || karyawan.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Master Karyawan</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola data karyawan perusahaan</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button 
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => openForm('add')}
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Karyawan
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <Card key={index} className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                          <ArrowUpDown className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Table Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daftar Karyawan
                </CardTitle>
                
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari karyawan..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="">Departemen</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="IT">IT</option>
                    <option value="Operations">Operations</option>
                  </select>
                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </CardHeader>
              
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead>Perusahaan</TableHead>
                      <TableHead>Atasan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal Bergabung</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((karyawan) => (
                      <TableRow key={karyawan.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={karyawan.photo_url || undefined} />
                              <AvatarFallback className="bg-blue-500 text-white font-medium">
                                {karyawan.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{karyawan.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{karyawan.employee_id} ({karyawan.grade})</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{karyawan.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{karyawan.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{karyawan.position}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{karyawan.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-900 dark:text-white">{karyawan.companies.name}</p>
                        </TableCell>
                        <TableCell>
                          {karyawan.supervisor_id ? (
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {employees.find(emp => emp.id === karyawan.supervisor_id)?.name || 'Tidak ditemukan'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {employees.find(emp => emp.id === karyawan.supervisor_id)?.position || ''}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada atasan</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="default"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          >
                            Aktif
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {new Date(karyawan.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2"
                              onClick={() => openForm('view', {
                                ...karyawan,
                                namaPerusahaan: karyawan.companies.name
                              })}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2"
                              onClick={() => openForm('edit', {
                                ...karyawan,
                                namaPerusahaan: karyawan.companies.name
                              })}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(karyawan)}
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Form Modal */}
      <KaryawanForm
        isOpen={formState.isOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        initialData={formState.selectedData}
        mode={formState.mode}
      />
    </div>
  );
};

export default Karyawan;
