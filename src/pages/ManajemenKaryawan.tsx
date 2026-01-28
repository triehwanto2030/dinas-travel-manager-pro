import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Building, Award, Briefcase } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';

// Hooks
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompaniesManagement';
import { useEmployeeGrades, useCreateEmployeeGrade, useUpdateEmployeeGrade, useDeleteEmployeeGrade } from '@/hooks/useEmployeeGrades';
import { useEmployeeDepartments, useCreateEmployeeDepartment, useUpdateEmployeeDepartment, useDeleteEmployeeDepartment } from '@/hooks/useEmployeeDepartments';

const ManajemenKaryawan = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Company state
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const [companyDialog, setCompanyDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [companyForm, setCompanyForm] = useState({ name: '', code: '', address: '' });
  const [companySearch, setCompanySearch] = useState('');

  // Grade state
  const { data: grades = [], isLoading: loadingGrades } = useEmployeeGrades();
  const createGrade = useCreateEmployeeGrade();
  const updateGrade = useUpdateEmployeeGrade();
  const deleteGrade = useDeleteEmployeeGrade();
  const [gradeDialog, setGradeDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [gradeForm, setGradeForm] = useState({ code: '' });
  const [gradeSearch, setGradeSearch] = useState('');

  // Department state
  const { data: departments = [], isLoading: loadingDepartments } = useEmployeeDepartments();
  const createDepartment = useCreateEmployeeDepartment();
  const updateDepartment = useUpdateEmployeeDepartment();
  const deleteDepartment = useDeleteEmployeeDepartment();
  const [deptDialog, setDeptDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [deptForm, setDeptForm] = useState({ name: '', company_id: '' });
  const [deptSearch, setDeptSearch] = useState('');

  // === COMPANY HANDLERS ===
  const openCompanyDialog = (mode: 'add' | 'edit', data?: any) => {
    setCompanyForm(mode === 'edit' && data ? { name: data.name, code: data.code || '', address: data.address || '' } : { name: '', code: '', address: '' });
    setCompanyDialog({ open: true, mode, data });
  };

  const handleSaveCompany = async () => {
    if (!companyForm.name.trim()) {
      toast({ title: 'Error', description: 'Nama perusahaan wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      if (companyDialog.mode === 'add') {
        await createCompany.mutateAsync(companyForm);
        toast({ title: 'Berhasil', description: 'Perusahaan berhasil ditambahkan' });
      } else {
        await updateCompany.mutateAsync({ id: companyDialog.data.id, ...companyForm });
        toast({ title: 'Berhasil', description: 'Perusahaan berhasil diperbarui' });
      }
      setCompanyDialog({ open: false, mode: 'add' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteCompany = (item: any) => {
    Swal.fire({
      title: 'Hapus Perusahaan?',
      text: `Apakah Anda yakin ingin menghapus ${item.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCompany.mutateAsync(item.id);
          toast({ title: 'Terhapus!', description: 'Perusahaan berhasil dihapus' });
        } catch (error: any) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
      }
    });
  };

  // === GRADE HANDLERS ===
  const openGradeDialog = (mode: 'add' | 'edit', data?: any) => {
    setGradeForm(mode === 'edit' && data ? { code: data.code } : { code: '' });
    setGradeDialog({ open: true, mode, data });
  };

  const handleSaveGrade = async () => {
    if (!gradeForm.code.trim()) {
      toast({ title: 'Error', description: 'Kode grade wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      if (gradeDialog.mode === 'add') {
        await createGrade.mutateAsync(gradeForm.code);
        toast({ title: 'Berhasil', description: 'Grade berhasil ditambahkan' });
      } else {
        await updateGrade.mutateAsync({ id: gradeDialog.data.id, code: gradeForm.code });
        toast({ title: 'Berhasil', description: 'Grade berhasil diperbarui' });
      }
      setGradeDialog({ open: false, mode: 'add' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteGrade = (item: any) => {
    Swal.fire({
      title: 'Hapus Grade?',
      text: `Apakah Anda yakin ingin menghapus grade ${item.code}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteGrade.mutateAsync(item.id);
          toast({ title: 'Terhapus!', description: 'Grade berhasil dihapus' });
        } catch (error: any) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
      }
    });
  };

  // === DEPARTMENT HANDLERS ===
  const openDeptDialog = (mode: 'add' | 'edit', data?: any) => {
    setDeptForm(mode === 'edit' && data ? { name: data.name, company_id: data.company_id || '' } : { name: '', company_id: '' });
    setDeptDialog({ open: true, mode, data });
  };

  const handleSaveDept = async () => {
    if (!deptForm.name.trim()) {
      toast({ title: 'Error', description: 'Nama departemen wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      if (deptDialog.mode === 'add') {
        await createDepartment.mutateAsync({ name: deptForm.name, company_id: deptForm.company_id || null });
        toast({ title: 'Berhasil', description: 'Departemen berhasil ditambahkan' });
      } else {
        await updateDepartment.mutateAsync({ id: deptDialog.data.id, name: deptForm.name, company_id: deptForm.company_id || null });
        toast({ title: 'Berhasil', description: 'Departemen berhasil diperbarui' });
      }
      setDeptDialog({ open: false, mode: 'add' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteDept = (item: any) => {
    Swal.fire({
      title: 'Hapus Departemen?',
      text: `Apakah Anda yakin ingin menghapus departemen ${item.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDepartment.mutateAsync(item.id);
          toast({ title: 'Terhapus!', description: 'Departemen berhasil dihapus' });
        } catch (error: any) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
      }
    });
  };

  // Filtered data
  const filteredCompanies = companies.filter((c) => c.name.toLowerCase().includes(companySearch.toLowerCase()));
  const filteredGrades = grades.filter((g) => g.code.toLowerCase().includes(gradeSearch.toLowerCase()));
  const filteredDepartments = departments.filter((d) => d.name.toLowerCase().includes(deptSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
      <Header />
      <div className="flex w-full">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 w-full">
          <main className="p-6 w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manajemen Karyawan</h1>
              <p className="text-gray-600 dark:text-gray-400">Kelola data master Perusahaan, Grade, dan Departemen</p>
            </div>

            <Tabs defaultValue="perusahaan" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="perusahaan" className="flex items-center gap-2"><Building className="w-4 h-4" /> Perusahaan</TabsTrigger>
                <TabsTrigger value="grade" className="flex items-center gap-2"><Award className="w-4 h-4" /> Grade</TabsTrigger>
                <TabsTrigger value="departemen" className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Departemen</TabsTrigger>
              </TabsList>

              {/* PERUSAHAAN TAB */}
              <TabsContent value="perusahaan">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Perusahaan</CardTitle>
                    <Button onClick={() => openCompanyDialog('add')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4" /> Tambah Perusahaan
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="Cari perusahaan..." value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} className="pl-10" />
                    </div>
                    {loadingCompanies ? (
                      <p>Loading...</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kode</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCompanies.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.code || '-'}</TableCell>
                              <TableCell>{item.address || '-'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => openCompanyDialog('edit', item)}><Edit className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteCompany(item)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredCompanies.length === 0 && (
                            <TableRow><TableCell colSpan={4} className="text-center text-gray-500">Tidak ada data</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* GRADE TAB */}
              <TabsContent value="grade">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Grade</CardTitle>
                    <Button onClick={() => openGradeDialog('add')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4" /> Tambah Grade
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="Cari grade..." value={gradeSearch} onChange={(e) => setGradeSearch(e.target.value)} className="pl-10" />
                    </div>
                    {loadingGrades ? (
                      <p>Loading...</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kode Grade</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredGrades.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.code}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => openGradeDialog('edit', item)}><Edit className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteGrade(item)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredGrades.length === 0 && (
                            <TableRow><TableCell colSpan={2} className="text-center text-gray-500">Tidak ada data</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DEPARTEMEN TAB */}
              <TabsContent value="departemen">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Departemen</CardTitle>
                    <Button onClick={() => openDeptDialog('add')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4" /> Tambah Departemen
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="Cari departemen..." value={deptSearch} onChange={(e) => setDeptSearch(e.target.value)} className="pl-10" />
                    </div>
                    {loadingDepartments ? (
                      <p>Loading...</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama Departemen</TableHead>
                            <TableHead>Perusahaan</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDepartments.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.companies?.name || 'Semua Perusahaan'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => openDeptDialog('edit', item)}><Edit className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteDept(item)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredDepartments.length === 0 && (
                            <TableRow><TableCell colSpan={3} className="text-center text-gray-500">Tidak ada data</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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

      {/* Company Dialog */}
      <Dialog open={companyDialog.open} onOpenChange={(open) => setCompanyDialog({ ...companyDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{companyDialog.mode === 'add' ? 'Tambah Perusahaan' : 'Edit Perusahaan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="company-name">Nama Perusahaan *</Label>
              <Input id="company-name" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="company-code">Kode</Label>
              <Input id="company-code" value={companyForm.code} onChange={(e) => setCompanyForm({ ...companyForm, code: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="company-address">Alamat</Label>
              <Input id="company-address" value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyDialog({ open: false, mode: 'add' })}>Batal</Button>
            <Button onClick={handleSaveCompany} className="bg-purple-600 hover:bg-purple-700">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={gradeDialog.open} onOpenChange={(open) => setGradeDialog({ ...gradeDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{gradeDialog.mode === 'add' ? 'Tambah Grade' : 'Edit Grade'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="grade-code">Kode Grade *</Label>
              <Input id="grade-code" value={gradeForm.code} onChange={(e) => setGradeForm({ code: e.target.value })} placeholder="Contoh: 1A, 2B, 3C" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialog({ open: false, mode: 'add' })}>Batal</Button>
            <Button onClick={handleSaveGrade} className="bg-purple-600 hover:bg-purple-700">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Department Dialog */}
      <Dialog open={deptDialog.open} onOpenChange={(open) => setDeptDialog({ ...deptDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deptDialog.mode === 'add' ? 'Tambah Departemen' : 'Edit Departemen'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="dept-name">Nama Departemen *</Label>
              <Input id="dept-name" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="dept-company">Perusahaan (Opsional)</Label>
              <Select value={deptForm.company_id || 'all'} onValueChange={(val) => setDeptForm({ ...deptForm, company_id: val === 'all' ? '' : val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Perusahaan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Perusahaan</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeptDialog({ open: false, mode: 'add' })}>Batal</Button>
            <Button onClick={handleSaveDept} className="bg-purple-600 hover:bg-purple-700">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManajemenKaryawan;
