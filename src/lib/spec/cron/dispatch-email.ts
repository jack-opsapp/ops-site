/**
 * SPEC email dispatcher — POSTs a rendered email request to OPS-Web's
 * internal SPEC send endpoint.
 *
 * Topology decision (locked here, documented in 04_API_AND_INTEGRATION.md):
 *   ops-site is the only place that owns spec_email_outbox writes
 *   (Stage C.1 onward — every checkout / webhook / owner-approval path
 *   enqueues there). OPS-Web is the only place that owns SendGrid +
 *   the React Email Spec*.tsx templates (Stage H, commit dec9c71d).
 *   Rather than duplicate the template+SendGrid stack on the ops-site
 *   side OR cross-import OPS-Web modules (different repo, different
 *   package), the Stage C.5 cron drains `spec_email_outbox` by HTTP
 *   POSTing each pending row to OPS-Web's internal endpoint, which then
 *   resolves the template_id → typed sendSpec*() sender, renders, and
 *   delivers via SendGrid with the existing compliance headers
 *   (List-Unsubscribe, ComplianceFooter, suppression check, pause-scope
 *   check, email_log write).
 *
 * The OPS-Web internal endpoint (`POST /api/internal/spec/send-email`)
 * is a sibling chip — when missing or misconfigured, this dispatcher
 * returns `{ ok: false, kind: 'not_configured' }` and the cron leaves
 * the outbox row pending without bumping attempts (config issue, not
 * delivery issue — won't drive a row toward permanent_failure).
 *
 * Env vars (set in Vercel):
 *   OPS_WEB_INTERNAL_BASE_URL    e.g. https://app.opsapp.co
 *   OPS_INTERNAL_DISPATCH_SECRET high-entropy shared secret matched on
 *                                the OPS-Web endpoint via constant-time
 *                                compare
 */

export interface DispatchEmailArgs {
  templateId: string;
  recipientEmail: string;
  recipientUserId?: string | null;
  specProjectId?: string | null;
  payload: Record<string, unknown>;
  isTest?: boolean;
}

export type DispatchResult =
  | { ok: true; messageId: string | null; status: 'sent' | 'suppression_skipped' | 'paused_skipped' }
  | { ok: false; kind: 'not_configured'; error: string }
  | { ok: false; kind: 'transient'; httpStatus: number; error: string }
  | { ok: false; kind: 'permanent'; httpStatus: number; error: string };

const DISPATCH_TIMEOUT_MS = 20_000;

export async function dispatchSpecEmail(args: DispatchEmailArgs): Promise<DispatchResult> {
  const base = process.env.OPS_WEB_INTERNAL_BASE_URL;
  const secret = process.env.OPS_INTERNAL_DISPATCH_SECRET;

  if (!base || !secret) {
    return {
      ok: false,
      kind: 'not_configured',
      error: 'OPS_WEB_INTERNAL_BASE_URL or OPS_INTERNAL_DISPATCH_SECRET not set',
    };
  }

  const url = `${base.replace(/\/$/, '')}/api/internal/spec/send-email`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        template_id: args.templateId,
        recipient_email: args.recipientEmail,
        recipient_user_id: args.recipientUserId ?? null,
        spec_project_id: args.specProjectId ?? null,
        payload: args.payload,
        is_test: args.isTest ?? false,
      }),
      signal: controller.signal,
    });

    const text = await res.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      // non-JSON body — leave parsed empty; we'll use the raw text in the error.
    }

    if (res.ok) {
      const status = (parsed.status as DispatchResult extends { ok: true; status: infer S }
        ? S
        : never) ?? 'sent';
      return {
        ok: true,
        messageId: (parsed.messageId as string | null | undefined) ?? null,
        status: (status as 'sent' | 'suppression_skipped' | 'paused_skipped') ?? 'sent',
      };
    }

    // 4xx → permanent (template invalid, payload invalid, blocked by suppression at endpoint).
    // 5xx and 408 → transient (retry next run).
    if (res.status >= 500 || res.status === 408 || res.status === 429) {
      return {
        ok: false,
        kind: 'transient',
        httpStatus: res.status,
        error: text.slice(0, 500) || `HTTP ${res.status}`,
      };
    }
    return {
      ok: false,
      kind: 'permanent',
      httpStatus: res.status,
      error: text.slice(0, 500) || `HTTP ${res.status}`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // AbortError / network → transient.
    return { ok: false, kind: 'transient', httpStatus: 0, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
