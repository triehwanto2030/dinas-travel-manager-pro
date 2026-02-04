import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, User, Building, Plane, Hotel, DollarSign, FileText } from 'lucide-react';
import UserAvatarCell from './AvatarCell';

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
  } | null;
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
  if (!trip) return null;

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
      'Completed': { class: 'bg-blue-100 text-blue-800', label: 'Selesai' }
    };
    
    const config = statusConfig[status] || statusConfig.Draft;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} hari`;
  };

  return (
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalPerjalananDinasDetailModal;
