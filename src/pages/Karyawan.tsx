
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Download, ArrowUpDown } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Karyawan = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const karyawanData = [
    {
      id: 'EMP176',
      name: 'Jesika',
      email: 'tes@company.com',
      phone: '+628562998888',
      jabatan: 'staff GA',
      department: 'HR',
      status: 'Aktif',
      tanggalBergabung: '2025-07-03',
      avatar: 'J'
    },
    {
      id: 'EMP175',
      name: 'Tri',
      email: 'tri@gmail.com',
      phone: '+628562998885',
      jabatan: 'Analyst',
      department: 'Finance',
      status: 'Aktif',
      tanggalBergabung: '2025-06-25',
      avatar: 'T'
    },
    {
      id: 'EMP1005',
      name: 'Tri Ehwanto',
      email: 'triehwanto@gmail.com',
      phone: '+628562998885',
      jabatan: 'Human Resources Director',
      department: 'HR',
      status: 'Aktif',
      tanggalBergabung: '2025-06-25',
      avatar: 'TE'
    },
    {
      id: 'EMP006',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      phone: '+62 816-6789-0123',
      jabatan: 'Specialist',
      department: 'Sales',
      status: 'Aktif',
      tanggalBergabung: '2023-02-28',
      avatar: 'LA'
    },
    {
      id: 'EMP007',
      name: 'Robert Taylor',
      email: 'robert.taylor@company.com',
      phone: '+62 817-7890-1234',
      jabatan: 'Coordinator',
      department: 'HR',
      status: 'Aktif',
      tanggalBergabung: '2021-12-05',
      avatar: 'RT'
    },
    {
      id: 'EMP008',
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      phone: '+62 818-8901-2345',
      jabatan: 'Senior Executive',
      department: 'Marketing',
      status: 'Aktif',
      tanggalBergabung: '2022-07-18',
      avatar: 'ED'
    }
  ];

  const stats = [
    { title: 'Total Karyawan', value: '11', color: 'bg-blue-500' },
    { title: 'Karyawan Aktif', value: '11', color: 'bg-green-500' },
    { title: 'Departemen', value: '5', color: 'bg-purple-500' },
    { title: 'Bergabung Bulan Ini', value: '1', color: 'bg-orange-500' }
  ];

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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Master Karyawan</h1>
                  <p className="text-gray-600 dark:text-gray-400">Kelola data karyawan perusahaan</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4" />
                    Tambah Karyawan
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <Card key={index} className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                          <ArrowUpDown className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Table Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Daftar Karyawan
                </CardTitle>
                
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari karyawan..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="">Departemen</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </CardHeader>
              
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal Bergabung</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {karyawanData.map((karyawan) => (
                      <TableRow key={karyawan.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              {karyawan.avatar}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{karyawan.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {karyawan.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{karyawan.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{karyawan.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{karyawan.jabatan}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{karyawan.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium dark:bg-green-900 dark:text-green-300">
                            {karyawan.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {karyawan.tanggalBergabung}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="p-2">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
          
          <Footer />
        </div>
      </div>

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

export default Karyawan;
