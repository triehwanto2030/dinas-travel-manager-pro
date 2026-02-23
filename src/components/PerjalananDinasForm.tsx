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
import { useEmployees } from '@/hooks/useEmployees';
import { useLineApprovals } from '@/hooks/useLineApprovals';
import { useCompanies } from '@/hooks/useCompanies';
import { useCreateBusinessTrip, useUpdateBusinessTrip, BusinessTripWithRelations } from '@/hooks/useBusinessTrips';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import UserAvatarCell from './AvatarCell';

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
  data?: BusinessTripWithRelations;
}

const PerjalananDinasForm = ({ isOpen, onClose, mode, data }: PerjalananDinasFormProps) => {
  const { data: employees } = useEmployees();
  const { data: lineApprovals } = useLineApprovals();
  const { data: companies } = useCompanies();
  const createBusinessTrip = useCreateBusinessTrip();
  const updateBusinessTrip = useUpdateBusinessTrip();
  
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);
  const [approvalHierarchy, setApprovalHierarchy] = useState<any>(null);

  const [waktuMulai, setWaktuMulai] = useState<Date>(new Date());

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

  // Populate form when in edit or view mode
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && data && employees) {
      const employee = employees.find(emp => emp.id === data.employee_id);
      if (employee) {
        setSelectedEmployee(employee);
        form.setValue('employee_id', data.employee_id || '');
        form.setValue('destination', data.destination);
        form.setValue('start_date', new Date(data.start_date));
        form.setValue('end_date', new Date(data.end_date));
        form.setValue('purpose', data.purpose || '');
        form.setValue('cost_center', employee.company_id || '');
        form.setValue('cash_advance', data.cash_advance || 0);
        
        // Set accommodation and transportation
        form.setValue('accommodation', data.accommodation || 'hotel');
        form.setValue('transportation', data.transportation || 'flight');
        
        if (employee.department) {
          form.setValue('department', employee.department);
        }
        
        if (employee.supervisor_id) {
          const supervisor = employees.find(emp => emp.id === employee.supervisor_id);
          if (supervisor) {
            setSelectedSupervisor(supervisor);
            form.setValue('supervisor_id', supervisor.id);
          }
        }
      }
    }
  }, [mode, data, employees, form]);

  // Watch cost_center to trigger approval hierarchy update
  const watchedCostCenter = form.watch('cost_center');

  // Build approval hierarchy based on cost_center (PT) and supervisor
  useEffect(() => {
    if (watchedCostCenter && selectedSupervisor && lineApprovals) {
      const costCenterApproval = lineApprovals.find(
        (approval) => approval.company_id === watchedCostCenter
      );
      
      if (costCenterApproval) {
        // Build hierarchy: Supervisor -> Staff GA -> HR Manager -> BOD -> Staff FA
        // Use the employee data already included in lineApprovals
        const hierarchy = {
          supervisor: selectedSupervisor,
          staff_ga: costCenterApproval.staff_ga || null,
          hr_manager: costCenterApproval.hr_manager || null,
          spv_ga: costCenterApproval.spv_ga || null,
          bod: costCenterApproval.bod || null,
          staff_fa: costCenterApproval.staff_fa || null
        };
        
        setApprovalHierarchy(hierarchy);
      } else {
        // Reset hierarchy if no approval found for the selected cost center
        setApprovalHierarchy(selectedSupervisor ? { supervisor: selectedSupervisor, staff_ga: null, hr_manager: null, bod: null, staff_fa: null } : null);
      }
    } else if (!watchedCostCenter) {
      setApprovalHierarchy(null);
    }
  }, [watchedCostCenter, selectedSupervisor, lineApprovals]);

  // Auto-fill supervisor and approval line when employee is selected
  useEffect(() => {
    if (selectedEmployee && employees) {
      // Set supervisor based on the selected employee's supervisor_id
      if (selectedEmployee.supervisor_id) {
        const supervisor = employees.find(emp => emp.id === selectedEmployee.supervisor_id);
        if (supervisor) {
          form.setValue('supervisor_id', supervisor.id);
          setSelectedSupervisor(supervisor);
        }
      }
      
      // Set department from selected employee
      if (selectedEmployee.department) {
        form.setValue('department', selectedEmployee.department);
      }
      
      // Set cost center from employee's company
      form.setValue('cost_center', selectedEmployee.company_id);
    }
  }, [selectedEmployee, employees, form]);

  // Update selected supervisor when supervisor is manually changed
  useEffect(() => {
    const supervisorId = form.watch('supervisor_id');
    if (supervisorId && employees) {
      const supervisor = employees.find(emp => emp.id === supervisorId);
      setSelectedSupervisor(supervisor);
    }
  }, [form.watch('supervisor_id'), employees]);

  useEffect(() => {
    if (isOpen && mode === "create") {
      form.reset({
        employee_id: '',
        supervisor_id: '',
        destination: '',
        start_date: undefined,
        end_date: undefined,
        purpose: '',
        accommodation: '',
        transportation: '',
        cash_advance: 0,
        cost_center: '',
        department: '',
        notes: '',
      }); // Reset the form to its default values
      setSelectedEmployee(null);
      setSelectedSupervisor(null);
      setApprovalHierarchy(null);
    }
  }, [isOpen, mode, form]);

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

  const onSubmit = async (formData: FormData) => {
    try {
      console.log('Form data:', formData);
      console.log('Approval hierarchy:', approvalHierarchy);
      
      // Ensure required fields are present
      if (!formData.employee_id || !formData.start_date || !formData.end_date) {
        toast.error('Data yang diperlukan tidak lengkap');
        return;
      }

      // Create properly typed business trip data
      const businessTripData = {
        employee_id: formData.employee_id,
        supervisor_id: formData.supervisor_id,
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        purpose: formData.purpose,
        accommodation: formData.accommodation,
        transportation: formData.transportation,
        cash_advance: formData.cash_advance,
        cost_center: formData.cost_center,
        department: formData.department,
        notes: formData.notes,
      };
      
      if (mode === 'create') {
        await createBusinessTrip.mutateAsync(businessTripData);
        toast.success('Perjalanan dinas berhasil dibuat dan diajukan');
        form.reset();
      } else if (mode === 'edit' && data?.id) {
        await updateBusinessTrip.mutateAsync({ id: data.id, ...businessTripData });
        toast.success('Perjalanan dinas berhasil diupdate');
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data');
    }
  };

  // Filter out empty/undefined departments
  const departments = [...new Set(employees?.map(emp => emp.department).filter(dept => dept && dept.trim() !== '') || [])];

  // Add logic to ensure the selected date in the start_date calendar affects the end_date calendar
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'start_date' && value.start_date) {
        setWaktuMulai(new Date(value.start_date));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const getApprovalStatus = (step: string, pic: any) => {
    const currStep = data?.current_approval_step;
    const reject = data?.rejected_by;

    const variableMap: Record<string, keyof BusinessTripWithRelations> = {
      supervisor: 'supervisor_approved_at',
      staff_ga: 'staff_ga_approved_at',
      spv_ga: 'spv_ga_approved_at',
      hr_manager: 'hr_manager_approved_at',
      bod: 'bod_approved_at',
      staff_fa: 'staff_fa_approved_at',
    };

    const approvalBy = variableMap[step] ? data[variableMap[step]] : null;
    
    if (!approvalBy) {
      if (reject && reject === pic.id) {
        return { class: 'bg-red-100 dark:bg-red-900', label: 'Rejected', reasoning: data.rejection_reason || '' };
      } else if (currStep === step) {
        return { class: 'bg-yellow-100 dark:bg-yellow-900', label: 'Pending' };
      }
    } else {
      return { class: 'bg-green-100 dark:bg-green-900', label: 'Approved' };
    }

    return { class: 'bg-gray-50 dark:bg-gray-700', label: '' };
  };

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
                      <Select onValueChange={handleEmployeeChange} value={field.value} disabled={mode === 'view'}>
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
                      <UserAvatarCell employeeUsed={selectedEmployee} classname="w-16 h-16">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">{selectedEmployee.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.employee_id}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.grade}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.position}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.department}</p>
                        </div>
                      </UserAvatarCell>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="supervisor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor/Atasan *</FormLabel>
                      <Select onValueChange={handleSupervisorChange} value={field.value} disabled={mode === 'view'}>
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
                      <UserAvatarCell employeeUsed={selectedSupervisor} classname="w-16 h-16">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">{selectedSupervisor.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.employee_id}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.grade}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.position}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisor.department}</p>
                        </div>
                      </UserAvatarCell>
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
                        <Input placeholder="Contoh: Jakarta, Surabaya, Bali" {...field} readOnly={mode === 'view'} />
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
                                disabled={mode === 'view'}
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
                                disabled={mode === 'view'}
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
                              disabled={(date) => date < waktuMulai}
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
                          readOnly={mode === 'view'}
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={mode === 'view'}>
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={mode === 'view'}>
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
                      <FormLabel>Cash Advance</FormLabel>
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
                          readOnly={mode === 'view'}
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
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                        }} 
                        value={field.value} 
                        disabled={mode === 'view'}
                      >
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={mode === 'view'}>
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
                        readOnly={mode === 'view'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Approval Line Preview */}
            {approvalHierarchy && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Line Approval</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {approvalHierarchy.supervisor && (
                    <div className={`p-3 rounded-lg ${mode === 'view' ? getApprovalStatus('supervisor', approvalHierarchy.supervisor).class : 'bg-gray-50 dark:bg-gray-700'}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Atasan</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={approvalHierarchy.supervisor} classname="w-8 h-8">
                          <div>
                            <p className="font-medium">{approvalHierarchy.supervisor.name}</p>
                            <p className="text-sm text-gray-500">{approvalHierarchy.supervisor.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      {mode === 'view' && (<>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('supervisor', approvalHierarchy.supervisor).label}</p>
                        <p className="text-xs text-muted-foreground mt-2">{data.supervisor_approved_at || getApprovalStatus('supervisor', approvalHierarchy.supervisor).reasoning}</p>
                      </>)}
                    </div>
                  )}
                  {approvalHierarchy.staff_ga && (
                    <div className={`p-3 rounded-lg ${mode === 'view' ? getApprovalStatus('staff_ga', approvalHierarchy.staff_ga).class : 'bg-gray-50 dark:bg-gray-700'}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Staff GA</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={approvalHierarchy.staff_ga} classname="w-8 h-8">
                          <div>
                            <p className="font-medium">{approvalHierarchy.staff_ga.name}</p>
                            <p className="text-sm text-gray-500">{approvalHierarchy.staff_ga.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      {mode === 'view' && (<>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('staff_ga', approvalHierarchy.staff_ga).label}</p>
                        <p className="text-xs text-muted-foreground mt-2">{data.staff_ga_approved_at || getApprovalStatus('staff_ga', approvalHierarchy.staff_ga).reasoning}</p>
                      </>)}
                    </div>
                  )}
                  {approvalHierarchy.spv_ga && (
                    <div className={`p-3 rounded-lg ${mode === 'view' ? getApprovalStatus('spv_ga', approvalHierarchy.spv_ga).class : 'bg-gray-50 dark:bg-gray-700'}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SPV GA</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={approvalHierarchy.spv_ga} classname="w-8 h-8">
                          <div>
                            <p className="font-medium">{approvalHierarchy.spv_ga.name}</p>
                            <p className="text-sm text-gray-500">{approvalHierarchy.spv_ga.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      {mode === 'view' && (<>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('spv_ga', approvalHierarchy.spv_ga).label}</p>
                        <p className="text-xs text-muted-foreground mt-2">{data.spv_ga_approved_at || getApprovalStatus('spv_ga', approvalHierarchy.spv_ga).reasoning}</p>
                      </>)}
                    </div>
                  )}
                  {approvalHierarchy.hr_manager && (
                    <div className={`p-3 rounded-lg ${mode === 'view' ? getApprovalStatus('hr_manager', approvalHierarchy.hr_manager).class : 'bg-gray-50 dark:bg-gray-700'}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">HR Manager</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={approvalHierarchy.hr_manager} classname="w-8 h-8">
                          <div>
                            <p className="font-medium">{approvalHierarchy.hr_manager.name}</p>
                            <p className="text-sm text-gray-500">{approvalHierarchy.hr_manager.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      {mode === 'view' && (<>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('hr_manager', approvalHierarchy.hr_manager).label}</p>
                        <p className="text-xs text-muted-foreground mt-2">{data.hr_manager_approved_at || getApprovalStatus('hr_manager', approvalHierarchy.hr_manager).reasoning}</p>
                      </>)}
                    </div>
                  )}
                  {approvalHierarchy.bod && (
                    <div className={`p-3 rounded-lg ${mode === 'view' ? getApprovalStatus('bod', approvalHierarchy.bod).class : 'bg-gray-50 dark:bg-gray-700'}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">BOD</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={approvalHierarchy.bod} classname="w-8 h-8">
                          <div>
                            <p className="font-medium">{approvalHierarchy.bod.name}</p>
                            <p className="text-sm text-gray-500">{approvalHierarchy.bod.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      {mode === 'view' && (<>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('bod', approvalHierarchy.bod).label}</p>
                        <p className="text-xs text-muted-foreground mt-2">{data.bod_approved_at || getApprovalStatus('bod', approvalHierarchy.bod).reasoning}</p>
                      </>)}
                    </div>
                  )}
                  {approvalHierarchy.staff_fa && (
                    <div className={`p-3 rounded-lg ${mode === 'view' ? getApprovalStatus('staff_fa', approvalHierarchy.staff_fa).class : 'bg-gray-50 dark:bg-gray-700'}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Staff FA</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={approvalHierarchy.staff_fa} classname="w-8 h-8">
                          <div>
                            <p className="font-medium">{approvalHierarchy.staff_fa.name}</p>
                            <p className="text-sm text-gray-500">{approvalHierarchy.staff_fa.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      {mode === 'view' && (<>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('staff_fa', approvalHierarchy.staff_fa).label}</p>
                        <p className="text-xs text-muted-foreground mt-2">{data.staff_fa_approved_at || getApprovalStatus('staff_fa', approvalHierarchy.staff_fa).reasoning}</p>
                      </>)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                {mode !== "view" ? "Batal" : "Tutup"}
              </Button>
              {mode !== 'view' && (
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700" 
                  disabled={createBusinessTrip.isPending || updateBusinessTrip.isPending}
                >
                  {createBusinessTrip.isPending || updateBusinessTrip.isPending 
                    ? 'Menyimpan...' 
                    : mode === 'create' 
                      ? 'Simpan Perjalanan Dinas' 
                      : 'Update Perjalanan Dinas'
                  }
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PerjalananDinasForm;
