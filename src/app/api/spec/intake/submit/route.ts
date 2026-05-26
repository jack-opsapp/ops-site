/**
 * POST /api/spec/intake/submit
 *
 * Stage C.4 (SPEC P1-2-9) — the canonical SPEC intake submission endpoint.
 *
 * Token-gated. SHA-256 the URL token, look up the matching spec_projects row
 * where `intake_completed_at IS NULL`. 404 on any miss (never disclose).
 *
 * Three independent gates (any failure → 422 + operator notification + NO
 * intake_completed flip):
 *   1. Regulated-workflow attestations — any of the 5 categories === true
 *      → stamp `regulated_workflow_flagged_at` + persistent operator note.
 *   2. Quebec intake re-check — any QC criterion (head office, operating
 *      address, establishment, material SPEC use) marked true → operator
 *      note + refund-path explanation in the response.
 *   3. File-path traversal — every uploaded path must be under
 *      `{spec_project_id}/` and end in an allowed extension.
 *
 * On success:
 *   - Update spec_projects: intake_responses, intake_completed_at (= now),
 *     intake_files (jsonb array of paths).
 *   - Queue `spec.intake_completed_customer` email to the buyer.
 *   - Insert customer notification (action_url = /account/spec/{id}).
 *   - Insert one operator notification per SPEC operator (action_url =
 *     /admin/spec/{id}).
 *   - Send `intake_submitted` conversion event via outbox.
 *   - 200 { ok: true, redirect_to: '/spec/intake/{token}/complete' }
 *
 * Server-only. Never trusts the client. Per CLAUDE.md, no AI attribution
 * appears anywhere.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveIntakeToken, type IntakeProjectRow } from '@/lib/spec/intake-token';
import {
  REGULATED_WORKFLOW_KEYS,
  QUEBEC_INTAKE_KEYS,
  REGULATED_WORKFLOW_LABELS,
  QUEBEC_INTAKE_LABELS,
  normalizeAttestations,
  regulatedWorkflowFlags,
  quebecIntakeFlags,
  validateIntakeSubmission,
  type IntakeSubmissionPayload,
  type RegulatedWorkflowKey,
  type QuebecIntakeKey,
} from '@/lib/spec/intake-validation';
import { sendConversionEvent } from '@/lib/spec/conversion-events';
import { queueSpecEmail } from '@/lib/spec/email-outbox';
import { OPS_OPERATIONS_COMPANY_ID } from '@/lib/spec/ops-operations-company';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

interface RequestBody {
  token?: unknown;
  responses?: unknown;
  regulated_workflow_attestations?: unknown;
  quebec_intake_attestations?: unknown;
  uploaded_file_paths?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token : '';
  if (!token) {
    return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
  }

  // ── Token gate ───────────────────────────────────────────────────────────
  const resolution = await resolveIntakeToken(token);
  if (!resolution.ok) {
    return NextResponse.json(
      { error: 'This intake link is no longer active.' },
      { status: 404 },
    );
  }
  if (resolution.completed) {
    return NextResponse.json(
      { error: 'This intake has already been submitted.', code: 'already_completed' },
      { status: 409 },
    );
  }
  const project = resolution.project;

  // ── Parse + normalize payload ────────────────────────────────────────────
  const responses =
    body.responses && typeof body.responses === 'object'
      ? (body.responses as Record<string, unknown>)
      : null;
  if (!responses) {
    return NextResponse.json(
      { error: 'Intake responses must be an object.' },
      { status: 400 },
    );
  }

  const regulated = normalizeAttestations(
    REGULATED_WORKFLOW_KEYS,
    body.regulated_workflow_attestations,
  );
  const qc = normalizeAttestations(QUEBEC_INTAKE_KEYS, body.quebec_intake_attestations);
  const filePaths = Array.isArray(body.uploaded_file_paths)
    ? body.uploaded_file_paths.filter((p): p is string => typeof p === 'string')
    : [];

  const payload: IntakeSubmissionPayload = {
    responses,
    regulated_workflow_attestations: regulated,
    quebec_intake_attestations: qc,
    uploaded_file_paths: filePaths,
  };

  // ── Gate 1: Regulated-workflow attestation ───────────────────────────────
  const regulatedFlagged = regulatedWorkflowFlags(regulated);
  if (regulatedFlagged.length > 0) {
    await handleRegulatedWorkflowBlock({
      project,
      regulated,
      regulatedFlagged,
      currentResponses: responses,
    });
    return NextResponse.json(
      {
        ok: false,
        code: 'regulated_workflow_blocked',
        flagged: regulatedFlagged,
        flagged_labels: regulatedFlagged.map((k) => REGULATED_WORKFLOW_LABELS[k]),
        error:
          "We can't build for the workflows you flagged. We'll review and reach out about a pre-discovery refund.",
        refund_path: '/account/spec/' + project.id + '/request-refund',
      },
      { status: 422 },
    );
  }

  // ── Gate 2: Quebec intake re-check ───────────────────────────────────────
  const qcFlagged = quebecIntakeFlags(qc);
  if (qcFlagged.length > 0) {
    await handleQuebecIntakeBlock({ project, qcFlagged });
    return NextResponse.json(
      {
        ok: false,
        code: 'quebec_intake_blocked',
        flagged: qcFlagged,
        flagged_labels: qcFlagged.map((k) => QUEBEC_INTAKE_LABELS[k]),
        error:
          "We're not currently serving Quebec engagements. We'll review and reach out about a pre-discovery refund.",
        refund_path: '/account/spec/' + project.id + '/request-refund',
      },
      { status: 422 },
    );
  }

  // ── Gate 3: File path traversal ──────────────────────────────────────────
  const validation = validateIntakeSubmission(project.id, payload);
  if (!validation.ok) {
    if (validation.code === 'file_path_invalid') {
      console.warn('[spec/intake/submit] rejected invalid file paths', {
        specProjectId: project.id,
        bad: validation.bad,
      });
      return NextResponse.json(
        {
          ok: false,
          code: 'file_path_invalid',
          error: 'Some uploaded files could not be verified. Re-upload them.',
        },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { ok: false, code: validation.code, error: 'Intake submission was malformed.' },
      { status: 422 },
    );
  }

  // ── Happy path: stamp completion + dispatch downstream effects ───────────
  const db = getSupabaseAdmin();
  const completedAt = new Date().toISOString();

  // Build the full responses payload — keep the autosaved entries and add
  // the gating attestation payloads + submission timestamp as authoritative.
  const finalResponses: Record<string, unknown> = {
    ...responses,
    regulated_workflow_attestations: regulated,
    quebec_intake_attestations: qc,
    submitted_at: completedAt,
  };

  // Concurrent-safety: only flip if intake_completed_at is still null.
  const { data: updated, error: updateError } = await db
    .from('spec_projects')
    .update({
      intake_responses: finalResponses,
      intake_completed_at: completedAt,
      intake_files: filePaths,
      updated_at: completedAt,
    })
    .eq('id', project.id)
    .is('intake_completed_at', null)
    .select('id')
    .maybeSingle();

  if (updateError || !updated) {
    console.error('[spec/intake/submit] update failed', {
      specProjectId: project.id,
      error: updateError?.message,
    });
    return NextResponse.json(
      { error: 'Could not record your submission. Try again in a moment.' },
      { status: 500 },
    );
  }

  // Customer email — best-effort; never block on failure.
  await queueSpecEmail({
    templateId: 'spec.intake_completed_customer',
    recipientEmail: project.customer_email,
    recipientUserId: project.buyer_user_id,
    specProjectId: project.id,
    isTest: project.is_test,
    payload: {
      tier: project.tier,
      company_name: resolution.companyName ?? 'your company',
      file_count: filePaths.length,
      discovery_url: process.env.SPEC_DISCOVERY_CALENDLY_URL ?? null,
    },
  });

  // Customer in-app notification — present in the OPS-Web rail.
  await insertCustomerNotification({
    project,
    title: 'INTAKE RECEIVED',
    body: 'Your intake is in. Discovery scheduling is the next step.',
    type: 'spec_intake_completed',
    actionUrl: `/account/spec/${project.id}`,
    actionLabel: 'Open project',
  });

  // Operator notifications — fan out to every SPEC operator.
  await fanOutOperatorNotification({
    project,
    title: 'SPEC INTAKE SUBMITTED',
    body: `${resolution.companyName ?? project.customer_email} finished intake. Schedule discovery.`,
    type: 'spec_intake_completed_operator',
    actionUrl: `/admin/spec/${project.id}`,
    actionLabel: 'Open project',
    persistent: false,
  });

  // Conversion event via outbox.
  await sendConversionEvent('intake_submitted', {
    user_id: project.buyer_user_id,
    company_id: project.linked_company_id ?? undefined,
    tier: project.tier,
    spec_project_id: project.id,
    email: project.customer_email,
  });

  return NextResponse.json({
    ok: true,
    redirect_to: process.env.SPEC_DISCOVERY_CALENDLY_URL ?? null,
  });
}

// ─── Block handlers ──────────────────────────────────────────────────────────

interface RegulatedBlockArgs {
  project: IntakeProjectRow;
  regulated: Record<RegulatedWorkflowKey, boolean>;
  regulatedFlagged: RegulatedWorkflowKey[];
  currentResponses: Record<string, unknown>;
}

async function handleRegulatedWorkflowBlock(args: RegulatedBlockArgs): Promise<void> {
  const { project, regulated, regulatedFlagged, currentResponses } = args;
  const db = getSupabaseAdmin();
  const flaggedAt = new Date().toISOString();

  // Persist the attestations + flag stamp so the operator queue can render
  // the failing categories. NEVER stamp intake_completed_at here.
  await db
    .from('spec_projects')
    .update({
      regulated_workflow_flagged_at: flaggedAt,
      regulated_workflow_flags: regulated,
      intake_responses: {
        ...currentResponses,
        regulated_workflow_attestations: regulated,
      },
      updated_at: flaggedAt,
    })
    .eq('id', project.id);

  await fanOutOperatorNotification({
    project,
    title: 'SPEC INTAKE FLAGGED — REGULATED WORKFLOW',
    body: `${project.customer_email} declared: ${regulatedFlagged
      .map((k) => REGULATED_WORKFLOW_LABELS[k])
      .join('; ')}. Review for refund.`,
    type: 'spec_intake_regulated_workflow_flagged',
    actionUrl: `/admin/spec/${project.id}`,
    actionLabel: 'Review intake',
    persistent: true,
  });
}

interface QuebecBlockArgs {
  project: IntakeProjectRow;
  qcFlagged: QuebecIntakeKey[];
}

async function handleQuebecIntakeBlock(args: QuebecBlockArgs): Promise<void> {
  const { project, qcFlagged } = args;
  await fanOutOperatorNotification({
    project,
    title: 'SPEC INTAKE FLAGGED — QUEBEC OPERATIONS',
    body: `${project.customer_email} declared Quebec operations at intake: ${qcFlagged
      .map((k) => QUEBEC_INTAKE_LABELS[k])
      .join('; ')}. Pre-discovery refund path.`,
    type: 'spec_intake_quebec_flagged',
    actionUrl: `/admin/spec/${project.id}`,
    actionLabel: 'Review intake',
    persistent: true,
  });
}

// ─── Notification fan-out ────────────────────────────────────────────────────

async function insertCustomerNotification(args: {
  project: IntakeProjectRow;
  title: string;
  body: string;
  type: string;
  actionUrl: string;
  actionLabel: string;
}): Promise<void> {
  const { project, title, body, type, actionUrl, actionLabel } = args;
  if (!project.linked_company_id) {
    console.warn('[spec/intake/submit] customer notification skipped (no company)', {
      specProjectId: project.id,
    });
    return;
  }
  const db = getSupabaseAdmin();
  const { error } = await db.from('notifications').insert({
    user_id: project.buyer_user_id,
    company_id: project.linked_company_id,
    type,
    title,
    body,
    project_id: project.id,
    is_read: false,
    persistent: false,
    action_url: actionUrl,
    action_label: actionLabel,
  });
  if (error) {
    console.error('[spec/intake/submit] customer notification insert failed', {
      specProjectId: project.id,
      error: error.message,
    });
  }
}

async function fanOutOperatorNotification(args: {
  project: IntakeProjectRow;
  title: string;
  body: string;
  type: string;
  actionUrl: string;
  actionLabel: string;
  persistent: boolean;
}): Promise<void> {
  const { project, title, body, type, actionUrl, actionLabel, persistent } = args;
  const db = getSupabaseAdmin();

  // Every user with the SPEC Operator role + every user with an active
  // user_permission_overrides row for spec.admin.
  const operatorUserIds = await loadSpecOperatorUserIds();
  if (operatorUserIds.length === 0) {
    console.warn('[spec/intake/submit] no SPEC operators found — operator notification skipped', {
      specProjectId: project.id,
    });
    return;
  }

  const rows = operatorUserIds.map((userId) => ({
    user_id: userId,
    company_id: OPS_OPERATIONS_COMPANY_ID,
    type,
    title,
    body,
    project_id: project.id,
    is_read: false,
    persistent,
    action_url: actionUrl,
    action_label: actionLabel,
  }));

  const { error } = await db.from('notifications').insert(rows);
  if (error) {
    console.error('[spec/intake/submit] operator notification insert failed', {
      specProjectId: project.id,
      operatorCount: rows.length,
      error: error.message,
    });
  }
}

async function loadSpecOperatorUserIds(): Promise<string[]> {
  const db = getSupabaseAdmin();
  const ids = new Set<string>();

  // 1. SPEC Operator role members.
  const { data: roleRows, error: roleErr } = await db
    .from('user_roles')
    .select('user_id, roles!inner(id)')
    .eq('roles.id', '00000000-0000-0000-0000-0000000000a1');
  if (roleErr) {
    console.error('[spec/intake/submit] role-members lookup failed', roleErr);
  } else if (Array.isArray(roleRows)) {
    for (const row of roleRows) {
      if (typeof row.user_id === 'string' && row.user_id.length > 0) {
        ids.add(row.user_id);
      }
    }
  }

  // 2. user_permission_overrides for spec.admin (granted=true).
  const { data: overrideRows, error: overrideErr } = await db
    .from('user_permission_overrides')
    .select('user_id')
    .eq('permission', 'spec.admin')
    .eq('granted', true);
  if (overrideErr) {
    console.error('[spec/intake/submit] override lookup failed', overrideErr);
  } else if (Array.isArray(overrideRows)) {
    for (const row of overrideRows) {
      if (typeof row.user_id === 'string' && row.user_id.length > 0) {
        ids.add(row.user_id);
      }
    }
  }

  return Array.from(ids);
}
