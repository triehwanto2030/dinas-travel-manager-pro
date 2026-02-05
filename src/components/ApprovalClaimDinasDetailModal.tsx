import React, { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import UserAvatarCell from './AvatarCell';
import { useTripClaimExpenses, useUpdateTripClaim, useUpdateTripClaimExpenses } from '@/hooks/useTripClaims';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface TripClaim {
  id: string;
  claim_number: string | null;
  total_amount: number;
  status: string;
  submitted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employees: {
    id: string;
    name: string;
    employee_id: string;
    position: string | null;
    department: string | null;
    grade: string | null;
    photo_url: string | null;
    email: string | null;
    phone: string | null;
  };
  business_trips: {
    id: string;
    destination: string;
    purpose: string | null;
    start_date: string;
    end_date: string;
    cash_advance: number | null;
    trip_number: string;
    accommodation: string | null;
    transportation: string | null;
    created_at: string;
  };
}

interface ApprovalClaimDinasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: TripClaim | null;
  onApprove?: (claimId: string) => void;
  onReject?: (claimId: string, reason: string) => void;
}

const ApprovalClaimDinasDetailModal: React.FC<ApprovalClaimDinasDetailModalProps> = ({
  isOpen,
  onClose,
  claim,
  onApprove,
  onReject
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: claimExpenses, isLoading: expensesLoading } = useTripClaimExpenses(claim?.id);
  const updateTripClaim = useUpdateTripClaim();
  const updateTripClaimExpenses = useUpdateTripClaimExpenses();
  
  const [expenses, setExpenses] = useState<Array<{
    id: string;
    expense_date: string | null;
    expense_type: string | null;
    description: string | null;
    expense_amount: number;
  }>>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (claimExpenses) {
      setExpenses(claimExpenses.map(exp => ({
        id: exp.id,
        expense_date: exp.expense_date,
        expense_type: exp.expense_type,
        description: exp.description,
        expense_amount: exp.expense_amount || 0
      })));
    }
  }, [claimExpenses]);

  useEffect(() => {
    const newTotal = expenses.reduce((sum, exp) => sum + (exp.expense_amount || 0), 0);
    setTotalAmount(newTotal);
  }, [expenses]);

  if (!claim) return null;
  if (!isOpen) return null;

  const employee = claim.employees;
  const trip = claim.business_trips;
  const cashAdvance = trip.cash_advance || 0;
  const displayTotal = isEditing ? totalAmount : (claim.total_amount || 0);
  const remaining = cashAdvance - displayTotal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
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

  const getExpenseTypeLabel = (type: string | null) => {
    const types: Record<string, string> = {
      'transport': 'Transportasi',
      'accommodation': 'Akomodasi',
      'meals': 'Makan',
      'other': 'Lainnya'
    };
    return types[type || ''] || type || '-';
  };

  const handleAmountChange = (index: number, value: string) => {
    const numValue = parseInt(value.replace(/\D/g, '')) || 0;
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], expense_amount: numValue };
    setExpenses(newExpenses);
  };

  const handleSaveExpenses = async () => {
    try {
      for (const expense of expenses) {
        await updateTripClaimExpenses.mutateAsync({
          id: expense.id,
          expense_amount: expense.expense_amount
        });
      }
      const newTotal = expenses.reduce((sum, exp) => sum + (exp.expense_amount || 0), 0);
      await updateTripClaim.mutateAsync({
        id: claim.id,
        total_amount: newTotal
      });
      queryClient.invalidateQueries({ queryKey: ['trip_claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim_expenses', claim.id] });
      toast({ title: "Berhasil!", description: "Data pengeluaran berhasil disimpan" });
      setIsEditing(false);
    } catch (error) {
      toast({ title: "Error!", description: "Gagal menyimpan data pengeluaran", variant: "destructive" });
    }
  };

  const handleApproveClick = async () => {
    try {
      await updateTripClaim.mutateAsync({ id: claim.id, status: 'Approved' });
      toast({ title: "Berhasil!", description: "Claim dinas telah disetujui" });
      queryClient.invalidateQueries({ queryKey: ['trip_claims'] });
      onClose();
    } catch (error) {
      toast({ title: "Error!", description: "Gagal menyetujui claim dinas", variant: "destructive" });
    }
  };

  const handleRejectClick = async () => {
    if (!rejectReason.trim()) {
      toast({ title: "Error!", description: "Alasan penolakan harus diisi", variant: "destructive" });
      return;
    }
    try {
      await updateTripClaim.mutateAsync({ id: claim.id, status: 'Rejected', rejection_reason: rejectReason });
      toast({ title: "Berhasil!", description: "Claim dinas telah ditolak" });
      queryClient.invalidateQueries({ queryKey: ['trip_claims'] });
      setIsRejectDialogOpen(false);
      setRejectReason('');
      onClose();
    } catch (error) {
      toast({ title: "Error!", description: "Gagal menolak claim dinas", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detail Claim Dinas</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {claim.claim_number || `CL-${new Date(claim.created_at).getTime().toString().slice(-6)}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(claim.status)}
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
                    <UserAvatarCell employeeUsed={employee} classname="w-16 h-16">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{employee.name || 'N/A'}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {employee.employee_id || 'N/A'} 
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">
                            {employee.grade || 'N/A'}
                          </span>
                        </p>
                      </div>
                    </UserAvatarCell>
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
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(claim.submitted_at || claim.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status:</p>
                    {getStatusBadge(claim.status)}
                  </div>
                </div>

                {claim.notes && (
                  <div className="mb-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Catatan:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{claim.notes}</p>
                  </div>
                )}
                
                {/* Detail Pengeluaran - Editable */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Detail Pengeluaran</h3>
                    <button
                      onClick={() => isEditing ? handleSaveExpenses() : setIsEditing(true)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      disabled={updateTripClaimExpenses.isPending || updateTripClaim.isPending}
                    >
                      <Edit2 className="w-4 h-4" />
                      {isEditing ? (updateTripClaimExpenses.isPending || updateTripClaim.isPending ? 'Menyimpan...' : 'Simpan') : 'Edit'}
                    </button>
                  </div>
                  
                  {expensesLoading ? (
                    <p className="text-sm text-gray-500">Memuat data pengeluaran...</p>
                  ) : (
                    <div className="space-y-3">
                      {expenses.length > 0 ? (
                        expenses.map((expense, index) => (
                          <div key={expense.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Tanggal</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(expense.expense_date)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Jenis</p>
                                <p className="font-medium text-gray-900 dark:text-white">{getExpenseTypeLabel(expense.expense_type)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Keterangan</p>
                                <p className="font-medium text-gray-900 dark:text-white">{expense.description || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Jumlah</p>
                                {isEditing ? (
                                  <Input
                                    type="text"
                                    value={expense.expense_amount.toLocaleString('id-ID')}
                                    onChange={(e) => handleAmountChange(index, e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                ) : (
                                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(expense.expense_amount)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada detail pengeluaran</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cash Advance</p>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(cashAdvance)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Klaim</p>
                    <p className="text-lg font-semibold text-purple-600">{formatCurrency(displayTotal)}</p>
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

          {/* Footer with Approve/Reject buttons */}
          <div className="p-6 border-t flex justify-between">
            <Button variant="outline" onClick={onClose}>Tutup</Button>
            {claim.status === 'Submitted' && (
              <div className="flex gap-2">
                <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)} disabled={updateTripClaim.isPending}>
                  Tolak
                </Button>
                <Button onClick={handleApproveClick} disabled={updateTripClaim.isPending} className="bg-green-600 hover:bg-green-700">
                  {updateTripClaim.isPending ? 'Menyetujui...' : 'Setuju'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Claim Dinas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectReason">Alasan Penolakan</Label>
              <Textarea
                id="rejectReason"
                placeholder="Masukkan alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setIsRejectDialogOpen(false); setRejectReason(''); }}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleRejectClick} disabled={!rejectReason.trim() || updateTripClaim.isPending}>
                {updateTripClaim.isPending ? 'Menolak...' : 'Tolak Claim'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovalClaimDinasDetailModal;
