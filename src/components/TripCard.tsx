import React from 'react';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TripCardProps {
  id?: string;
  name: string;
  destination: string;
  date: string;
  amount: string;
  status: 'approved' | 'pending' | 'submitted' | 'rejected' | 'completed';
}

const TripCard: React.FC<TripCardProps> = ({ id, name, destination, date, amount, status }) => {
  const navigate = useNavigate();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved': return { label: 'Disetujui', classes: 'bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,45%)] border-[hsl(142,71%,45%)]/20' };
      case 'completed': return { label: 'Selesai', classes: 'bg-primary/10 text-primary border-primary/20' };
      case 'pending': return { label: 'Pending', classes: 'bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%)]/20' };
      case 'submitted': return { label: 'Diajukan', classes: 'bg-accent text-accent-foreground border-accent' };
      case 'rejected': return { label: 'Ditolak', classes: 'bg-destructive/10 text-destructive border-destructive/20' };
      default: return { label: 'Unknown', classes: 'bg-muted text-muted-foreground border-border' };
    }
  };

  const statusConfig = getStatusConfig(status);

  const handleViewDetails = () => {
    navigate(id ? `/perjalanan-dinas?detail=${id}` : '/perjalanan-dinas');
  };

  return (
    <div className="glass rounded-xl p-4 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{name}</h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{destination}</p>
            <div className="flex items-center mt-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {date}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-foreground text-sm">{amount}</p>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1.5 border ${statusConfig.classes}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleViewDetails}
        className="w-full mt-3 h-8 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg group/btn"
      >
        Lihat Detail
        <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
      </Button>
    </div>
  );
};

export default TripCard;
