
import React, { useState } from 'react';
import { Search, Eye, Check, X, DollarSign, Receipt, User } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTripClaims, useUpdateTripClaim } from '@/hooks/useTripClaims';

const ApprovalClaimDinas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: claims = [], isLoading } = useTripClaims();
  const updateTripClaim = useUpdateTripClaim();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Draft': { class: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'Submitted': { class: 'bg-yellow-100 text-yellow-800', label: 'Menunggu Approval' },
      'Approved': { class: 'bg-green-100 text-green-800', label: 'Approved' },
      'Rejected': { class: 'bg-red-100 text-red-800', label: 'Rejected' },
      'Paid': { class: 'bg-blue-100 text-blue-800', label: 'Paid' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Draft;
    return <Badge className={config.class}>{config.label}</Badge>;
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

  const handleApprove = async (claimId: string) => {
    try {
      await updateTripClaim.mutateAsync({
        id: claimId,
        status: 'Approved'
      });
      
      toast({
        title: "Berhasil!",
        description: "Claim dinas telah disetujui",
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: "Gagal menyetujui claim dinas",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedClaimId || !rejectReason.trim()) {
      toast({
        title: "Error!",
        description: "Alasan penolakan harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTripClaim.mutateAsync({
        id: selectedClaimId,
        status: 'Rejected'
      });
      
      toast({
        title: "Berhasil!",
        description: "Claim dinas telah ditolak",
        variant: "destructive",
      });
      
      setIsRejectDialogOpen(false);
      setRejectReason('');
      setSelectedClaimId(null);
    } catch (error) {
      toast({
        title: "Error!",
        description: "Gagal menolak claim dinas",
        variant: "destructive",
      });
    }
  };

  const openRejectDialog = (claimId: string) => {
    setSelectedClaimId(claimId);
    setIsRejectDialogOpen(true);
  };

  // Calculate statistics
  const totalClaims = claims.length;
  const pendingClaims = claims.filter(c => c.status === 'Submitted').length;
  const approvedToday = claims.filter(c => 
    c.status === 'Approved' && 
    new Date(c.updated_at).toDateString() === new Date().toDateString()
  ).length;
  const totalAmountThisMonth = claims
    .filter(c => {
      const claimDate = new Date(c.created_at);
      const now = new Date();
      return claimDate.getMonth() === now.getMonth() && claimDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, claim) => sum + claim.total_amount, 0);

  // Filter claims - only show submitted claims for approval
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.employees.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.business_trips.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status.toLowerCase() === statusFilter.toLowerCase();
    const isSubmitted = claim.status === 'Submitted'; // Only show submitted claims
    return matchesSearch && matchesStatus && isSubmitted;
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
      <Header />
      
      <div className="flex w-full">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 w-full">
          <main className="p-6 w-full">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Approval Claim Dinas</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola persetujuan claim perjalanan dinas</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Receipt className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Menunggu Approval</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingClaims}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disetujui Hari Ini</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Claim Bulan Ini</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(totalAmountThisMonth).replace('IDR', 'Rp')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daftar Claim Dinas Menunggu Approval
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Tanggal Pengajuan</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClaims.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Tidak ada claim dinas yang menunggu approval
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
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={claim.employees.photo_url || undefined} />
                                  <AvatarFallback className="bg-blue-500 text-white text-sm">
                                    {claim.employees.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{claim.employees.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {claim.employees.employee_id}</p>
                                </div>
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
                            <TableCell className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(claim.total_amount).replace('IDR', 'Rp')}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {claim.submitted_at ? formatDate(claim.submitted_at) : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-2"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-2 text-green-600 hover:text-green-800"
                                  onClick={() => handleApprove(claim.id)}
                                  disabled={updateTripClaim.isPending}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-2 text-red-600 hover:text-red-800"
                                  onClick={() => openRejectDialog(claim.id)}
                                  disabled={updateTripClaim.isPending}
                                >
                                  <X className="w-4 h-4" />
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
          </main>
          
          <Footer />
        </div>
      </div>

      {/* Reject Dialog */}
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  setRejectReason('');
                  setSelectedClaimId(null);
                }}
              >
                Batal
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectReason.trim() || updateTripClaim.isPending}
              >
                {updateTripClaim.isPending ? 'Menolak...' : 'Tolak Claim'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
};

export default ApprovalClaimDinas;
