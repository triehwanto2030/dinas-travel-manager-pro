import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, User, Building, DollarSign, FileText, Receipt, Plane, Hotel, Edit2 } from 'lucide-react';
import UserAvatarCell from './AvatarCell';
import { useTripClaimExpenses, useUpdateTripClaim, useUpdateTripClaimExpenses } from '@/hooks/useTripClaims';
import { useQueryClient } from '@tanstack/react-query';

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
}

const ApprovalClaimDinasDetailModal: React.FC<ApprovalClaimDinasDetailModalProps> = ({
  isOpen,
  onClose,
  claim
}) => {
  const queryClient = useQueryClient();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateString: string | null) => {
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
      'Submitted': { class: 'bg-yellow-100 text-yellow-800', label: 'Menunggu Approval' },
      'Approved': { class: 'bg-green-100 text-green-800', label: 'Disetujui' },
      'Rejected': { class: 'bg-red-100 text-red-800', label: 'Ditolak' },
      'Paid': { class: 'bg-blue-100 text-blue-800', label: 'Dibayar' }
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
    // Update each expense in the database
    for (const expense of expenses) {
      await updateTripClaimExpenses.mutateAsync({
        id: expense.id,
        expense_amount: expense.expense_amount
      });
    }

    // Update the total_amount in trip_claims
    const newTotal = expenses.reduce((sum, exp) => sum + (exp.expense_amount || 0), 0);
    await updateTripClaim.mutateAsync({
      id: claim.id,
      total_amount: newTotal
    });

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['trip_claims'] });
    queryClient.invalidateQueries({ queryKey: ['claim_expenses', claim.id] });

    setIsEditing(false);
  };

  const cashAdvance = claim.business_trips.cash_advance || 0;
  const displayTotal = isEditing ? totalAmount : (claim.total_amount || 0);
  const difference = cashAdvance - displayTotal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Detail Claim Dinas
            {getStatusBadge(claim.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Claim Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Nomor Claim</p>
              <p className="text-lg font-semibold">{claim.claim_number || '-'}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Nomor Perjalanan</p>
              <p className="text-lg font-semibold">{claim.business_trips.trip_number}</p>
            </div>
          </div>

          {/* Employee Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Informasi Karyawan
            </h3>
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <UserAvatarCell employeeUsed={claim.employees} classname="w-16 h-16">
                <div className="flex-1">
                  <p className="text-lg font-semibold">{claim.employees?.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">ID: {claim.employees?.employee_id || 'N/A'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{claim.employees?.grade || 'N/A'}</Badge>
                    <span className="text-sm">{claim.employees?.position || 'N/A'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Building className="w-3 h-3 inline mr-1" />
                    {claim.employees?.department || 'N/A'}
                  </p>
                </div>
              </UserAvatarCell>
            </div>
          </div>

          <Separator />

          {/* Trip Details */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Detail Perjalanan
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Tujuan</p>
                <p className="font-medium">{claim.business_trips.destination}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Tujuan Perjalanan</p>
                <p className="font-medium">{claim.business_trips.purpose || '-'}</p>
              </div>
            </div>
          </div>

          {/* Period */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Periode Perjalanan
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                <p className="font-medium">{formatDate(claim.business_trips.start_date)}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                <p className="font-medium">{formatDate(claim.business_trips.end_date)}</p>
              </div>
            </div>
          </div>

          {/* Accommodation & Transportation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Hotel className="w-4 h-4" />
                Akomodasi
              </h3>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium capitalize">{claim.business_trips.accommodation || '-'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Transportasi
              </h3>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium capitalize">{claim.business_trips.transportation || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detail Pengeluaran - Editable */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Detail Pengeluaran
              </h3>
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveExpenses();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                disabled={updateTripClaimExpenses.isPending || updateTripClaim.isPending}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? (updateTripClaimExpenses.isPending || updateTripClaim.isPending ? 'Menyimpan...' : 'Simpan') : 'Edit'}
              </button>
            </div>
            
            {expensesLoading ? (
              <p className="text-sm text-muted-foreground">Memuat data pengeluaran...</p>
            ) : expenses.length > 0 ? (
              <div className="space-y-3">
                {expenses.map((expense, index) => (
                  <div key={expense.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tanggal</p>
                        <p className="font-medium">{formatShortDate(expense.expense_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Jenis</p>
                        <p className="font-medium">{getExpenseTypeLabel(expense.expense_type)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Keterangan</p>
                        <p className="font-medium">{expense.description || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Jumlah</p>
                        {isEditing ? (
                          <Input
                            type="text"
                            value={expense.expense_amount.toLocaleString('id-ID')}
                            onChange={(e) => handleAmountChange(index, e.target.value)}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <p className="font-medium">{formatCurrency(expense.expense_amount)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Total Pengeluaran */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex justify-between items-center">
                  <span className="font-medium">Total Pengeluaran</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(displayTotal)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada detail pengeluaran</p>
            )}
          </div>

          <Separator />

          {/* Financial Summary */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ringkasan Keuangan
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Cash Advance</span>
                <span className="font-semibold">{formatCurrency(cashAdvance)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Total Claim</span>
                <span className="font-semibold">{formatCurrency(displayTotal)}</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                difference >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <span className="font-medium">
                  {difference >= 0 ? 'Sisa Cash Advance' : 'Kekurangan'}
                </span>
                <span className={`text-lg font-bold ${
                  difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(Math.abs(difference))}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Date */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Tanggal Pengajuan
            </h3>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="font-medium">
                {claim.submitted_at ? formatDate(claim.submitted_at) : '-'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {claim.notes && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Catatan
              </h3>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm">{claim.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalClaimDinasDetailModal;
