
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Users, UserCheck, UserX } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/useUsers';
import { useCreateUser, useDeleteUser, useToggleUserActive, useUpdateUser } from '@/hooks/useUserManagement';
import UserFormModal from '@/components/UserFormModal';

const ManajemenUser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const toggleActive = useToggleUserActive();
  
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (u.employees?.name || '').toLowerCase().includes(term) ||
      (u.username || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term);
  });

  const getStatusBadge = (isActive: boolean) => {
    return (<Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{isActive ? 'Aktif' : 'Tidak Aktif'}</Badge>);
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { cls: string; label: string }> = {
      admin: { cls: 'bg-purple-100 text-purple-800', label: 'Admin' },
      manager: { cls: 'bg-blue-100 text-blue-800', label: 'Manager' },
      user: { cls: 'bg-gray-100 text-gray-800', label: 'User' }
    };
    
    const c = config[role.toLowerCase()] || config.user;
    return <Badge className={c.cls}>{c.label}</Badge>;
  };

  const handleAdd = () => { setFormMode('add'); setSelectedUser(null); setFormOpen(true); };
  const handleView = (u: any) => { setFormMode('view'); setSelectedUser(u); setFormOpen(true); };
  const handleEdit = (u: any) => { setFormMode('edit'); setSelectedUser(u); setFormOpen(true); };

  const handleFormSubmit = async (data: any) => {
    try {
      if (formMode === 'add') {
        await createUser.mutateAsync({ ...data, password: data.password || '12345' });
        toast({ title: "Berhasil!", description: "User berhasil ditambahkan" });
      } else if (formMode === 'edit' && selectedUser) {
        await updateUser.mutateAsync({ id: selectedUser.id, ...data });
        toast({ title: "Berhasil!", description: "User berhasil diupdate" });
      }
      setFormOpen(false);
    } catch (err: any) {
      toast({ title: "Error!", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      await deleteUser.mutateAsync(id);
      toast({ title: "Berhasil!", description: "User berhasil dihapus" });
    } catch (err: any) {
      toast({ title: "Error!", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, is_active: !currentActive });
      toast({ title: "Berhasil!", description: `User berhasil ${currentActive ? 'dinonaktifkan' : 'diaktifkan'}` });
    } catch (err: any) {
      toast({ title: "Error!", description: err.message, variant: "destructive" });
    }
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manajemen User</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola pengguna sistem</p>
                </div>
                <Button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mt-4 md:mt-0">
                  <Plus className="w-4 h-4" />Tambah User
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.is_active).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <UserX className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => !u.is_active).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daftar User
                </CardTitle>
                
                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari user..."
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
                       <TableHead>Nama</TableHead>
                       <TableHead>Username</TableHead>
                       <TableHead>Email</TableHead>
                       <TableHead>Role</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead>Last Login</TableHead>
                       <TableHead>Waktu Bergabung</TableHead>
                       <TableHead>Aksi</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                       <TableRow key={user.id}>
                         <TableCell className="font-medium text-gray-900 dark:text-white">
                           {user.employees?.name || '-'}
                         </TableCell>
                         <TableCell className="text-gray-600 dark:text-gray-400">
                           {user.username}
                         </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role) || 'user'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.is_active ?? true)}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {user.created_at}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="p-2" onClick={() => handleView(user)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2" onClick={() => handleEdit(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 text-green-600 hover:text-green-800"
                              onClick={() => handleToggleActive(user.id, user.is_active ?? true)}
                            >
                              {user.is_active ? <UserX className="w-4 h-4 text-red-600" /> : <UserCheck className="w-4 h-4 text-green-600" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-800" onClick={() => handleDelete(user.id)}>
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

      <UserFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} initialData={selectedUser} mode={formMode} />
    </div>
  );
};

export default ManajemenUser;
