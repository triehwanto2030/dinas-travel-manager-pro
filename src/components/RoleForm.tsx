import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RoleFormData } from '@/hooks/useRoles';
import { Tables } from '@/integrations/supabase/types';

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

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      const perms = initialData.permissions;
      setPermissions(Array.isArray(perms) ? (perms as string[]) : []);
    } else {
      setName('');
      setDescription('');
      setPermissions([]);
    }
  }, [initialData, open]);

  const togglePermission = (perm: string) => {
    setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, permissions });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
