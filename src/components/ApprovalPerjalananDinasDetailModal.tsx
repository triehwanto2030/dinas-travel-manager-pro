import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, User, Building, Plane, Hotel, DollarSign, FileText } from 'lucide-react';
import UserAvatarCell from './AvatarCell';
import { useUpdateBusinessTrip } from '@/hooks/useBusinessTrips';
import { useToast } from '@/hooks/use-toast';
import { useLineApprovals } from '@/hooks/useLineApprovals';
import { EmployeeWithCompany, useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface BusinessTrip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  purpose: string | null;
  cash_advance: number | null;
  status: string;
  accommodation: string | null;
  transportation: string | null;
  notes: string | null;
  trip_number: string;
  created_at: string;
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
  } | null;
  current_approval_step: string | null;
  supervisor_approved_at: string | null;
  staff_ga_approved_at: string | null;
  spv_ga_approved_at: string | null;
  hr_manager_approved_at: string | null;
  bod_approved_at: string | null;
  staff_fa_approved_at: string | null;
  supervisor_approved_by: string | null;
  staff_ga_approved_by: string | null;
  spv_ga_approved_by: string | null;
  hr_manager_approved_by: string | null;
  bod_approved_by: string | null;
  staff_fa_approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
}

interface ApprovalPerjalananDinasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: BusinessTrip | null;
}

