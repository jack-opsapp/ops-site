/**
 * Bug Report — POST /api/bug-report
 *
 * Creates a row in `bug_reports` for an anonymous ops-site visitor. Pins
 * the report to the sentinel ANONYMOUS USER company and a fixed reporter
 * UUID so the admin feedback view can distinguish marketing-site reports
 * from authenticated product reports.
 *
 * `requires_human_review` is forced to true because the triage agent has
 * no signed-in reporter to follow up with. `custom_metadata.source` is
 * stamped 'ops-site' so admins can filter.
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  ANONYMOUS_COMPANY_ID,
  ANONYMOUS_REPORTER_ID,
  BUG_REPORT_SOURCE,
} from '@/lib/bug-report-config';

interface IncomingPayload {
  description?: string;
  reporterEmail?: string | null;
  requiresHumanReview?: boolean;
  url?: string | null;
  pathname?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  browser?: string | null;
  browserVersion?: string | null;
  osName?: string | null;
  osVersion?: string | null;
  deviceModel?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  devicePixelRatio?: number | null;
  language?: string | null;
  timezone?: string | null;
  online?: boolean | null;
  networkType?: string | null;
  consoleLogs?: unknown[];
  breadcrumbs?: unknown[];
}

const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_EMAIL_LENGTH = 320;

export async function POST(request: Request) {
  let body: IncomingPayload;
  try {
    body = (await request.json()) as IncomingPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const description = (body.description ?? '').trim();
  if (!description) {
    return NextResponse.json(
      { error: 'Description is required.' },
      { status: 400 }
    );
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      { error: `Description exceeds ${MAX_DESCRIPTION_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const reporterEmail = body.reporterEmail?.trim() || null;
  if (reporterEmail && (reporterEmail.length > MAX_EMAIL_LENGTH || !reporterEmail.includes('@'))) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const screenName = body.pathname
    ? body.pathname.replace(/^\/+/, '').split('/')[0] || 'home'
    : null;

  // Default to needing human oversight — anonymous reports have no reporter
  // for the triage agent to follow up with. Reporter can opt out via the
  // toggle when they're confident the agent can autonomously handle it.
  const requiresHumanReview = body.requiresHumanReview !== false;

  const insertRow = {
    company_id: ANONYMOUS_COMPANY_ID,
    reporter_id: ANONYMOUS_REPORTER_ID,
    description,
    category: 'bug',
    platform: 'web',
    priority: 'none',
    status: 'new',
    requires_human_review: requiresHumanReview,
    human_review_reason: requiresHumanReview
      ? 'Reporter flagged at submission: needs human oversight.'
      : null,

    url: body.url ?? null,
    screen_name: screenName,
    browser: body.browser ?? null,
    browser_version: body.browserVersion ?? null,
    os_name: body.osName ?? null,
    os_version: body.osVersion ?? null,
    device_model: body.deviceModel ?? null,
    viewport_width: body.viewportWidth ?? null,
    viewport_height: body.viewportHeight ?? null,
    network_type: body.networkType ?? null,

    console_logs: Array.isArray(body.consoleLogs) ? body.consoleLogs.slice(-50) : [],
    breadcrumbs: Array.isArray(body.breadcrumbs) ? body.breadcrumbs.slice(-50) : [],
    network_log: [],
    state_snapshot: {},

    custom_metadata: {
      source: BUG_REPORT_SOURCE,
      userAgent: body.userAgent ?? null,
      referrer: body.referrer ?? null,
      language: body.language ?? null,
      timezone: body.timezone ?? null,
      online: body.online ?? null,
      devicePixelRatio: body.devicePixelRatio ?? null,
      pathname: body.pathname ?? null,
    },

    reporter_name: null,
    reporter_email: reporterEmail,
  };

  const { data, error } = await supabase
    .from('bug_reports')
    .insert(insertRow)
    .select('id')
    .single();

  if (error || !data) {
    console.error('[api/bug-report] Insert failed:', error?.message);
    return NextResponse.json(
      { error: 'Failed to submit bug report.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id as string });
}
