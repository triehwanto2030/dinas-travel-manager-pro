import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTripClaimExpenses } from '@/hooks/useTripClaims';
import pjmLogo from '@/assets/pjm-logo.png';
import { useLineApprovals } from '@/hooks/useLineApprovals';
import { useCompanies } from '@/hooks/useCompanies';

interface ClaimDinasPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimData: any;
}

const ClaimDinasPrintModal: React.FC<ClaimDinasPrintModalProps> = ({ isOpen, onClose, claimData }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const { data: claimExpenses = [] } = useTripClaimExpenses(claimData?.id);
  const { data: lineApprovals = [] } = useLineApprovals();
  const { data: companies = [] } = useCompanies();

  if (!isOpen || !claimData) return null;

  const employee = claimData.employees || {};
  const trip = claimData.business_trips || {};

  const cashAdvance = trip.cash_advance || 0;
  const totalAmount = claimData.total_amount || 0;
  const remaining = cashAdvance - totalAmount;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateShort = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getExpenseTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      transport: 'Transport',
      meal: 'Makan',
      accommodation: 'Akomodasi',
      allowance: 'Saku',
      other: 'Lainnya',
    };
    return types[type] || type;
  };

  // Find the company for this employee and get the corresponding line approval
  const companyLineApproval = lineApprovals.find(la => la.company_id === employee.company_id);
  const companyObj = companies.find(c => c.id === employee.company_id);
  const companyName = companyObj?.name || 'N/A';

  // Build approval list from claim data + line_approvals
  const approvalSteps: { name: string; position: string; date: string; status: string }[] = [];

  // Submitter (employee)
  approvalSteps.push({
    name: employee.name || 'N/A',
    position: 'USER',
    date: formatDateShort(claimData.submitted_at || claimData.created_at),
    status: 'SUBMIT',
  });

  if (companyLineApproval) {
    const steps = [
      { key: 'supervisor', role: 'SUPERVISOR', approvedAt: claimData.supervisor_approved_at, employee: null as any },
      { key: 'staff_ga', role: 'GA STAFF', approvedAt: claimData.staff_ga_approved_at, employee: companyLineApproval.staff_ga },
      { key: 'hr_manager', role: 'HR MANAGER', approvedAt: claimData.hr_manager_approved_at, employee: companyLineApproval.hr_manager },
      { key: 'bod', role: 'BOD', approvedAt: claimData.bod_approved_at, employee: companyLineApproval.bod },
      { key: 'staff_fa', role: 'FA STAFF', approvedAt: claimData.staff_fa_approved_at, employee: companyLineApproval.staff_fa },
    ];

    for (const step of steps) {
      if (step.approvedAt) {
        approvalSteps.push({
          name: step.employee?.name || '-',
          position: step.role,
          date: formatDateShort(step.approvedAt),
          status: 'APPROVED',
        });
      }
    }

    // Check for rejection
    if (claimData.rejected_at) {
      approvalSteps.push({
        name: '-',
        position: '-',
        date: formatDateShort(claimData.rejected_at),
        status: 'REJECTED',
      });
    }
  }

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Claim Perjalanan Dinas - ${claimData.claim_number || ''}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; padding: 24px; }
            .print-page { max-width: 800px; margin: 0 auto; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 16px; }
            .header-center { text-align: center; flex: 1; }
            .header-logo { width: 100px; }
            .header-logo img { max-width: 100%; height: auto; }
            .header h1 { font-size: 18px; font-weight: 700; color: #1e3a5f; }
            .header p { font-size: 13px; color: #1e3a5f; }
            .claim-number { position: absolute; right: 24px; top: 24px; font-size: 13px; font-weight: 600; text-decoration: underline; }
            .section { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
            .section-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #1a1a1a; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .info-row { margin-bottom: 6px; }
            .info-label { font-size: 11px; color: #6b7280; }
            .info-value { font-size: 13px; font-weight: 500; }
            .avatar { width: 48px; height: 48px; border-radius: 50%; background: #e2e8f0; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px; color: #4b5563; margin-right: 12px; vertical-align: middle; overflow: hidden; }
            .avatar img { width: 100%; height: 100%; object-fit: cover; }
            .employee-header { display: flex; align-items: center; margin-bottom: 12px; }
            .grade-badge { background: #dbeafe; color: #1e40af; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-left: 6px; }
            .status-badge { background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
            .expense-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
            .expense-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 12px; }
            .expense-table .icon { width: 24px; text-align: center; }
            .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; background: #f8fafc; border-radius: 8px; padding: 12px; margin-top: 12px; }
            .summary-item { text-align: center; }
            .summary-label { font-size: 11px; color: #6b7280; }
            .summary-value { font-size: 16px; font-weight: 700; }
            .summary-value.blue { color: #2563eb; }
            .summary-value.purple { color: #7c3aed; }
            .summary-value.green { color: #16a34a; }
            .summary-value.red { color: #dc2626; }
            .summary-sub { font-size: 10px; color: #6b7280; }
            .approval-section { margin-top: 24px; }
            .approval-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
            .approval-table { width: 100%; border-collapse: collapse; }
            .approval-table th { text-align: left; font-size: 12px; font-weight: 700; padding: 4px 0; border-bottom: 1px solid #e2e8f0; }
            .approval-table td { font-size: 12px; padding: 3px 0; }
            @media print { body { padding: 0; } .print-page { max-width: 100%; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Print Preview - Claim Perjalanan Dinas</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
          <div ref={printRef} className="bg-white max-w-[800px] mx-auto p-8 shadow-lg" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#1a1a1a' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #1e3a5f', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ width: '100px' }}>
                <img src={pjmLogo} alt="PJM Group" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1e3a5f' }}>{companyName}</h1>
                <p style={{ fontSize: '13px', color: '#1e3a5f' }}>Claim Perjalanan Dinas</p>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, textDecoration: 'underline', width: '100px', textAlign: 'right' }}>
                {claimData.claim_number || `CL-${new Date(claimData.created_at).getTime().toString().slice(-6)}`}
              </div>
            </div>

            {/* Info Karyawan & Detail Perjalanan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Informasi Karyawan */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Informasi Karyawan</div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '16px', color: '#4b5563', marginRight: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    {employee.photo_url ? (
                      <img src={employee.photo_url} alt={employee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      employee.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{employee.name || 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      ID: {employee.employee_id || 'N/A'}
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', marginLeft: '6px' }}>
                        {employee.grade || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>Jabatan:</div>
                    <div style={{ fontWeight: 500 }}>{employee.position || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>Departemen:</div>
                    <div style={{ fontWeight: 500 }}>{employee.department || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>Perusahaan:</div>
                    <div style={{ fontWeight: 500 }}>{companyName}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>Cost Center:</div>
                    <div style={{ fontWeight: 500 }}>{companyName}</div>
                  </div>
                </div>
              </div>

              {/* Detail Perjalanan */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Detail Perjalanan</div>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>No. Perjalanan:</div>
                      <div style={{ fontWeight: 600 }}>{trip.trip_number || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Tujuan:</div>
                      <div style={{ fontWeight: 500 }}>{trip.destination || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>Keperluan:</div>
                    <div style={{ fontWeight: 600 }}>{trip.purpose || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Tanggal Berangkat:</div>
                      <div style={{ fontWeight: 600 }}>{formatDate(trip.start_date)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Tanggal Pulang:</div>
                      <div style={{ fontWeight: 600 }}>{formatDate(trip.end_date)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Transportasi:</div>
                      <div style={{ fontWeight: 500 }}>{trip.transportation || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>Akomodasi:</div>
                      <div style={{ fontWeight: 500 }}>{trip.accommodation || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Klaim */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Detail Klaim</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '12px' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>Tanggal Pengajuan:</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(claimData.submitted_at || claimData.created_at)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>Status:</div>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                    {claimData.status}
                  </span>
                </div>
              </div>

              {/* Detail Pengeluaran */}
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Detail Pengeluaran</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                <tbody>
                  {claimExpenses.map((exp, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', fontSize: '12px', width: '24px', textAlign: 'center' }}>📅</td>
                      <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                        {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                        {getExpenseTypeLabel(exp.expense_type || '')}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                        {exp.description || '-'}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', fontSize: '12px', textAlign: 'right' }}>
                        {(exp.expense_amount || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Cash Advance</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#2563eb' }}>{formatCurrency(cashAdvance)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Klaim</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#7c3aed' }}>{formatCurrency(totalAmount)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Sisa/Pengembalian</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: remaining >= 0 ? '#16a34a' : '#dc2626' }}>
                    {formatCurrency(Math.abs(remaining))}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>{remaining >= 0 ? 'Sisa' : 'Kekurangan'}</div>
                </div>
              </div>
            </div>

            {/* Approval List */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Approval List</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: '12px', fontWeight: 700, padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>Person In Charge</th>
                    <th style={{ textAlign: 'left', fontSize: '12px', fontWeight: 700, padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>Position</th>
                    <th style={{ textAlign: 'left', fontSize: '12px', fontWeight: 700, padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                    <th style={{ textAlign: 'left', fontSize: '12px', fontWeight: 700, padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalSteps.map((step, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '12px', padding: '3px 0' }}>{step.name}</td>
                      <td style={{ fontSize: '12px', padding: '3px 0' }}>{step.position}</td>
                      <td style={{ fontSize: '12px', padding: '3px 0' }}>{step.date}</td>
                      <td style={{ fontSize: '12px', padding: '3px 0' }}>{step.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDinasPrintModal;
