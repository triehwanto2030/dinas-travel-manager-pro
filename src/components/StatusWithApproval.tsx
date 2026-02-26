import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ApprovalTimestamps {
  submitted_at?: string | null;
  supervisor_approved_at?: string | null;
  supervisor_approved_by?: string | null;
  staff_ga_approved_at?: string | null;
  staff_ga_approved_by?: string | null;
  hr_manager_approved_at?: string | null;
  hr_manager_approved_by?: string | null;
  bod_approved_at?: string | null;
  bod_approved_by?: string | null;
  spv_ga_approved_at?: string | null;
  spv_ga_approved_by?: string | null;
  staff_fa_approved_at?: string | null;
  staff_fa_approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
}

interface StatusWithApprovalProps {
  status: string;
  approvalData: ApprovalTimestamps;
  skip?: boolean;
}

const roleLabels: Record<string, string> = {
  supervisor: 'Supervisor',
  staff_ga: 'Staff GA',
  spv_ga: 'SPV GA',
  hr_manager: 'HR Manager',
  bod: 'BOD',
  staff_fa: 'Staff FA',
};

const getStatusConfig = (status: string) => {
  const statusConfig: Record<string, { class: string; label: string }> = {
    'Draft': { class: 'bg-gray-100 text-gray-800', label: 'Draft' },
    'Submitted': { class: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
    'Approved': { class: 'bg-green-100 text-green-800', label: 'Approved' },
    'Rejected': { class: 'bg-red-100 text-red-800', label: 'Rejected' },
    'Completed': { class: 'bg-blue-100 text-blue-800', label: 'Completed' },
    'Paid': { class: 'bg-purple-100 text-purple-800', label: 'Paid' },
  };
  return statusConfig[status] || statusConfig.Draft;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getLatestApproval = (data: ApprovalTimestamps): { role: string; date: string } | null => {
  const approvals: { role: string; date: string | null | undefined }[] = [
    { role: 'staff_fa', date: data.staff_fa_approved_at },
    { role: 'bod', date: data.bod_approved_at },
    { role: 'hr_manager', date: data.hr_manager_approved_at },
    { role: 'spv_ga', date: data.spv_ga_approved_at },
    { role: 'staff_ga', date: data.staff_ga_approved_at },
    { role: 'supervisor', date: data.supervisor_approved_at },
  ];

  // Find the most recent approval by checking in order of hierarchy (highest first)
  // The latest approval in the workflow is the one that matters
  for (const approval of approvals) {
    if (approval.date) {
      return { role: approval.role, date: approval.date };
    }
  }

  return null;
};

const StatusWithApproval: React.FC<StatusWithApprovalProps> = ({ status, approvalData, skip = false }) => {
  const config = getStatusConfig(status);
  const latestApproval = getLatestApproval(approvalData);
  const noExpense: Boolean = status === 'Approved' && skip && !approvalData.supervisor_approved_at && !approvalData.staff_ga_approved_at && !approvalData.spv_ga_approved_at && !approvalData.hr_manager_approved_at && !approvalData.bod_approved_at && !approvalData.staff_fa_approved_at;

  return (
    <div className="flex flex-col gap-1">
      <Badge className={config.class}>{config.label}</Badge>
      {status !== 'Rejected' && latestApproval && roleLabels[latestApproval.role] !== "Staff FA" ? (
        <p className="text-xs text-muted-foreground">
          Approved by {roleLabels[latestApproval.role]} on {formatDate(latestApproval.date)}
        </p>
      ) : (
        status === 'Submitted' && (
        <p className="text-xs text-muted-foreground">
          Submitted by User on {formatDate(approvalData.submitted_at || '')}
        </p>)
      )}
      {status === 'Rejected' && approvalData.rejected_at && (
        <p className="text-xs text-destructive">
          Rejected on {formatDate(approvalData.rejected_at)}
        </p>
      )}
      {noExpense && (
        <p className="text-xs text-muted-foreground">
          No expenses submitted, auto-approved
        </p>
      )}
    </div>
  );
};

export default StatusWithApproval;
