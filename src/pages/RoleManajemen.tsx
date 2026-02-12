import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Shield, Users, Settings2 } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRoles, useRoleUserCounts, useCreateRole, useUpdateRole, useDeleteRole, RoleFormData } from '@/hooks/useRoles';
import { Tables } from '@/integrations/supabase/types';
import RoleForm from '@/components/RoleForm';
import Swal from 'sweetalert2';

const RoleManajemen = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Tables<'roles'> | null>(null);
  const { toast } = useToast();

  const { data: roles = [], isLoading } = useRoles();
  const { data: userCounts = {} } = useRoleUserCounts();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = Object.values(userCounts).reduce((a, b) => a + b, 0);
  const allPermissions = new Set<string>();
  roles.forEach(r => {
    if (Array.isArray(r.permissions)) (r.permissions as string[]).forEach(p => allPermissions.add(p));
  });

  const handleAdd = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const handleEdit = (role: Tables<'roles'>) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  const handleSubmit = async (data: RoleFormData) => {
    try {
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, formData: data });
        toast({ title: "Berhasil!", description: "Role berhasil diperbarui" });
      } else {
        await createRole.mutateAsync(data);
        toast({ title: "Berhasil!", description: "Role berhasil ditambahkan" });
      }
      setFormOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (role: Tables<'roles'>) => {
    const count = userCounts[role.name.toLowerCase()] || 0;
    if (count > 0) {
      Swal.fire({ icon: 'warning', title: 'Tidak bisa dihapus', text: `Role "${role.name}" masih digunakan oleh ${count} user.` });
      return;
    }
    const result = await Swal.fire({
      title: 'Hapus Role?',
      text: `Apakah Anda yakin ingin menghapus role "${role.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await deleteRole.mutateAsync(role.id);
        Swal.fire('Dihapus!', 'Role berhasil dihapus.', 'success');
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
      <Header />
      <div className="flex w-full">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 w-full">
          <main className="p-6 w-full">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Role Manajemen</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola role dan permission sistem</p>
                </div>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mt-4 md:mt-0" onClick={handleAdd}>
                  <Plus className="w-4 h-4" />
                  Tambah Role
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Roles</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{roles.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assigned Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Settings2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{allPermissions.size}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Daftar Role</CardTitle>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari role..."
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
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.map((role) => {
                        const perms = Array.isArray(role.permissions) ? (role.permissions as string[]) : [];
                        const count = userCounts[role.name.toLowerCase()] || 0;
                        return (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium text-gray-900 dark:text-white">{role.name}</TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">{role.description}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {perms.map((p, i) => (
                                  <Badge key={i} className="bg-blue-100 text-blue-800 text-xs">{p}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-gray-100 text-gray-800">{count} users</Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {new Date(role.created_at).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="p-2" onClick={() => handleEdit(role)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-800" onClick={() => handleDelete(role)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredRoles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {searchTerm ? 'Tidak ada role yang cocok' : 'Belum ada role'}
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

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <RoleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingRole}
        isLoading={createRole.isPending || updateRole.isPending}
      />
    </div>
  );
};

export default RoleManajemen;
