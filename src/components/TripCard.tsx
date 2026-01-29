
import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

interface TripCardProps {
  name: string;
  destination: string;
  date: string;
  amount: string;
  status: 'approved' | 'pending' | 'submitted' | 'rejected' | 'completed';
}

const TripCard: React.FC<TripCardProps> = ({ name, destination, date, amount, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Pending';
      case 'submitted':
        return 'Diajukan';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Unknown';
    }
  };

  const handleViewDetails = () => {
    Swal.fire({
      title: 'Detail Perjalanan Dinas',
      html: `
        <div class="text-left">
          <p><strong>Nama:</strong> ${name}</p>
          <p><strong>Tujuan:</strong> ${destination}</p>
          <p><strong>Tanggal:</strong> ${date}</p>
          <p><strong>Jumlah:</strong> ${amount}</p>
          <p><strong>Status:</strong> ${getStatusText(status)}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#3b82f6'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{destination}</p>
            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3 mr-1" />
              {date}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-white">{amount}</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleViewDetails}
          className="w-full"
        >
          Lihat Detail
        </Button>
      </div>
    </div>
  );
};

export default TripCard;
