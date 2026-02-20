import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTripClaimExpenses } from '@/hooks/useTripClaims';
import UserAvatarCell from './AvatarCell';
import { ExpenseDetail } from './ExpenseDetail';
import { useCompanies } from '@/hooks/useCompanies';
import { useLineApprovals } from '@/hooks/useLineApprovals';
import { useEmployees } from '@/hooks/useEmployees';

interface ClaimDinasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimData: any;
}

const ClaimDinasDetailModal: React.FC<ClaimDinasDetailModalProps> = ({ isOpen, onClose, claimData }) => {
  if (!isOpen || !claimData) return null;

  const { data: claimExpenses, isLoading, error } = useTripClaimExpenses(claimData.id);
  const { data: companies = [] } = useCompanies();
  const { data: lineApprovals = [] } = useLineApprovals();
  const { data: employees = [] } = useEmployees();
  const employee = claimData.employees || {};
  const trip = claimData.business_trips || {};
  const companyObj = companies.find((c: any) => c.id === employee.company_id);
  const companyName = companyObj?.name || 'N/A';
  const companyLineApproval = lineApprovals.find(la => la.company_id === claimData?.employees?.company_id);
  
  // Build approval hierarchy
  const supervisor = employee.supervisor_id ? employees.find(e => e.id === employee.supervisor_id) : null;

  const cashAdvance = trip.cash_advance || 0;
  const totalAmount = claimData.total_amount || 0;
  const remaining = cashAdvance - totalAmount;

  console.log('Claim Data:', claimData);

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

  const getApprovalStatus = (step: string, pic: any) => {
    const currStep = claimData?.current_approval_step;
    const reject = claimData?.rejected_by;

    const variableMap: Record<string, keyof any> = {
      supervisor: 'supervisor_approved_by',
      staff_ga: 'staff_ga_approved_by',
      spv_ga: 'spv_ga_approved_by',
      hr_manager: 'hr_manager_approved_by',
      bod: 'bod_approved_by',
      staff_fa: 'staff_fa_approved_by',
    };

    const approvalBy = variableMap[step] ? claimData[variableMap[step]] : null;
    
    if (!approvalBy) {
      if (reject && reject === pic.id) {
        return { class: 'bg-red-100 dark:bg-red-900', label: 'Rejected' };
      } else if (currStep === step) {
        return { class: 'bg-yellow-100 dark:bg-yellow-900', label: 'Pending' };
      }
    } else {
      return { class: 'bg-green-100 dark:bg-green-900', label: 'Approved' };
    }

    return { class: 'bg-gray-50 dark:bg-gray-700', label: '' };
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Error fetching claim expenses:', error);
    return <div>Error loading claim expenses. Please try again later.</div>;
  }

  // Convert claimExpenses to format expected by ExpenseDetail
  const expensesForDisplay = claimExpenses?.map(exp => ({
    date: exp.expense_date ? new Date(exp.expense_date) : undefined,
    type: exp.expense_type || '',
    description: exp.description || '',
    amount: exp.expense_amount || 0
  })) || [];

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
              
              {claimData.rejection_reason && (
                <div className="mb-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Alasan Penolakan:</p>
                  <p className="font-medium text-red-600 dark:text-red-400">{claimData.rejection_reason}</p>
                </div>
              )}
              
              {/* Detail Pengeluaran - Display Only using ExpenseDetail */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Detail Pengeluaran</h3>
                <div className="space-y-3">
                  {expensesForDisplay.length > 0 ? (
                    expensesForDisplay.map((expense, index) => (
                      <ExpenseDetail 
                        key={index}
                        index={index} 
                        disabled={true} 
                        expense={expense} 
                        onlyOne={true}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada detail pengeluaran</p>
                  )}
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

          {companyLineApproval && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Line Approval</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {supervisor && (
                    <div className={`p-3 rounded-lg ${getApprovalStatus('supervisor', supervisor).class}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Atasan</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={supervisor} classname="w-8 h-8">
                          <div>
                            <p className="font-medium text-sm">{supervisor.name}</p>
                            <p className="text-xs text-gray-500">{supervisor.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('supervisor', supervisor).label}</p>
                      <p className="text-xs text-muted-foreground">{claimData.supervisor_approved_at}</p>
                    </div>
                  )}
                  {companyLineApproval.staff_ga && (
                    <div className={`p-3 rounded-lg ${getApprovalStatus('staff_ga', companyLineApproval.staff_ga).class}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Staff GA</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={companyLineApproval.staff_ga} classname="w-8 h-8">
                          <div>
                            <p className="font-medium text-sm">{companyLineApproval.staff_ga.name}</p>
                            <p className="text-xs text-gray-500">{companyLineApproval.staff_ga.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('staff_ga', companyLineApproval.staff_ga).label}</p>
                      <p className="text-xs text-muted-foreground">{claimData.staff_ga_approved_at}</p>
                    </div>
                  )}
                  {companyLineApproval.spv_ga && (
                    <div className={`p-3 rounded-lg ${getApprovalStatus('spv_ga', companyLineApproval.spv_ga).class}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SPV GA</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={companyLineApproval.spv_ga} classname="w-8 h-8">
                          <div>
                            <p className="font-medium text-sm">{companyLineApproval.spv_ga.name}</p>
                            <p className="text-xs text-gray-500">{companyLineApproval.spv_ga.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('spv_ga', companyLineApproval.spv_ga).label}</p>
                      <p className="text-xs text-muted-foreground">{claimData.spv_ga_approved_at}</p>
                    </div>
                  )}
                  {companyLineApproval.hr_manager && (
                    <div className={`p-3 rounded-lg ${getApprovalStatus('hr_manager', companyLineApproval.hr_manager).class}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">HR Manager</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={companyLineApproval.hr_manager} classname="w-8 h-8">
                          <div>
                            <p className="font-medium text-sm">{companyLineApproval.hr_manager.name}</p>
                            <p className="text-xs text-gray-500">{companyLineApproval.hr_manager.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('hr_manager', companyLineApproval.hr_manager).label}</p>
                      <p className="text-xs text-muted-foreground">{claimData.hr_manager_approved_at}</p>
                    </div>
                  )}
                  {companyLineApproval.bod && (
                    <div className={`p-3 rounded-lg ${getApprovalStatus('bod', companyLineApproval.bod).class}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">BOD</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={companyLineApproval.bod} classname="w-8 h-8">
                          <div>
                            <p className="font-medium text-sm">{companyLineApproval.bod.name}</p>
                            <p className="text-xs text-gray-500">{companyLineApproval.bod.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('bod', companyLineApproval.bod).label}</p>
                      <p className="text-xs text-muted-foreground">{claimData.bod_approved_at}</p>
                    </div>
                  )}
                  {companyLineApproval.staff_fa && (
                    <div className={`p-3 rounded-lg ${getApprovalStatus('staff_fa', companyLineApproval.staff_fa).class}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Staff FA</p>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatarCell employeeUsed={companyLineApproval.staff_fa} classname="w-8 h-8">
                          <div>
                            <p className="font-medium text-sm">{companyLineApproval.staff_fa.name}</p>
                            <p className="text-xs text-gray-500">{companyLineApproval.staff_fa.position}</p>
                          </div>
                        </UserAvatarCell>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus('staff_fa', companyLineApproval.staff_fa).label}</p>
                      <p className="text-xs text-muted-foreground">{claimData.staff_fa_approved_at}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