const ApprovalPerjalananDinasDetailModal: React.FC<ApprovalPerjalananDinasDetailModalProps> = ({
  isOpen,
  onClose,
  trip
}) => {
  const queryClient = useQueryClient();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approvable, setApprovable] = useState(false);
  const updateBusinessTrip = useUpdateBusinessTrip();
  const { toast } = useToast();
  const { data: lineApprovals = [] } = useLineApprovals();
  const { data: allEmployees = [] } = useEmployees();
  const { employee: userEmp } = useAuth();
  const companyLineApproval = lineApprovals.find(la => la.company_id === trip?.employees?.company_id);

  useEffect(() => {
    const currentStep = trip?.current_approval_step;

    if (!currentStep || !userEmp || !trip) {
      setApprovable(false);
      return;
    }

    const approvableStepsMap: Record<string, keyof BusinessTrip> = {
      supervisor: 'supervisor_approved_by',
      staff_ga: 'staff_ga_approved_by',
      spv_ga: 'spv_ga_approved_by',
      hr_manager: 'hr_manager_approved_by',
      bod: 'bod_approved_by',
      staff_fa: 'staff_fa_approved_by',
    };

    const roleMap: Record<string, keyof typeof companyLineApproval> = {
      staff_ga: 'staff_ga',
      spv_ga: 'spv_ga',
      hr_manager: 'hr_manager',
      bod: 'bod',
      staff_fa: 'staff_fa',
    };

    const requiredField = approvableStepsMap[currentStep];

    if (!requiredField) {
      setApprovable(false);
      return;
    }

    // Already approved?
    const tripApproval = trip[requiredField];

    if (tripApproval !== null) {
      setApprovable(false);
      return;
    }

    // Supervisor case (special logic)
    if (currentStep === 'supervisor') {
      setApprovable(trip.employees?.supervisor_id === userEmp.id);
      return;
    }

    // Other roles
    if (!companyLineApproval) {
      setApprovable(false);
      return;
    }

    const roleKey = roleMap[currentStep];
    const assignedEmployee = roleKey && companyLineApproval
      ? companyLineApproval[roleKey] as { id: string } || null
      : null;

    setApprovable(assignedEmployee?.id === userEmp.id);

  }, [trip, userEmp, companyLineApproval]);

  if (!trip) return null;

  const roleMap: Record<string, keyof typeof companyLineApproval> = {
    staff_ga: 'staff_ga',
    spv_ga: 'spv_ga',
    hr_manager: 'hr_manager',
    bod: 'bod',
    staff_fa: 'staff_fa',
  };
  
  const approvalFlow = [
    'supervisor',
    'staff_ga',
    'spv_ga',
    'hr_manager',
    'bod',
    'staff_fa',
  ] as const;

  type Role = typeof approvalFlow[number];

  const nextRoleMap: Record<Role, Role> = {} as Record<Role, Role>;
  const previousRoleMap: Record<Role, Role> = {} as Record<Role, Role>;

  approvalFlow.forEach((role, index) => {
    nextRoleMap[role] = approvalFlow[index + 1] ?? role;      // clamp at end
    previousRoleMap[role] = approvalFlow[index - 1] ?? role;  // clamp at start
  });

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
  
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { class: string; label: string }> = {
      'Draft': { class: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'Submitted': { class: 'bg-yellow-100 text-yellow-800', label: 'Menunggu Approval' },
      'Approved': { class: 'bg-green-100 text-green-800', label: 'Disetujui' },
      'Rejected': { class: 'bg-red-100 text-red-800', label: 'Ditolak' },
      'Completed': { class: 'bg-blue-100 text-blue-800', label: 'Selesai' }
    };
    
    const config = statusConfig[status] || statusConfig.Draft;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getApprovalStatus = (step: string, pic: any) => {
    const currStep = trip?.current_approval_step;
    const reject = trip?.rejected_by;

    const variableMap: Record<string, keyof BusinessTrip> = {
      supervisor: 'supervisor_approved_by',
      staff_ga: 'staff_ga_approved_by',
      spv_ga: 'spv_ga_approved_by',
      hr_manager: 'hr_manager_approved_by',
      bod: 'bod_approved_by',
      staff_fa: 'staff_fa_approved_by',
    };

    const approvalBy = variableMap[step] ? trip[variableMap[step]] : null;
    
    if (!approvalBy) {
      if (reject && reject === pic.id) {
        return { class: 'bg-red-100', label: 'Rejected' };
      } else if (currStep === step) {
        return { class: 'bg-yellow-100', label: 'Pending' };
      }
    } else {
      return { class: 'bg-green-100', label: 'Approved' };
    }

    return { class: 'bg-muted/30', label: '' };
  };

  const approvalFieldMap: Record<Role, { approvedAt: keyof BusinessTrip; approvedBy: keyof BusinessTrip }> = {
    supervisor: { approvedAt: 'supervisor_approved_at', approvedBy: 'supervisor_approved_by' },
    staff_ga: { approvedAt: 'staff_ga_approved_at', approvedBy: 'staff_ga_approved_by' },
    spv_ga: { approvedAt: 'spv_ga_approved_at', approvedBy: 'spv_ga_approved_by' },
    hr_manager: { approvedAt: 'hr_manager_approved_at', approvedBy: 'hr_manager_approved_by' },
    bod: { approvedAt: 'bod_approved_at', approvedBy: 'bod_approved_by' },
    staff_fa: { approvedAt: 'staff_fa_approved_at', approvedBy: 'staff_fa_approved_by' },
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} hari`;
  };

  const handleApprove = async () => {
    try {
      const step = trip.current_approval_step as Role;
      if (!step) return;
      
      const fields = approvalFieldMap[step];
      if (!fields) return;
      
      console.log('Approving trip with data:', {
        id: trip.id,
        status: step !== "staff_fa" ? 'Submitted' : 'Approved',
        current_approval_step: nextRoleMap[step],
        [fields.approvedAt]: new Date().toISOString(),
        [fields.approvedBy]: userEmp?.id,
      });

      const statusToUpdate = step == "staff_ga" && (!trip.cash_advance || trip.cash_advance <= 0) ? 'Approved' :
        step !== "staff_fa" ? 'Submitted' : 'Approved';

      await updateBusinessTrip.mutateAsync({
        id: trip.id,
        status: statusToUpdate,
        ...(step !== "staff_ga" || trip.cash_advance > 0) && { current_approval_step: nextRoleMap[step] },
        [fields.approvedAt]: new Date().toISOString(),
        [fields.approvedBy]: userEmp?.id,
      });
      toast({
        title: "Berhasil!",
        description: "Perjalanan dinas telah disetujui",
      });
      queryClient.invalidateQueries({ queryKey: ['business_trips'] });
      onClose();
    } catch (error) {
      console.error('Error approving trip:', error);
      toast({
        title: "Error!",
        description: "Gagal menyetujui perjalanan dinas",
        variant: "destructive",
      });
    }
  };


  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error!",
        description: "Alasan penolakan harus diisi",
        variant: "destructive",
      });
      return;
    }
    try {
      await updateBusinessTrip.mutateAsync({
        id: trip.id,
        status: 'Rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: userEmp?.id,
        rejection_reason: rejectReason
      } as any);
      toast({
        title: "Berhasil!",
        description: "Perjalanan dinas telah ditolak",
      });
      setIsRejectDialogOpen(false);
      setRejectReason('');
      onClose();
    } catch (error) {
      console.error('Error rejecting trip:', error);
      toast({
        title: "Error!",
        description: "Gagal menolak perjalanan dinas",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Detail Perjalanan Dinas
              {getStatusBadge(trip.status)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Trip ID */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Nomor Perjalanan</p>
              <p className="text-lg font-semibold">{trip.trip_number}</p>
            </div>

            {/* Employee Info */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Informasi Karyawan
              </h3>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <UserAvatarCell employeeUsed={trip.employees} classname="w-16 h-16">
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{trip.employees?.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">ID: {trip.employees?.employee_id || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{trip.employees?.grade || 'N/A'}</Badge>
                      <span className="text-sm">{trip.employees?.position || 'N/A'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      <Building className="w-3 h-3 inline mr-1" />
                      {trip.employees?.department || 'N/A'}
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
                  <p className="font-medium">{trip.destination}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tujuan Perjalanan</p>
                  <p className="font-medium">{trip.purpose || '-'}</p>
                </div>
              </div>
            </div>

            {/* Period */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Periode
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                  <p className="font-medium">{formatDate(trip.start_date)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                  <p className="font-medium">{formatDate(trip.end_date)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Durasi</p>
                  <p className="font-medium">{calculateDuration(trip.start_date, trip.end_date)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Accommodation & Transportation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  Akomodasi
                </h3>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium capitalize">{trip.accommodation || '-'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Transportasi
                </h3>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium capitalize">{trip.transportation || '-'}</p>
                </div>
              </div>
            </div>

            {/* Cash Advance */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cash Advance
              </h3>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {trip.cash_advance ? formatCurrency(trip.cash_advance) : 'Rp 0'}
                </p>
              </div>
            </div>

            {/* Notes */}
            {trip.notes && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Catatan
                </h3>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{trip.notes}</p>
                </div>
              </div>
            )}

            {/* Line Approval */}
            {(() => {
              const supervisor = trip.employees?.supervisor_id ? allEmployees.find(e => e.id === trip.employees?.supervisor_id) : null;
              if (!companyLineApproval) return null;
              return (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Line Approval
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {supervisor && (
                      <div className={`p-3 rounded-lg ${getApprovalStatus('supervisor', supervisor).class}`}>
                        <p className="text-xs text-muted-foreground">Atasan</p>
                        <div className="flex items-center gap-2 mt-1">
                          <UserAvatarCell employeeUsed={supervisor} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{supervisor.name}</p>
                              <p className="text-xs text-muted-foreground">{supervisor.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus("supervisor", supervisor).label}</p>
                        <p className="text-xs text-muted-foreground">{trip.supervisor_approved_at}</p>
                      </div>
                    )}
                    {companyLineApproval.staff_ga && (
                      <div className={`p-3 rounded-lg ${getApprovalStatus('staff_ga', companyLineApproval.staff_ga).class}`}>
                        <p className="text-xs text-muted-foreground">Staff GA</p>
                        <div className="flex items-center gap-2 mt-1">
                          <UserAvatarCell employeeUsed={companyLineApproval.staff_ga} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{companyLineApproval.staff_ga.name}</p>
                              <p className="text-xs text-muted-foreground">{companyLineApproval.staff_ga.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus("staff_ga", companyLineApproval.staff_ga).label}</p>
                        <p className="text-xs text-muted-foreground">{trip.staff_ga_approved_at}</p>
                      </div>
                    )}
                    {companyLineApproval.spv_ga && (
                      <div className={`p-3 rounded-lg ${getApprovalStatus('spv_ga', companyLineApproval.spv_ga).class}`}>
                        <p className="text-xs text-muted-foreground">SPV GA</p>
                        <div className="flex items-center gap-2 mt-1">
                          <UserAvatarCell employeeUsed={companyLineApproval.spv_ga} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{companyLineApproval.spv_ga.name}</p>
                              <p className="text-xs text-muted-foreground">{companyLineApproval.spv_ga.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus("spv_ga", companyLineApproval.spv_ga).label}</p>
                        <p className="text-xs text-muted-foreground">{trip.spv_ga_approved_at}</p>
                      </div>
                    )}
                    {companyLineApproval.hr_manager && (
                      <div className={`p-3 rounded-lg ${getApprovalStatus('hr_manager', companyLineApproval.hr_manager).class}`}>
                        <p className="text-xs text-muted-foreground">HR Manager</p>
                        <div className="flex items-center gap-2 mt-1">
                          <UserAvatarCell employeeUsed={companyLineApproval.hr_manager} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{companyLineApproval.hr_manager.name}</p>
                              <p className="text-xs text-muted-foreground">{companyLineApproval.hr_manager.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus("hr_manager", companyLineApproval.hr_manager).label}</p>
                        <p className="text-xs text-muted-foreground">{trip.hr_manager_approved_at}</p>
                      </div>
                    )}
                    {companyLineApproval.bod && (
                      <div className={`p-3 rounded-lg ${getApprovalStatus('bod', companyLineApproval.bod).class}`}>
                        <p className="text-xs text-muted-foreground">BOD</p>
                        <div className="flex items-center gap-2 mt-1">
                          <UserAvatarCell employeeUsed={companyLineApproval.bod} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{companyLineApproval.bod.name}</p>
                              <p className="text-xs text-muted-foreground">{companyLineApproval.bod.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus("bod", companyLineApproval.bod).label}</p>
                        <p className="text-xs text-muted-foreground">{trip.bod_approved_at}</p>
                      </div>
                    )}
                    {companyLineApproval.staff_fa && (
                      <div className={`p-3 rounded-lg ${getApprovalStatus('staff_fa', companyLineApproval.staff_fa).class}`}>
                        <p className="text-xs text-muted-foreground">Staff FA</p>
                        <div className="flex items-center gap-2 mt-1">
                          <UserAvatarCell employeeUsed={companyLineApproval.staff_fa} classname="w-8 h-8">
                            <div>
                              <p className="font-medium text-sm">{companyLineApproval.staff_fa.name}</p>
                              <p className="text-xs text-muted-foreground">{companyLineApproval.staff_fa.position}</p>
                            </div>
                          </UserAvatarCell>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{getApprovalStatus("staff_fa", companyLineApproval.staff_fa).label}</p>
                        <p className="text-xs text-muted-foreground">{trip.staff_fa_approved_at}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Footer with Approve/Reject buttons */}
          <div className="flex justify-between pt-4 border-t mt-6">
            <Button variant="outline" onClick={onClose}>Tutup</Button>
            {trip.status === 'Submitted' && approvable && (
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => setIsRejectDialogOpen(true)} 
                  disabled={updateBusinessTrip.isPending}
                >
                  Tolak
                </Button>
                <Button 
                  onClick={handleApprove} 
                  disabled={updateBusinessTrip.isPending} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateBusinessTrip.isPending ? 'Menyetujui...' : 'Setuju'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Perjalanan Dinas</DialogTitle>
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
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={!rejectReason.trim() || updateBusinessTrip.isPending}
              >
                {updateBusinessTrip.isPending ? 'Menolak...' : 'Tolak Perjalanan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovalPerjalananDinasDetailModal;
