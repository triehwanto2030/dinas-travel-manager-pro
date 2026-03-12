import { supabase } from '@/integrations/supabase/client';

interface NotificationParams {
  targetEmployeeId: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'info';
  relatedId: string;
  relatedType: 'business_trip' | 'trip_claim';
}

/**
 * Find user_id from employee_id, create in-app notification, and send email
 */
export async function sendApprovalNotification(params: NotificationParams) {
  try {
    // 1. Find user by employee_id
    const { data: userData } = await supabase
      .from('users')
      .select('id, email')
      .eq('employee_id', params.targetEmployeeId)
      .single();

    if (!userData) {
      console.warn('No user found for employee:', params.targetEmployeeId);
      return;
    }

    // 2. Insert in-app notification
    await supabase.from('notifications').insert({
      user_id: userData.id,
      title: params.title,
      message: params.message,
      type: params.type,
      related_id: params.relatedId,
      related_type: params.relatedType,
    } as any);

    // 3. Send email notification via edge function
    const pagePath = params.relatedType === 'business_trip'
      ? '/approval-perjalanan-dinas'
      : '/approval-claim-dinas';

    const link = `${window.location.origin}${pagePath}`;

    try {
      await supabase.functions.invoke('send-approval-email', {
        body: {
          to_email: userData.email,
          subject: params.title,
          message: params.message,
          link,
          type: params.type,
        },
      });
    } catch (emailErr) {
      console.warn('Email notification failed (non-blocking):', emailErr);
    }
  } catch (err) {
    console.error('Failed to send approval notification:', err);
  }
}

/**
 * Notify the next approver in the workflow
 */
export async function notifyNextApprover(params: {
  nextApproverEmployeeId: string;
  employeeName: string;
  entityType: 'business_trip' | 'trip_claim';
  entityId: string;
  destination: string;
  stepLabel: string;
}) {
  const entityLabel = params.entityType === 'business_trip' ? 'Perjalanan Dinas' : 'Claim Dinas';

  await sendApprovalNotification({
    targetEmployeeId: params.nextApproverEmployeeId,
    title: `${entityLabel} Menunggu Persetujuan Anda`,
    message: `${params.employeeName} mengajukan ${entityLabel.toLowerCase()} ke ${params.destination}. Menunggu persetujuan Anda sebagai ${params.stepLabel}.`,
    type: 'info',
    relatedId: params.entityId,
    relatedType: params.entityType,
  });
}

/**
 * Notify the submitter that their request was approved
 */
export async function notifySubmitterApproved(params: {
  submitterEmployeeId: string;
  entityType: 'business_trip' | 'trip_claim';
  entityId: string;
  destination: string;
  approverName: string;
}) {
  const entityLabel = params.entityType === 'business_trip' ? 'Perjalanan Dinas' : 'Claim Dinas';

  await sendApprovalNotification({
    targetEmployeeId: params.submitterEmployeeId,
    title: `${entityLabel} Telah Disetujui`,
    message: `${entityLabel} Anda ke ${params.destination} telah disetujui sepenuhnya.`,
    type: 'approval',
    relatedId: params.entityId,
    relatedType: params.entityType,
  });
}

/**
 * Notify the submitter that their request was rejected
 */
export async function notifySubmitterRejected(params: {
  submitterEmployeeId: string;
  entityType: 'business_trip' | 'trip_claim';
  entityId: string;
  destination: string;
  rejectorName: string;
  reason: string;
}) {
  const entityLabel = params.entityType === 'business_trip' ? 'Perjalanan Dinas' : 'Claim Dinas';

  await sendApprovalNotification({
    targetEmployeeId: params.submitterEmployeeId,
    title: `${entityLabel} Ditolak`,
    message: `${entityLabel} Anda ke ${params.destination} ditolak oleh ${params.rejectorName}. Alasan: ${params.reason}`,
    type: 'rejection',
    relatedId: params.entityId,
    relatedType: params.entityType,
  });
}
