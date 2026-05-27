/**
 * Cross-system transactional-email queue for SPEC.
 *
 * ops-site writes rows to `spec_email_outbox`; OPS-Web's existing
 * `sendTransactionalEmail` infrastructure (or a Stage C.5 cron) processes
 * `status='pending'` rows, renders the React Email template via the Stage H
 * `template_id` registry, and flips the row to `sent`. Failed sends retry
 * with backoff; after N attempts the row moves to `permanent_failure` and
 * surfaces in an operator notification.
 *
 * Stage C.1 only ENQUEUES — the dispatcher lives in OPS-Web + Stage C.5.
 *
 * Server-only — never import from client code.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type SpecEmailTemplateId =
  | 'spec.owner_approval_required'
  | 'spec.owner_approval_granted'
  | 'spec.owner_approval_declined'
  | 'spec.deposit_confirmed'
  | 'spec.intake_reminder_1'
  | 'spec.intake_reminder_2'
  | 'spec.intake_reminder_3'
  | 'spec.intake_completed_customer'
  | 'spec.intake_completed_no_discovery_1'
  | 'spec.intake_completed_no_discovery_2'
  | 'spec.intake_completed_no_discovery_3'
  | 'spec.scope_doc_ready'
  | 'spec.scope_doc_signed_customer'
  | 'spec.p2_invoice'
  | 'spec.p3_invoice'
  | 'spec.p4_invoice'
  | 'spec.support_window_open'
  | 'spec.refund_processed'
  | 'spec.refund_denied'
  | 'spec.quebec_rejected_post_stripe';

export interface QueueSpecEmailArgs {
  templateId: SpecEmailTemplateId;
  recipientEmail: string;
  recipientUserId?: string | null;
  payload: Record<string, unknown>;
  specProjectId?: string | null;
  isTest?: boolean;
}

/**
 * Enqueue a transactional email for later dispatch. Returns true on success,
 * false on insert failure (logged internally). Never throws to the caller —
 * the customer flow must continue even if the email queue is degraded.
 */
export async function queueSpecEmail(args: QueueSpecEmailArgs): Promise<boolean> {
  const db = getSupabaseAdmin();
  const { error } = await db.from('spec_email_outbox').insert({
    template_id: args.templateId,
    recipient_email: args.recipientEmail.trim().toLowerCase(),
    recipient_user_id: args.recipientUserId ?? null,
    payload: args.payload,
    spec_project_id: args.specProjectId ?? null,
    is_test: args.isTest ?? false,
    attempts: 0,
    status: 'pending',
  });
  if (error) {
    console.error('[spec/email-outbox] queueSpecEmail failed', {
      templateId: args.templateId,
      recipientEmail: args.recipientEmail,
      error: error.message,
    });
    return false;
  }
  return true;
}
