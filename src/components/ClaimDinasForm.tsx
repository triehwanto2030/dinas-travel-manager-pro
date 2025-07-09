
import React, { useState, useRef } from 'react';
import { X, Plus, Upload, Calendar, User, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface ClaimDinasFormProps {
  isOpen: boolean;
  onClose: () => void;
  tripData?: any;
}

const ClaimDinasForm: React.FC<ClaimDinasFormProps> = ({ isOpen, onClose, tripData }) => {
  const [claimDate, setClaimDate] = useState('');
  const [claimType, setClaimType] = useState('');
  const [description, setDescription] = useState('');
  const [expenses, setExpenses] = useState([
    { date: '', type: '', description: '', amount: 0 }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Use tripData if provided, otherwise use mock data
  const data = tripData || {
    employee: {
      name: 'Lisa Anderson',
      id: 'EMP006',
      grade: '2A',
      position: 'Specialist',
      department: 'Sales',
      costCenter: 'CC001',
      avatar: ''
    },
    destination: 'Malang',
    startDate: '06 Jul 2025',
    endDate: '07 Jul 2025',
    budget: 1500000
  };

  // Create trip info from the data
  const tripInfo = {
    number: `PD${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}01`,
    destination: data.destination,
    startDate: data.startDate,
    endDate: data.endDate,
    duration: '1 hari',
    cashAdvance: data.budget || 1500000
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const addExpenseRow = () => {
    setExpenses([...expenses, { date: '', type: '', description: '', amount: 0 }]);
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

  const handleSubmit = () => {
    toast({
      title: "Berhasil!",
      description: "Claim dinas berhasil diajukan",
    });
    onClose();
  };

  if (!isOpen) return null;

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
                      <AvatarImage src={data.employee.avatar} />
                      <AvatarFallback>{data.employee.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">{data.employee.name}</h4>
                      <p className="text-sm text-gray-500">NIK: {data.employee.id} <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">{data.employee.grade}</span></p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Grade:</p>
                      <p className="font-medium">{data.employee.grade}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Jabatan:</p>
                      <p className="font-medium">{data.employee.position}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Departemen:</p>
                      <p className="font-medium">{data.employee.department}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cost Center:</p>
                      <p className="font-medium">{data.employee.costCenter || 'CC001'}</p>
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
                        <p className="text-gray-500">Tujuan:</p>
                        <p className="font-medium">{tripInfo.destination}</p>
                      </div>
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

            {/* Informasi Claim */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Informasi Claim</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="claimDate">Tanggal Claim</Label>
                    <Input
                      id="claimDate"
                      type="date"
                      value={claimDate}
                      onChange={(e) => setClaimDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="claimType">Jenis Claim</Label>
                    <Select value={claimType} onValueChange={setClaimType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis claim" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="accommodation">Akomodasi</SelectItem>
                        <SelectItem value="meal">Makan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Keterangan (Opsional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Catatan tambahan..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        <Input
                          type="date"
                          value={expense.date}
                          onChange={(e) => updateExpense(index, 'date', e.target.value)}
                        />
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
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            Ajukan Claim
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClaimDinasForm;
