
import React, { useState, useEffect } from 'react';
import { X, Upload, User, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEmployees } from '@/hooks/useEmployees';
import { useCompanies } from '@/hooks/useCompanies';

interface PerjalananDinasFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  data?: any;
}

const PerjalananDinasForm: React.FC<PerjalananDinasFormProps> = ({
  isOpen,
  onClose,
  mode,
  data
}) => {
  const { data: employees = [] } = useEmployees();
  const { data: companies = [] } = useCompanies();
  
  const [formData, setFormData] = useState({
    employeeId: '',
    destination: '',
    purpose: '',
    costCenter: '',
    department: '',
    startDate: '',
    endDate: '',
    estimatedBudget: '',
    notes: ''
  });

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);

  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        employeeId: data.employeeId || '',
        destination: data.destination || '',
        purpose: data.purpose || '',
        costCenter: data.costCenter || '',
        department: data.department || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        estimatedBudget: data.estimatedBudget?.toString() || '',
        notes: data.notes || ''
      });
    } else if (!data && isOpen) {
      setFormData({
        employeeId: '',
        destination: '',
        purpose: '',
        costCenter: '',
        department: '',
        startDate: '',
        endDate: '',
        estimatedBudget: '',
        notes: ''
      });
      setSelectedEmployee(null);
      setSelectedSupervisor(null);
    }
  }, [data, isOpen]);

  useEffect(() => {
    if (formData.employeeId) {
      const employee = employees.find(emp => emp.id === formData.employeeId);
      if (employee) {
        setSelectedEmployee(employee);
        setSelectedSupervisor(employee.supervisor || null);
        
        // Auto-fill cost center and department
        setFormData(prev => ({
          ...prev,
          costCenter: employee.companies?.name || '',
          department: employee.department || ''
        }));
      }
    } else {
      setSelectedEmployee(null);
      setSelectedSupervisor(null);
      setFormData(prev => ({
        ...prev,
        costCenter: '',
        department: ''
      }));
    }
  }, [formData.employeeId, employees]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    onClose();
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Tambah Perjalanan Dinas' : 
                mode === 'edit' ? 'Edit Perjalanan Dinas' : 
                'Detail Perjalanan Dinas';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">{title}</CardTitle>
              <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informasi Karyawan */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Karyawan
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="employeeId">Pilih Karyawan *</Label>
                      <Select 
                        value={formData.employeeId} 
                        onValueChange={(value) => handleInputChange('employeeId', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                          <SelectValue placeholder="Pilih karyawan..." />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.filter(emp => emp.status === 'Aktif').map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} - {employee.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="costCenter">Cost Center</Label>
                      <Input
                        id="costCenter"
                        value={formData.costCenter}
                        onChange={(e) => handleInputChange('costCenter', e.target.value)}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-700"
                        placeholder="Cost center akan terisi otomatis"
                      />
                    </div>

                    <div>
                      <Label htmlFor="department">Departemen</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-700"
                        placeholder="Departemen akan terisi otomatis"
                      />
                    </div>
                  </div>

                  {/* Employee Preview */}
                  <div className="space-y-4">
                    <div>
                      <Label>Preview Karyawan</Label>
                      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        {selectedEmployee ? (
                          <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={selectedEmployee.avatar_url || undefined} />
                              <AvatarFallback className="bg-blue-500 text-white">
                                {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{selectedEmployee.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.id}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.grade}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.position}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.department}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.companies?.name}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center">Pilih karyawan untuk melihat preview</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Preview Atasan</Label>
                      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        {selectedSupervisor ? (
                          <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={selectedSupervisor.avatar_url || undefined} />
                              <AvatarFallback className="bg-green-500 text-white">
                                {selectedSupervisor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{selectedSupervisor.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.id}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.grade}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.position}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.department}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.companies?.name}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center">
                            {selectedEmployee ? 'Karyawan tidak memiliki atasan' : 'Pilih karyawan untuk melihat atasan'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Perjalanan */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Detail Perjalanan
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Tujuan *</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      placeholder="Kota tujuan"
                      required
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="purpose">Keperluan *</Label>
                    <Input
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      placeholder="Tujuan perjalanan"
                      required
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Tanggal Berangkat *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Tanggal Kembali *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="estimatedBudget">Estimasi Budget</Label>
                    <Input
                      id="estimatedBudget"
                      type="number"
                      value={formData.estimatedBudget}
                      onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                      placeholder="0"
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Catatan tambahan..."
                      rows={4}
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              {!isReadOnly && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {mode === 'create' ? 'Buat Perjalanan Dinas' : 'Simpan Perubahan'}
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

export default PerjalananDinasForm;
