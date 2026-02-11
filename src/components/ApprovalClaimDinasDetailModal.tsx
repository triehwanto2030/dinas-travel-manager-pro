import React, { useState, useEffect, useMemo } from 'react';
import { X, Edit2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import UserAvatarCell from './AvatarCell';
import { ExpenseDetail } from './ExpenseDetail';
import { useTripClaimExpenses, useUpdateTripClaim, useUpdateTripClaimExpenses, useCreateTripClaimExpense, useDeleteTripClaimExpenses } from '@/hooks/useTripClaims';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useCompanies } from '@/hooks/useCompanies';
import { useLineApprovals } from '@/hooks/useLineApprovals';
import { useEmployees } from '@/hooks/useEmployees';

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
    company_id: string | null;
    supervisor_id: string | null;
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

interface ExpenseItem {
  id?: string;
  date: Date | undefined;
  type: string;
  description: string;
  amount: number;
  isNew?: boolean;
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
  const { toast } = useToast();
  const { data: claimExpenses, isLoading: expensesLoading } = useTripClaimExpenses(claim?.id);
  const updateTripClaim = useUpdateTripClaim();
  const updateTripClaimExpenses = useUpdateTripClaimExpenses();
  const createTripClaimExpense = useCreateTripClaimExpense();
  const deleteTripClaimExpenses = useDeleteTripClaimExpenses();
  
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editExpenses, setEditExpenses] = useState<boolean>(false);
  const [deletedExpenseIds, setDeletedExpenseIds] = useState<string[]>([]);
  const { data: companies = [] } = useCompanies();
  const { data: lineApprovals = [] } = useLineApprovals();
  const { data: employees = [] } = useEmployees();

  // Initialize expenses from claimExpenses
  useEffect(() => {
    if (claimExpenses) {
      setExpenses(claimExpenses.map(exp => ({
        id: exp.id,
        date: exp.expense_date ? new Date(exp.expense_date) : undefined,
        type: exp.expense_type || '',
        description: exp.description || '',
        amount: exp.expense_amount || 0,
        isNew: false
      })));
    }
  }, [claimExpenses]);

  // Calculate live total from expenses state
  const liveTotal = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [expenses]);

  if (!claim) return null;
  if (!isOpen) return null;

  const employee = claim.employees;
  const trip = claim.business_trips;
  const cashAdvance = trip.cash_advance || 0;
  const remaining = cashAdvance - liveTotal;

  const companyObj = companies.find(c => c.id === employee.company_id);
  const companyName = companyObj?.name || 'N/A';
  const companyLineApproval = lineApprovals.find(la => la.company_id === employee.company_id);
  
  // Build approval hierarchy
  const supervisor = employee.supervisor_id ? employees.find(e => e.id === employee.supervisor_id) : null;

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

  const handleExpenseUpdate = (index: number, field: string, value: any) => {
    console.log('Updating expense at index', index, 'field', field, 'to value', value);
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
  };

  const handleDeleteExpense = (index: number) => {
    const expenseToDelete = expenses[index];
    if (expenseToDelete.id && !expenseToDelete.isNew) {
      setDeletedExpenseIds([...deletedExpenseIds, expenseToDelete.id]);
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const handleAddExpense = () => {
    setExpenses([...expenses, {
      date: undefined,
      type: '',
      description: '',
      amount: 0,
      isNew: true
    }]);
  };

  const handleSaveExpenses = async () => {
    try {
      // Handle existing expenses (update)
      const existingExpenses = expenses.filter(exp => exp.id && !exp.isNew);
      for (const expense of existingExpenses) {
        console.log('Updating existing expense:', expense);
        await updateTripClaimExpenses.mutateAsync({
          id: expense.id!,
          expense_amount: expense.amount,
          expense_type: expense.type,
          description: expense.description,
          expense_date: expense.date ? formatLocalDate(expense.date) : null
        });
      }

      // Handle new expenses (create)
      const newExpenses = expenses.filter(exp => exp.isNew);
      if (newExpenses.length > 0) {
        const newExpenseData = newExpenses.map(exp => ({
          expense_date: exp.date ? formatLocalDate(exp.date) : null,
          expense_type: exp.type,
          description: exp.description,
          expense_amount: exp.amount,
          trip_claim_id: claim.id
        }));
        await createTripClaimExpense.mutateAsync(newExpenseData);
      }

      // Update total amount in trip_claims
      await updateTripClaim.mutateAsync({
        id: claim.id,
        total_amount: liveTotal
      });

      // Handle deleted expenses
      if (deletedExpenseIds.length > 0) {
        for (const expId of deletedExpenseIds) {
          deleteTripClaimExpenses.mutate(expId);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['trip_claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim_expenses', claim.id] });
      
      toast({ title: "Berhasil!", description: "Data pengeluaran berhasil disimpan" });
      setIsEditing(false);
      setEditExpenses(false);
    } catch (error) {
      console.error('Error saving expenses:', error);
      toast({ title: "Error!", description: "Gagal menyimpan data pengeluaran", variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    // Reset to original data
    if (claimExpenses) {
      setExpenses(claimExpenses.map(exp => ({
        id: exp.id,
        date: exp.expense_date ? new Date(exp.expense_date) : undefined,
        type: exp.expense_type || '',
        description: exp.description || '',
        amount: exp.expense_amount || 0,
        isNew: false
      })));
    }
    setIsEditing(false);
    setEditExpenses(false);
    setDeletedExpenseIds([]);
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

  const isSaving = updateTripClaimExpenses.isPending || updateTripClaim.isPending || createTripClaimExpense.isPending;
  
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Perusahaan:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{companyName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Cost Center:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{companyName}</p>
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
                
                {/* Detail Pengeluaran - Editable with ExpenseDetail */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Detail Pengeluaran</h3>
                    <div className="flex gap-2">
                      {isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddExpense}
                          disabled={isSaving}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Pengeluaran
                        </Button>
                      )}
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            Batal
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveExpenses}
                            disabled={isSaving}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {setIsEditing(true); setEditExpenses(true);}}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {expensesLoading ? (
                    <p className="text-sm text-gray-500">Memuat data pengeluaran...</p>
                  ) : (
                    <div className="space-y-3">
                      {expenses.length > 0 ? (
                        expenses.map((expense, index) => (
                          <ExpenseDetail 
                            key={expense.id || `new-${index}`}
                            index={index} 
                            disabled={!isEditing} 
                            expense={expense} 
                            updateExp={handleExpenseUpdate}
                            deleteExp={handleDeleteExpense}
                            onlyOne={expenses.length <= 1}
                          />
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada detail pengeluaran</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Summary - Uses liveTotal for real-time updates */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cash Advance</p>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(cashAdvance)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Klaim</p>
                    <p className="text-lg font-semibold text-purple-600">{formatCurrency(liveTotal)}</p>
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

            {/* Line Approval */}
            {companyLineApproval && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Line Approval</h3>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {supervisor && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Atasan</p>
                        <div className="flex items-center gap-2 mt-2">
                          <UserAvatarCell employeeUsed={supervisor} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{supervisor.name}</p>
                              <p className="text-xs text-gray-500">{supervisor.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                      </div>
                    )}
                    {companyLineApproval.staff_ga && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Staff GA</p>
                        <div className="flex items-center gap-2 mt-2">
                          <UserAvatarCell employeeUsed={companyLineApproval.staff_ga} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{companyLineApproval.staff_ga.name}</p>
                              <p className="text-xs text-gray-500">{companyLineApproval.staff_ga.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                      </div>
                    )}
                    {companyLineApproval.hr_manager && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">HR Manager</p>
                        <div className="flex items-center gap-2 mt-2">
                          <UserAvatarCell employeeUsed={companyLineApproval.hr_manager} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{companyLineApproval.hr_manager.name}</p>
                              <p className="text-xs text-gray-500">{companyLineApproval.hr_manager.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                      </div>
                    )}
                    {companyLineApproval.bod && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">BOD</p>
                        <div className="flex items-center gap-2 mt-2">
                          <UserAvatarCell employeeUsed={companyLineApproval.bod} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{companyLineApproval.bod.name}</p>
                              <p className="text-xs text-gray-500">{companyLineApproval.bod.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                      </div>
                    )}
                    {companyLineApproval.staff_fa && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Staff FA</p>
                        <div className="flex items-center gap-2 mt-2">
                          <UserAvatarCell employeeUsed={companyLineApproval.staff_fa} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{companyLineApproval.staff_fa.name}</p>
                              <p className="text-xs text-gray-500">{companyLineApproval.staff_fa.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer with Approve/Reject buttons */}
          <div className="p-6 border-t flex justify-between">
            <Button variant="outline" onClick={onClose} disabled={editExpenses}>Tutup</Button>
            {claim.status === 'Submitted' && (
              <div className="flex gap-2">
                <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)} disabled={updateTripClaim.isPending || editExpenses}>
                  Tolak
                </Button>
                <Button onClick={handleApproveClick} disabled={updateTripClaim.isPending || editExpenses} className="bg-green-600 hover:bg-green-700">
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
