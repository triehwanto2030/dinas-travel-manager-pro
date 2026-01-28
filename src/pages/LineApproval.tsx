
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Download, Upload } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import LineApprovalForm from '@/components/LineApprovalForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLineApprovals, useCreateLineApproval, useUpdateLineApproval, useDeleteLineApproval } from '@/hooks/useLineApprovals';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';

const LineApproval = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formState, setFormState] = useState({
    isOpen: false,
    mode: 'add' as 'add' | 'edit' | 'view',
    selectedData: null as any
  });

  const { data: approvalData = [], isLoading } = useLineApprovals();
  const createLineApproval = useCreateLineApproval();
  const updateLineApproval = useUpdateLineApproval();
  const deleteLineApproval = useDeleteLineApproval();
  const { toast } = useToast();

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

  const handleFormSubmit = async (formData: any) => {
    try {
      console.log('Form submission data:', formData);
      
      if (formState.mode === 'add') {
        await createLineApproval.mutateAsync(formData);
        toast({
          title: "Berhasil!",
          description: "Line approval berhasil ditambahkan",
        });
      } else if (formState.mode === 'edit') {
        await updateLineApproval.mutateAsync({
          id: formState.selectedData.id,
          ...formData
        });
        toast({
          title: "Berhasil!",
          description: "Line approval berhasil diperbarui",
        });
      }
      closeForm();
    } catch (error) {
      console.error('Error saving line approval:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (item: any) => {
    Swal.fire({
      title: 'Hapus Line Approval?',
      text: `Apakah Anda yakin ingin menghapus line approval untuk ${item.companies.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteLineApproval.mutateAsync(item.id);
          toast({
            title: "Terhapus!",
            description: "Line approval berhasil dihapus",
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

  const filteredData = approvalData.filter(item => 
    item.companies.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Line Approval Perusahaan</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola alur persetujuan berdasarkan perusahaan</p>
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
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={() => openForm('add')}
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Line Approval Perusahaan
                  </Button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daftar Line Approval Perusahaan
                </CardTitle>
                
                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari perusahaan..."
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
                      <TableHead>Nama Perusahaan</TableHead>
                      <TableHead>Staff GA</TableHead>
                      <TableHead>SPV GA</TableHead>
                      <TableHead>HR Manager</TableHead>
                      <TableHead>BOD</TableHead>
                      <TableHead>Staff FA</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium text-gray-900 dark:text-white">{item.companies.name}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={item.staff_ga?.photo_url || undefined} />
                              <AvatarFallback className="bg-blue-500 text-white font-medium">
                                {item.staff_ga?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.staff_ga?.name}</p>
                              <p className="font-medium text-gray-500 dark:text-white">{item.staff_ga?.employee_id}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.staff_ga?.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={item.spv_ga?.photo_url || undefined} />
                              <AvatarFallback className="bg-blue-500 text-white font-medium">
                                {item.spv_ga?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.spv_ga?.name}</p>
                              <p className="font-medium text-gray-500 dark:text-white">{item.spv_ga?.employee_id}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.spv_ga?.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={item.hr_manager?.photo_url || undefined} />
                              <AvatarFallback className="bg-blue-500 text-white font-medium">
                                {item.hr_manager?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.hr_manager?.name}</p>
                              <p className="font-medium text-gray-500 dark:text-white">{item.hr_manager?.employee_id}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.hr_manager?.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={item.bod?.photo_url || undefined} />
                              <AvatarFallback className="bg-blue-500 text-white font-medium">
                                {item.bod?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.bod?.name}</p>
                              <p className="font-medium text-gray-500 dark:text-white">{item.bod?.employee_id}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.bod?.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={item.staff_fa?.photo_url || undefined} />
                              <AvatarFallback className="bg-blue-500 text-white font-medium">
                                {item.staff_fa?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.staff_fa?.name}</p>
                              <p className="font-medium text-gray-500 dark:text-white">{item.staff_fa?.employee_id}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.staff_fa?.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2"
                              onClick={() => openForm('view', item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2"
                              onClick={() => openForm('edit', item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(item)}
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
      <LineApprovalForm
        isOpen={formState.isOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        initialData={formState.selectedData}
        mode={formState.mode}
      />
    </div>
  );
};

export default LineApproval;
