import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ExpenseDetail } from './ExpenseDetail';
import { useTripClaimExpenses } from '@/hooks/useTripClaims';

interface ClaimDinasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimData: any;
}

const ClaimDinasDetailModal: React.FC<ClaimDinasDetailModalProps> = ({ isOpen, onClose, claimData }) => {
  if (!isOpen || !claimData) return null;
  const [expenses, setExpenses] = React.useState([
    { id: '', date: undefined, type: '', description: '', amount: 0 }
  ]);
  const { data: claimExpenses, isLoading, error } = useTripClaimExpenses(claimData.id);
  const [editExpenses, setEditExpenses] = React.useState(true);
  console.log('Claim Expenses Data in Modal:', claimExpenses);

  const employee = claimData.employees || {};
  const trip = claimData.business_trips || {};
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { class: string; label: string }> = {
      'Draft': { class: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'Submitted': { class: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
      'Approved': { class: 'bg-green-100 text-green-800', label: 'Approved' },
      'Rejected': { class: 'bg-red-100 text-red-800', label: 'Rejected' },
      'Paid': { class: 'bg-blue-100 text-blue-800', label: 'Paid' }
    };
    
    const config = statusConfig[status] || statusConfig.Draft;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  setExpenses(claimExpenses.map(expense => ({
    id: expense.id,
    date: expense.expense_date,
    type: expense.expense_type,
    description: expense.description,
    amount: expense.expense_amount,
  }))
);

  const cashAdvance = trip.cash_advance || 0;
  const totalAmount = claimData.total_amount || 0;
  const remaining = cashAdvance - totalAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detail Claim Dinas</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {claimData.claim_number || `CL-${new Date(claimData.created_at).getTime().toString().slice(-6)}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(claimData.status)}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informasi Karyawan */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Informasi Karyawan</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={employee.photo_url || ''} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {employee.name ? employee.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{employee.name || 'N/A'}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {employee.employee_id || 'N/A'} 
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">
                        {employee.grade || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Jabatan:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{employee.position || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Departemen:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{employee.department || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detail Perjalanan */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Detail Perjalanan</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">No. Perjalanan:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{trip.trip_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Tujuan:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{trip.destination || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Keperluan:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{trip.purpose || 'N/A'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Tanggal Berangkat:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(trip.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Tanggal Pulang:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(trip.end_date)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Transportasi:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{trip.transportation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Akomodasi:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{trip.accommodation || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail Klaim */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Detail Klaim</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tanggal Pengajuan:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(claimData.submitted_at || claimData.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status:</p>
                  {getStatusBadge(claimData.status)}
                </div>
              </div>

              {claimData.notes && (
                <div className="mb-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Catatan:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{claimData.notes}</p>
                </div>
              )}
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Detail Pengeluaran</h3>
                  <Button
                    onClick={() => setEditExpenses(prev => !prev)} // Toggle editExpenses state
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editExpenses ? 'Edit' : 'Selesai'}
                  </Button>
                </div>
                <div className="space-y-4">
                  {expenses.map((exp: any, index: number) => (
                    <ExpenseDetail expense={exp} index={index} disabled={editExpenses} onlyOne={(expenses.length <= 1)} />
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cash Advance</p>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(cashAdvance)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Klaim</p>
                  <p className="text-lg font-semibold text-purple-600">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sisa/Pengembalian</p>
                  <p className={`text-lg font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(remaining))}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{remaining >= 0 ? 'Sisa' : 'Kekurangan'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
};

export default ClaimDinasDetailModal;
