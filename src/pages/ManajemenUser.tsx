
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

const ManajemenUser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock data - akan diganti dengan real data dari Supabase
  const users = [
    {
      id: 1,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2025-07-09',
      createdAt: '2025-01-15'
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'User',
      status: 'Active',
      lastLogin: '2025-07-08',
      createdAt: '2025-02-20'
    },
    {
      id: 3,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'Manager',
      status: 'Inactive',
      lastLogin: '2025-07-01',
      createdAt: '2025-03-10'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { class: 'bg-green-100 text-green-800', label: 'Aktif' },
      'Inactive': { class: 'bg-red-100 text-red-800', label: 'Tidak Aktif' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'Admin': { class: 'bg-purple-100 text-purple-800', label: 'Admin' },
      'Manager': { class: 'bg-blue-100 text-blue-800', label: 'Manager' },
      'User': { class: 'bg-gray-100 text-gray-800', label: 'User' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.User;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const handleActivate = (id: number) => {
    toast({
      title: "Berhasil!",
      description: "User berhasil diaktifkan",
    });
  };

  const handleDeactivate = (id: number) => {
    toast({
      title: "Berhasil!",
      description: "User berhasil dinonaktifkan",
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manajemen User</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola pengguna sistem</p>
                </div>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mt-4 md:mt-0">
                  <Plus className="w-4 h-4" />
                  Tambah User
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
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
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
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
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
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
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
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.status)}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {user.lastLogin}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {user.createdAt}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="p-2">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {user.status === 'Active' ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-2 text-red-600 hover:text-red-800"
                                onClick={() => handleDeactivate(user.id)}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-2 text-green-600 hover:text-green-800"
                                onClick={() => handleActivate(user.id)}
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-800">
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
    </div>
  );
};

export default ManajemenUser;
