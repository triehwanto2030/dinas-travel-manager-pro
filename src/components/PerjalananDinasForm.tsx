
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEmployees } from '@/hooks/useEmployees';
import { useLineApprovals } from '@/hooks/useLineApprovals';
import { useCompanies } from '@/hooks/useCompanies';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  employee_id: z.string().min(1, 'Pilih karyawan'),
  supervisor_id: z.string().optional(),
  destination: z.string().min(1, 'Tujuan harus diisi'),
  start_date: z.date({ required_error: 'Tanggal mulai harus diisi' }),
  end_date: z.date({ required_error: 'Tanggal selesai harus diisi' }),
  purpose: z.string().min(1, 'Tujuan perjalanan harus diisi'),
  accommodation: z.string().min(1, 'Pilih jenis akomodasi'),
  transportation: z.string().min(1, 'Pilih jenis transportasi'),
  cash_advance: z.number().min(0, 'Cash advance harus lebih dari 0'),
  cost_center: z.string().min(1, 'Pilih cost center'),
  department: z.string().min(1, 'Pilih departemen'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PerjalananDinasFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  data?: any;
}

const PerjalananDinasForm = ({ isOpen, onClose, mode, data }: PerjalananDinasFormProps) => {
  const { data: employees } = useEmployees();
  const { data: lineApprovals } = useLineApprovals();
  const { data: companies } = useCompanies();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);
  const [approvalLine, setApprovalLine] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      supervisor_id: '',
      destination: '',
      purpose: '',
      accommodation: '',
      transportation: '',
      cash_advance: 0,
      cost_center: '',
      department: '',
      notes: '',
    },
  });

  // Auto-fill supervisor and approval line when employee is selected
  useEffect(() => {
    if (selectedEmployee && lineApprovals) {
      const employeeApproval = lineApprovals.find(
        (approval) => approval.company_id === selectedEmployee.company_id
      );
      
      if (employeeApproval) {
        setApprovalLine(employeeApproval);
        if (employeeApproval.supervisor) {
          form.setValue('supervisor_id', employeeApproval.supervisor.id);
          setSelectedSupervisor(employeeApproval.supervisor);
        }
      }
      
      // Set department from selected employee
      if (selectedEmployee.department) {
        form.setValue('department', selectedEmployee.department);
      }
      
      // Set cost center from employee's company
      form.setValue('cost_center', selectedEmployee.company_id);
    }
  }, [selectedEmployee, lineApprovals, form]);

  // Update selected supervisor when supervisor is manually changed
  useEffect(() => {
    const supervisorId = form.watch('supervisor_id');
    if (supervisorId && employees) {
      const supervisor = employees.find(emp => emp.id === supervisorId);
      setSelectedSupervisor(supervisor);
    }
  }, [form.watch('supervisor_id'), employees]);

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees?.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);
    form.setValue('employee_id', employeeId);
  };

  const handleSupervisorChange = (supervisorId: string) => {
    const supervisor = employees?.find(emp => emp.id === supervisorId);
    setSelectedSupervisor(supervisor);
    form.setValue('supervisor_id', supervisorId);
  };

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    console.log('Approval line:', approvalLine);
    // Here you would typically save the data to Supabase
    onClose();
  };

  // Filter out empty/undefined departments
  const departments = [...new Set(employees?.map(emp => emp.department).filter(dept => dept && dept.trim() !== '') || [])];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Tambah Perjalanan Dinas Baru' : 
             mode === 'edit' ? 'Edit Perjalanan Dinas' : 'Detail Perjalanan Dinas'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Data Karyawan Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">👤</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Karyawan</h3>
                </div>

                <FormField
                  control={form.control}
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Karyawan *</FormLabel>
                      <Select onValueChange={handleEmployeeChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih karyawan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees?.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} - {employee.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Employee Details Card */}
                {selectedEmployee && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Detail Karyawan</h4>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={selectedEmployee.avatar_url} alt={selectedEmployee.name} />
                        <AvatarFallback className="text-lg">
                          {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 dark:text-white">{selectedEmployee.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.id} ({selectedEmployee.grade})</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.position}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.department}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.companies?.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="supervisor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor/Atasan *</FormLabel>
                      <Select onValueChange={handleSupervisorChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih supervisor/atasan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees?.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} - {employee.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Supervisor Details Card */}
                {selectedSupervisor && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Detail Atasan</h4>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={selectedSupervisor.avatar_url} alt={selectedSupervisor.name} />
                        <AvatarFallback className="text-lg">
                          {selectedSupervisor.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 dark:text-white">{selectedSupervisor.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.id} ({selectedSupervisor.grade})</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.position}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.department}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.companies?.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detail Perjalanan Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">📍</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Detail Perjalanan</h3>
                </div>

                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tujuan *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Jakarta, Surabaya, Bali" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Mulai *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>dd/mm/yyyy</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Selesai *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>dd/mm/yyyy</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tujuan Perjalanan *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Jelaskan tujuan perjalanan dinas..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accommodation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Akomodasi *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis akomodasi..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="guest-house">Guest House</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transportation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transportasi *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis transportasi..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flight">Pesawat</SelectItem>
                          <SelectItem value="train">Kereta Api</SelectItem>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="car">Mobil Pribadi</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Detail Keuangan Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-medium">💰</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Detail Keuangan</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cash_advance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash Advance *</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="Contoh: Rp 2,000,000"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(parseInt(value) || 0);
                          }}
                          value={field.value ? `Rp ${field.value.toLocaleString('id-ID')}` : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost_center"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Center *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih perusahaan..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies?.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departemen *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih departemen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Tambahan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Catatan atau informasi tambahan..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Approval Line Preview */}
            {approvalLine && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Line Approval</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {approvalLine.supervisor && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Supervisor</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={approvalLine.supervisor.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {approvalLine.supervisor.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{approvalLine.supervisor.name}</p>
                          <p className="text-sm text-gray-500">{approvalLine.supervisor.position}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {approvalLine.hr_manager && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">HR Manager</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={approvalLine.hr_manager.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {approvalLine.hr_manager.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{approvalLine.hr_manager.name}</p>
                          <p className="text-sm text-gray-500">{approvalLine.hr_manager.position}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {approvalLine.bod && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">BOD</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={approvalLine.bod.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {approvalLine.bod.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{approvalLine.bod.name}</p>
                          <p className="text-sm text-gray-500">{approvalLine.bod.position}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={mode === 'view'}>
                {mode === 'create' ? 'Simpan Perjalanan Dinas' : 'Update Perjalanan Dinas'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PerjalananDinasForm;
