import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RoleFormData } from '@/hooks/useRoles';
import { Tables } from '@/integrations/supabase/types';
import { ALL_PAGES } from '@/hooks/usePageAccess';

const ALL_PERMISSIONS = ['read', 'write', 'delete', 'approve', 'manage_users'];

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoleFormData) => void;
  initialData?: Tables<'roles'> | null;
  isLoading?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({ open, onOpenChange, onSubmit, initialData, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pageAccess, setPageAccess] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      const perms = initialData.permissions;
      setPermissions(Array.isArray(perms) ? (perms as string[]) : []);
      const pages = initialData.page_access;
      setPageAccess(Array.isArray(pages) ? (pages as string[]) : []);
    } else {
      setName('');
      setDescription('');
      setPermissions([]);
      setPageAccess([]);
    }
  }, [initialData, open]);

  const togglePermission = (perm: string) => {
    setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const togglePage = (key: string) => {
    setPageAccess(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  }

  const selectAllPages = () => {
    setPageAccess(ALL_PAGES.map(p => p.key));
  };

  const clearAllPages = () => {
    setPageAccess([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, permissions, page_access: pageAccess });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Role' : 'Tambah Role'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="role-name">Nama Role</Label>
            <Input id="role-name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="role-desc">Deskripsi</Label>
            <Textarea id="role-desc" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ALL_PERMISSIONS.map(perm => (
                <div key={perm} className="flex items-center space-x-2">
                  <Checkbox
                    id={`perm-${perm}`}
                    checked={permissions.includes(perm)}
                    onCheckedChange={() => togglePermission(perm)}
                  />
                  <Label htmlFor={`perm-${perm}`} className="cursor-pointer font-normal">{perm}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Akses Halaman</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllPages}>Pilih Semua</Button>
                <Button type="button" variant="outline" size="sm" onClick={clearAllPages}>Hapus Semua</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 border rounded-lg p-3 bg-muted/30">
              {ALL_PAGES.map(page => (
                <div key={page.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`page-${page.key}`}
                    checked={pageAccess.includes(page.key)}
                    onCheckedChange={() => togglePage(page.key)}
                  />
                  <Label htmlFor={`page-${page.key}`} className="cursor-pointer font-normal text-sm">{page.label}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleForm;
