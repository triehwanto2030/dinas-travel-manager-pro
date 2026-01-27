import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, User, Building, DollarSign, FileText, Receipt, Plane, Hotel } from 'lucide-react';

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

  const cashAdvance = claim.business_trips.cash_advance || 0;
  const totalClaim = claim.total_amount || 0;
  const difference = cashAdvance - totalClaim;

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
              <Avatar className="w-16 h-16">
                <AvatarImage src={claim.employees?.photo_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {claim.employees?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'NA'}
                </AvatarFallback>
              </Avatar>
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
                <span className="font-semibold">{formatCurrency(totalClaim)}</span>
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
