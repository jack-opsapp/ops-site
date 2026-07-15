/**
 * Server-side conversion event queue for SPEC.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § Conversion tracking +
 *         SPEC/07_ROLLOUT.md § 10 (Conversion tracking infra).
 *
 * Every conversion event is enqueued in `conversion_event_outbox` as
 * `status='pending'` immediately. The customer flow continues regardless.
 * The cron sender owns Google Enhanced Conversion delivery once credentials
 * and conversion action IDs are present.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const SPEC_CONVERSION_EVENTS = [
  'page_view',
  'spec_card_expand',
  'pay_deposit_click',
  'billing_address_submitted',
  'quebec_rejected',
  'owner_approval_requested',
  'owner_approval_granted',
  'stripe_checkout_opened',
  'stripe_checkout_completed',
  'intake_started',
  'intake_submitted',
  'discovery_booked',
  'spec_default_ops_cta_click',
  'spec_default_ops_signup_started',
  'spec_default_ops_signup_completed',
  'spec_default_ops_trial_activated',
  'refund_invoked',
] as const;

export type SpecConversionEventName = (typeof SPEC_CONVERSION_EVENTS)[number];

export interface ConversionEventPayload {
  // Identity (hashed at send time for Meta CAPI advanced match)
  email?: string;
  phone?: string;
  // Attribution
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  // Optional Meta browser identifiers (set by the Meta pixel on the client)
  fbp?: string | null;
  fbc?: string | null;
  // Event metadata
  spec_project_id?: string;
  user_id?: string;
  company_id?: string;
  tier?: string;
  value_cents?: number;
  currency?: string;
  // Free-form additional context
  [key: string]: unknown;
}

interface OutboxRow {
  event_name: SpecConversionEventName;
  payload: ConversionEventPayload;
  attempts?: number;
  status?: 'pending' | 'sent' | 'failed' | 'permanent_failure';
  last_attempt_at?: string | null;
}

/**
 * Enqueue a conversion event into `conversion_event_outbox`.
 * Never throws to the caller; logs internally.
 */
export async function sendConversionEvent(
  eventName: SpecConversionEventName,
  payload: ConversionEventPayload,
): Promise<void> {
  try {
    await enqueueOutbox(eventName, payload, 'pending');
  } catch (err) {
    console.error('[spec/conversion-events] outbox enqueue failed', {
      eventName,
      error: err instanceof Error ? err.message : String(err),
    });
    return;
  }
}

async function enqueueOutbox(
  eventName: SpecConversionEventName,
  payload: ConversionEventPayload,
  status: 'pending' | 'sent' | 'failed',
): Promise<void> {
  const db = getSupabaseAdmin();
  const row: OutboxRow = {
    event_name: eventName,
    payload,
    attempts: 0,
    status,
    last_attempt_at: status === 'pending' ? null : new Date().toISOString(),
  };
  const { error } = await db.from('conversion_event_outbox').insert(row);
  if (error) {
    throw new Error(`conversion_event_outbox insert failed: ${error.message}`);
  }
}
