
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies } from '@/hooks/useCompanies';
import { useEmployees } from '@/hooks/useEmployees';

interface LineApprovalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode: 'add' | 'edit' | 'view';
}

const LineApprovalForm: React.FC<LineApprovalFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode 
}) => {
  const { data: companies = [] } = useCompanies();
  const { data: employees = [] } = useEmployees();
  
  const [formData, setFormData] = useState({
    company_id: '',
    staff_ga_id: '',
    spv_ga_id: '',
    hr_manager_id: '',
    bod_id: '',
    staff_fa_id: ''
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        company_id: initialData.company_id || '',
        staff_ga_id: initialData.staff_ga_id || '',
        spv_ga_id: initialData.spv_ga_id || '',
        hr_manager_id: initialData.hr_manager_id || '',
        bod_id: initialData.bod_id || '',
        staff_fa_id: initialData.staff_fa_id || ''
      });
    } else if (!initialData && isOpen) {
      setFormData({
        company_id: '',
        staff_ga_id: '',
        spv_ga_id: '',
        hr_manager_id: '',
        bod_id: '',
        staff_fa_id: ''
      });
    }
  }, [initialData, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value === "none" ? "" : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting line approval form:', formData);
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'add' ? 'Tambah Line Approval' : mode === 'edit' ? 'Edit Line Approval' : 'Detail Line Approval';

  // Filter employees by selected company
  const companyEmployees = employees.filter(emp => 
    formData.company_id ? emp.company_id === formData.company_id : true
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">{title}</CardTitle>
              <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Selection */}
              <div>
                <Label htmlFor="company_id">Nama Perusahaan *</Label>
                <Select 
                  value={formData.company_id || undefined} 
                  onValueChange={(value) => handleInputChange('company_id', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                    <SelectValue placeholder="Pilih Perusahaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Staff GA */}
              <div>
                <Label htmlFor="staff_ga_id">Staff GA</Label>
                <Select 
                  value={formData.staff_ga_id || "none"} 
                  onValueChange={(value) => handleInputChange('staff_ga_id', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                    <SelectValue placeholder="Pilih Staff GA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {companyEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SPV GA */}
              <div>
                <Label htmlFor="spv_ga_id">SPV GA</Label>
                <Select 
                  value={formData.spv_ga_id || "none"} 
                  onValueChange={(value) => handleInputChange('spv_ga_id', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                    <SelectValue placeholder="Pilih SPV GA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {companyEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* HR Manager */}
              <div>
                <Label htmlFor="hr_manager_id">HR Manager</Label>
                <Select 
                  value={formData.hr_manager_id || "none"} 
                  onValueChange={(value) => handleInputChange('hr_manager_id', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                    <SelectValue placeholder="Pilih HR Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {companyEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* BOD */}
              <div>
                <Label htmlFor="bod_id">BOD</Label>
                <Select 
                  value={formData.bod_id || "none"} 
                  onValueChange={(value) => handleInputChange('bod_id', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                    <SelectValue placeholder="Pilih BOD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {companyEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Staff FA */}
              <div>
                <Label htmlFor="staff_fa_id">Staff FA</Label>
                <Select 
                  value={formData.staff_fa_id || "none"} 
                  onValueChange={(value) => handleInputChange('staff_fa_id', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                    <SelectValue placeholder="Pilih Staff FA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {companyEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buttons */}
              {!isReadOnly && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    {mode === 'add' ? 'Tambah Line Approval' : 'Simpan Perubahan'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LineApprovalForm;
