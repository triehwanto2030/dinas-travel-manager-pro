
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Download, Upload, Filter, TrendingDown, TrendingUp, Printer } from 'lucide-react';
import ClaimDinasDetailModal from '@/components/ClaimDinasDetailModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTripClaims } from '@/hooks/useTripClaims';
import MainLayout from '@/components/MainLayout';
import UserAvatarCell from '@/components/AvatarCell';
import StatusWithApproval from '@/components/StatusWithApproval';

const ClaimDinas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  const { data: claims = [], isLoading } = useTripClaims();

  const handleViewDetail = (claim: any) => {
    setSelectedClaim(claim);
    setDetailModalOpen(true);
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate statistics
  const totalClaims = claims.length;
  const pendingClaims = claims.filter(c => c.status === 'Submitted').length;
  const approvedClaims = claims.filter(c => c.status === 'Approved').length;
  const totalAmount = claims.reduce((sum, claim) => sum + claim.total_amount, 0);

  // Filter claims
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.employees.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.business_trips.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const generateClaimId = (claim: any) => {
    const date = new Date(claim.created_at);
    const timestamp = date.getTime().toString().slice(-6);
    return `CL-${timestamp}`;
  };

  const generateTripId = (claim: any) => {
    const date = new Date(claim.business_trips.created_at);
    const timestamp = date.getTime().toString().slice(-8);
    return `PD${timestamp}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors w-full">
      <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Claim Dinas</h1>
              <p className="text-gray-600 dark:text-gray-400">Kelola pengajuan claim perjalanan dinas</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Claim</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalClaims}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingClaims}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedClaims}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalAmount).replace('IDR', 'Rp')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Daftar Claim Dinas
            </CardTitle>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari claim dinas..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Memuat data...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Claim</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Tujuan & Alasan</TableHead>
                    <TableHead>Tanggal Claim</TableHead>
                    <TableHead>Nominal Bayar/Pengembalian</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada data claim dinas
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{generateClaimId(claim)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID Trip: {generateTripId(claim)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatarCell employeeUsed={claim.employees} classname="w-10 h-10">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{claim.employees.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{claim.employees.employee_id}
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">
                                    {claim.employees.grade || 'N/A'}
                                  </span>
                                </p>
                              </div>
                            </UserAvatarCell>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{claim.business_trips.destination}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{claim.business_trips.purpose}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {formatDate(claim.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(claim.total_amount).replace('IDR', 'Rp')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {claim.status === 'Submitted' ? 'Pembayaran' : 'Pengembalian'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusWithApproval 
                            status={claim.status} 
                            approvalData={{
                              supervisor_approved_at: claim.supervisor_approved_at,
                              supervisor_approved_by: claim.supervisor_approved_by,
                              staff_ga_approved_at: claim.staff_ga_approved_at,
                              staff_ga_approved_by: claim.staff_ga_approved_by,
                              hr_manager_approved_at: claim.hr_manager_approved_at,
                              hr_manager_approved_by: claim.hr_manager_approved_by,
                              bod_approved_at: claim.bod_approved_at,
                              bod_approved_by: claim.bod_approved_by,
                              staff_fa_approved_at: claim.staff_fa_approved_at,
                              staff_fa_approved_by: claim.staff_fa_approved_by,
                              rejected_at: claim.rejected_at,
                              rejected_by: claim.rejected_by,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 h-8 w-8"
                              onClick={() => handleViewDetail(claim)}
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className={claim.status === 'Approved' ? 'p-2 h-8 w-8 text-blue-600 hover:text-blue-800' : 'p-2 h-8 w-8'}>
                              {claim.status === 'Approved' ? <Printer className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2 h-8 w-8 text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </MainLayout>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Detail Modal */}
      <ClaimDinasDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        claimData={selectedClaim}
      />
    </div>
  );
};

export default ClaimDinas;
