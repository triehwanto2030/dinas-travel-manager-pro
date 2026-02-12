import React, { useState, useEffect } from 'react';
import { Upload, Calendar, User, Mail, Phone, Building, Award, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCompanies } from '@/hooks/useCompanies';
import { useEmployees, EmployeeFormData } from '@/hooks/useEmployees';
import { useEmployeeGrades } from '@/hooks/useEmployeeGrades';
import { useEmployeeDepartments } from '@/hooks/useEmployeeDepartments';

interface KaryawanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  initialData?: any;
  mode: 'add' | 'edit' | 'view';
}

const KaryawanForm: React.FC<KaryawanFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode 
}) => {
  const { data: companies = [] } = useCompanies();
  const { data: employees = [] } = useEmployees();
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: '',
    nama: '',
    email: '',
    phone: '',
    tanggalBergabung: '',
    departemen: '',
    posisi: '',
    grade: '',
    status: 'Aktif',
    namaPerusahaan: '',
    supervisorId: '',
    fotoUrl: '',
    userUsername: '',
    userPassword: '12345',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: gradeOptions = [] } = useEmployeeGrades();
  const { data: departemenOptions = [] } = useEmployeeDepartments();

  // Utility function to format date to 'yyyy-MM-dd'
  const formatDate = (date) => {
    if (!date) return new Date().toISOString().split('T')[0]; // Default to current date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return new Date().toISOString().split('T')[0]; // Fallback to current date if invalid
    return parsedDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (initialData && isOpen) {
      // Find company name from companies data
      const company = companies.find(c => c.id === initialData.company_id);

      setFormData({
        employeeId: initialData.employee_id || '',
        nama: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        tanggalBergabung: formatDate(initialData.created_at), // Format the date here
        departemen: initialData.department || '',
        posisi: initialData.position || '',
        grade: initialData.grade || '',
        status: 'Aktif',
        namaPerusahaan: company?.name || '',
        supervisorId: initialData.supervisor_id || '',
        fotoUrl: initialData.photo_url || ''
      });
      setPreviewImage(initialData.photo_url || null);
    } else if (!initialData && isOpen) {
      setFormData({
        employeeId: '',
        nama: '',
        email: '',
        phone: '',
        tanggalBergabung: formatDate(null), // Default to current date
        departemen: '',
        posisi: '',
        grade: '',
        status: 'Aktif',
        namaPerusahaan: '',
        supervisorId: '',
        fotoUrl: '',
        userUsername: '',
        userPassword: '12345',
      });
      setPreviewImage(null);
    }
  }, [initialData, isOpen, companies]);

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Auto-sync username with email when email changes (only in add mode)
      if (field === 'email' && mode === 'add') {
        next.userUsername = value;
      }
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, fotoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'add' ? 'Tambah Karyawan' : mode === 'edit' ? 'Edit Karyawan' : 'Detail Karyawan';

  // Filter employees for supervisor selection - exclude current employee and filter by same company
  const availableSupervisors = employees.filter(emp => 
    emp.employee_id !== formData.employeeId && 
    (formData.namaPerusahaan ? emp.companies?.name === formData.namaPerusahaan : true)
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
              {/* Foto Karyawan */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Foto Karyawan</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={previewImage || undefined} />
                    <AvatarFallback className="bg-blue-500 text-white text-lg">
                      {formData.nama.split(' ').map(n => n[0]).join('').toUpperCase() || 'FT'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {!isReadOnly && (
                    <div>
                      <Label htmlFor="foto" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Upload className="w-4 h-4" />
                          <span>Pilih Foto</span>
                        </div>
                        <input
                          id="foto"
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">Format: JPG, PNG (maks. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informasi Personal */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informasi Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeId">ID Karyawan *</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      placeholder="EMP001"
                      required={mode === 'add'}
                      readOnly={mode === 'edit' || isReadOnly}
                      className={mode === 'edit' || isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nama">Nama Lengkap *</Label>
                    <Input
                      id="nama"
                      value={formData.nama}
                      onChange={(e) => handleInputChange('nama', e.target.value)}
                      required
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="namaPerusahaan">Nama Perusahaan *</Label>
                    <Select 
                      value={formData.namaPerusahaan} 
                      onValueChange={(value) => handleInputChange('namaPerusahaan', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                        <SelectValue placeholder="Pilih Perusahaan" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.name}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+62 xxx-xxxx-xxxx"
                      required
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tanggalBergabung">Tanggal Bergabung *</Label>
                    <Input
                      id="tanggalBergabung"
                      type="date"
                      value={formData.tanggalBergabung}
                      onChange={(e) => handleInputChange('tanggalBergabung', e.target.value)}
                      required
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>
                </div>
              </div>

              {/* Informasi Pekerjaan */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informasi Pekerjaan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departemen">Departemen *</Label>
                    <Select 
                      value={formData.departemen} 
                      onValueChange={(value) => handleInputChange('departemen', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                        <SelectValue placeholder="Pilih Departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        {departemenOptions.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="posisi">Posisi *</Label>
                    <Input
                      id="posisi"
                      value={formData.posisi}
                      onChange={(e) => handleInputChange('posisi', e.target.value)}
                      placeholder="Contoh: Sales Manager, Developer, etc."
                      required
                      readOnly={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select 
                      value={formData.grade || undefined} 
                      onValueChange={(value) => handleInputChange('grade', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                        <SelectValue placeholder="Pilih Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade.code} value={grade.code}>{grade.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status Karyawan *</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value as 'Aktif' | 'Tidak Aktif')}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="supervisorId">Atasan</Label>
                    <Select 
                      value={formData.supervisorId || "none"} 
                      onValueChange={(value) => handleInputChange('supervisorId', value === "none" ? "" : value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className={isReadOnly ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                        <SelectValue placeholder="Pilih Atasan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak Ada Atasan</SelectItem>
                        {employees.map((supervisor) => (
                          <SelectItem key={supervisor.id} value={supervisor.id}>
                            {supervisor.name} - {supervisor.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Akun User - only show in add mode */}
              {mode === 'add' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Akun User</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="userUsername">Username (Email)</Label>
                      <Input
                        id="userUsername"
                        value={formData.userUsername || ''}
                        onChange={(e) => handleInputChange('userUsername', e.target.value)}
                        placeholder="Otomatis dari email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userPassword">Password</Label>
                      <Input
                        id="userPassword"
                        type="text"
                        value={formData.userPassword || '12345'}
                        onChange={(e) => handleInputChange('userPassword', e.target.value)}
                        placeholder="Default: 12345"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">User akan otomatis dibuat dengan role "user".</p>
                </div>
              )}

              {!isReadOnly && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {mode === 'add' ? 'Tambah Karyawan' : 'Simpan Perubahan'}
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

export default KaryawanForm;
