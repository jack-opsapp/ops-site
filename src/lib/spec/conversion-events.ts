/**
 * Server-side conversion event scaffold for SPEC.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § Conversion tracking +
 *         SPEC/07_ROLLOUT.md § 10 (Conversion tracking infra) +
 *         SPEC/07_ROLLOUT.md § Known open items #8 (Meta CAPI + Google Enhanced
 *         credentials — procurement task).
 *
 * Stage C.1 ships the OUTBOX-FIRST scaffold:
 *  - Every conversion event is enqueued in `conversion_event_outbox` as
 *    `status='pending'` immediately. The customer flow continues regardless.
 *  - When Meta CAPI / Google Enhanced env vars are present, we attempt a
 *    direct send inline; on success we flip the outbox row to `sent`; on
 *    failure we leave it `pending` for the hourly cron (Stage C.5) to retry.
 *  - When env vars are missing (current state — credentials not yet
 *    provisioned), the row stays `pending` and the cron does the actual API
 *    calls once credentials land.
 *
 * NEVER blocks the customer flow on send failures.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type SpecConversionEventName =
  | 'pay_deposit_click'
  | 'billing_address_submitted'
  | 'quebec_rejected'
  | 'owner_approval_requested'
  | 'stripe_checkout_opened'
  | 'stripe_checkout_completed'
  | 'intake_started'
  | 'intake_submitted'
  | 'discovery_booked'
  | 'refund_invoked';

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
 * Enqueue a conversion event into `conversion_event_outbox` and best-effort
 * fire the direct API sends. Never throws to the caller; logs internally.
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

  // Stage C.1 scaffold — direct API senders are no-ops until Meta CAPI +
  // Google Enhanced credentials are provisioned (see SPEC/07_ROLLOUT.md
  // open item #8). The hourly cron (Stage C.5) takes pending rows and runs
  // the real sends once credentials land.
  const hasMetaCreds = Boolean(
    process.env.META_CAPI_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN,
  );
  const hasGoogleCreds = Boolean(
    process.env.GOOGLE_ADS_CONVERSION_ID && process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  );

  if (!hasMetaCreds && !hasGoogleCreds) {
    // Credentials not yet provisioned. Outbox holds the row; cron retries.
    return;
  }

  // When credentials exist in env, attempt inline send. Stage C.5 will lift
  // these implementations out into dedicated modules with retry + backoff.
  // For Stage C.1 we keep the inline path as a stub that does not actually
  // hit the network — the cron is the authoritative sender. Documenting
  // this here keeps the contract visible without partially-implementing two
  // ad-platform integrations that aren't yet credentialed.
  return;
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
