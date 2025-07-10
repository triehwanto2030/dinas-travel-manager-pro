
import React, { useState, useRef } from 'react';
import { X, Plus, Upload, Calendar, User, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { useCreateTripClaim } from '@/hooks/useTripClaims';

interface ClaimDinasFormProps {
  isOpen: boolean;
  onClose: () => void;
  tripData?: any;
}

const ClaimDinasForm: React.FC<ClaimDinasFormProps> = ({ isOpen, onClose, tripData }) => {
  const [expenses, setExpenses] = useState([
    { date: undefined, type: '', description: '', amount: 0 }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createTripClaim = useCreateTripClaim();

  // Early return if form is not open
  if (!isOpen) return null;

  // Handle case when tripData is not provided or incomplete
  if (!tripData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-600 mb-4">Data perjalanan dinas tidak ditemukan.</p>
          <Button onClick={onClose} className="w-full">
            Tutup
          </Button>
        </div>
      </div>
    );
  }

  // Safely extract data from tripData
  const employee = tripData.employees || {};
  const destination = tripData.destination || 'N/A';
  const purpose = tripData.purpose || 'N/A';
  const startDate = tripData.start_date ? new Date(tripData.start_date).toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }) : 'N/A';
  const endDate = tripData.end_date ? new Date(tripData.end_date).toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }) : 'N/A';
  const estimatedBudget = tripData.estimated_budget || 0;

  // Create trip info from the data
  const tripInfo = {
    number: `PD${new Date(tripData.created_at).getFullYear()}${String(new Date(tripData.created_at).getMonth() + 1).padStart(2, '0')}${String(new Date(tripData.created_at).getDate()).padStart(2, '0')}01`,
    destination: destination,
    purpose: purpose,
    startDate: startDate,
    endDate: endDate,
    duration: calculateDuration(tripData.start_date, tripData.end_date),
    cashAdvance: estimatedBudget
  };

  function calculateDuration(start: string, end: string): string {
    if (!start || !end) return '0 hari';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} hari`;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const addExpenseRow = () => {
    setExpenses([...expenses, { date: undefined, type: '', description: '', amount: 0 }]);
  };

  const updateExpense = (index: number, field: string, value: any) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const remaining = tripInfo.cashAdvance - totalExpenses;

  const handleSubmit = async () => {
    try {
      // Validate expenses
      const validExpenses = expenses.filter(exp => exp.type && exp.description && exp.amount > 0);
      
      if (validExpenses.length === 0) {
        toast({
          title: "Error!",
          description: "Minimal harus ada satu pengeluaran yang valid",
          variant: "destructive",
        });
        return;
      }

      // Create claim data
      const claimData = {
        employee_id: tripData.employee_id,
        trip_id: tripData.id,
        total_amount: totalExpenses,
        status: 'Submitted' as const,
        submitted_at: new Date().toISOString()
      };

      await createTripClaim.mutateAsync(claimData);

      toast({
        title: "Berhasil!",
        description: "Claim dinas berhasil diajukan dan akan masuk ke proses approval",
      });
      onClose();
    } catch (error) {
      console.error('Error creating claim:', error);
      toast({
        title: "Error!",
        description: "Gagal mengajukan claim dinas",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Buat Claim Perjalanan Dinas</h2>
            <h3 className="text-lg text-gray-700 mt-1">Detail Perjalanan Dinas & Klaim</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Employee Info & Trip Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informasi Karyawan */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Informasi Karyawan</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={employee.avatar_url || ''} />
                      <AvatarFallback>
                        {employee.name ? employee.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'N/A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">{employee.name || 'N/A'}</h4>
                      <p className="text-sm text-gray-500">
                        NIK: {employee.id || 'N/A'} 
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">
                          {employee.grade || 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Grade:</p>
                      <p className="font-medium">{employee.grade || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Jabatan:</p>
                      <p className="font-medium">{employee.position || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Departemen:</p>
                      <p className="font-medium">{employee.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cost Center:</p>
                      <p className="font-medium">{employee.companies?.name || 'N/A'} - {employee.department || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detail Perjalanan */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Detail Perjalanan</h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500">No. Perjalanan:</p>
                        <p className="font-medium">{tripInfo.number}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tujuan Dinas:</p>
                        <p className="font-medium">{tripInfo.destination}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Keperluan:</p>
                      <p className="font-medium">{tripInfo.purpose}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500">Tanggal Berangkat:</p>
                        <p className="font-medium">{tripInfo.startDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tanggal Pulang:</p>
                        <p className="font-medium">{tripInfo.endDate}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500">Lama Perjalanan:</p>
                        <p className="font-medium">{tripInfo.duration}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cash Advance:</p>
                        <p className="font-medium">{formatCurrency(tripInfo.cashAdvance)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detail Pengeluaran */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Detail Pengeluaran</h3>
                  <Button variant="outline" size="sm" onClick={addExpenseRow}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Baris
                  </Button>
                </div>

                <div className="space-y-4">
                  {expenses.map((expense, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                      <div className="md:col-span-2">
                        <Label>Tanggal</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !expense.date && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {expense.date ? format(expense.date, "dd/MM/yyyy") : "Pilih tanggal"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={expense.date}
                              onSelect={(date) => updateExpense(index, 'date', date)}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="md:col-span-3">
                        <Label>Jenis Biaya</Label>
                        <Select value={expense.type} onValueChange={(value) => updateExpense(index, 'type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis biaya" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="meal">Makan</SelectItem>
                            <SelectItem value="accommodation">Akomodasi</SelectItem>
                            <SelectItem value="other">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-4">
                        <Label>Keterangan</Label>
                        <Input
                          placeholder="Detail pengeluaran..."
                          value={expense.description}
                          onChange={(e) => updateExpense(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Nominal</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={expense.amount || ''}
                          onChange={(e) => updateExpense(index, 'amount', Number(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        {expenses.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeExpense(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Cash Advance</p>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(tripInfo.cashAdvance)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total Biaya</p>
                    <p className="text-lg font-semibold text-purple-600">{formatCurrency(totalExpenses)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Sisa/Pengembalian</p>
                    <p className={`text-lg font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(remaining))}
                    </p>
                    <p className="text-xs text-gray-500">{remaining >= 0 ? 'Sisa' : 'Kekurangan'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Bukti */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Upload Bukti (Struk/Receipt)</h3>
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Klik untuk upload atau drag & drop file</p>
                  <p className="text-sm text-gray-500">PNG, JPG, PDF hingga 10MB</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">File yang diupload:</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={createTripClaim.isPending}
          >
            {createTripClaim.isPending ? 'Mengajukan...' : 'Ajukan Claim'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClaimDinasForm;
