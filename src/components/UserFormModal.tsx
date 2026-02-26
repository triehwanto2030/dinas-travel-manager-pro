import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEmployees } from '@/hooks/useEmployees';
import { useRoles } from '@/hooks/useRoles';
import { UserWithEmployee } from '@/hooks/useUsers';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: UserWithEmployee | null;
  mode: 'add' | 'edit' | 'view';
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const { data: employees = [] } = useEmployees();
  const { data: roles = [] } = useRoles();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    role: 'user',
    employee_id: '' as string | null,
    is_active: true,
    password: '',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        email: initialData.email || '',
        username: initialData.username || '',
        role: initialData.role || 'user',
        employee_id: initialData.employee_id || '',
        is_active: initialData.is_active ?? true,
        password: '',
      });
    } else if (isOpen && !initialData) {
      setFormData({ email: '', username: '', role: 'user', employee_id: '', is_active: true, password: '' });
    }
  }, [isOpen, initialData]);

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    setFormData(prev => ({
      ...prev,
      employee_id: empId === 'none' ? null : empId,
      email: emp?.email || prev.email,
      username: emp?.email || prev.username,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      employee_id: formData.employee_id || null,
    });
  };

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';
  const title = mode === 'add' ? 'Tambah User' : mode === 'edit' ? 'Edit User' : 'Detail User';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>Karyawan</Label>
            <Select 
              value={formData.employee_id || 'none'} 
              onValueChange={handleEmployeeChange}
              disabled={isReadOnly}
            >
              <SelectTrigger><SelectValue placeholder="Pilih karyawan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak terhubung</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name} - {emp.position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Email *</Label>
            <Input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required readOnly={isReadOnly} />
          </div>
          <div>
            <Label>Username *</Label>
            <Input value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))} required readOnly={isReadOnly} />
          </div>
          <div>
            <Label>Role *</Label>
            <Select value={formData.role} onValueChange={v => setFormData(p => ({ ...p, role: v }))} disabled={isReadOnly}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.name.toLowerCase()}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {mode === 'add' && (
            <div>
              <Label>Password</Label>
              <Input type="text" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} placeholder="Default: 12345" />
            </div>
          )}
          {mode === 'edit' && (
            <div>
              <Label>Password Baru (kosongkan jika tidak diubah)</Label>
              <Input type="text" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} placeholder="Kosongkan jika tidak diubah" />
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>Status Aktif</Label>
            <Switch checked={formData.is_active} onCheckedChange={v => setFormData(p => ({ ...p, is_active: v }))} disabled={isReadOnly} />
          </div>
          {!isReadOnly && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {mode === 'add' ? 'Tambah User' : 'Simpan'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;