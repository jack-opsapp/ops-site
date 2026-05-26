/**
 * POST /api/spec/intake/autosave
 *
 * Stage C.4 (SPEC P1-2-9) — per-field debounced save into
 * `spec_projects.intake_responses` jsonb.
 *
 * Contract:
 *   Request:  { token: string, field_path: string, value: unknown }
 *   Response: 200 { saved_at: ISO-8601 } | 4xx { error }
 *
 * Token-gated; the same SHA-256 lookup as `intake-token.resolveIntakeToken`
 * but optimized for the hot path. Submission is blocked when
 * `intake_completed_at` is non-null. Field paths are constrained to a
 * deny-list of operational column names + a dotted-path regex to prevent
 * arbitrary jsonb manipulation.
 *
 * Server-only. No-cache. Never blocks the customer flow on transient errors —
 * the autosave is best-effort; the canonical save is at submit time.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveIntakeToken } from '@/lib/spec/intake-token';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Whitelist regex: at least one segment, each segment alphanumeric +
// underscore, dot-separated, max 64 chars total. Examples: `business.name`,
// `current_tools.servicetitan_notes`, `regulated_workflow_attestations.phi_phipa`.
const FIELD_PATH_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,30}(?:\.[a-zA-Z][a-zA-Z0-9_]{0,30}){0,4}$/;

// Top-level paths reserved for the submit endpoint. Autosave is for form
// content only; it cannot move the project through the workflow.
const RESERVED_TOP_LEVEL = new Set([
  'regulated_workflow_attestations',
  'quebec_intake_attestations',
  'uploaded_file_paths',
  'submitted_at',
]);

interface RequestBody {
  token?: unknown;
  field_path?: unknown;
  value?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token : '';
  const fieldPath = typeof body.field_path === 'string' ? body.field_path : '';

  if (!token || !fieldPath) {
    return NextResponse.json(
      { error: 'Missing token or field_path.' },
      { status: 400 },
    );
  }

  if (!FIELD_PATH_RE.test(fieldPath)) {
    return NextResponse.json(
      { error: 'Invalid field_path.' },
      { status: 400 },
    );
  }

  const topLevel = fieldPath.split('.')[0];
  if (RESERVED_TOP_LEVEL.has(topLevel)) {
    return NextResponse.json(
      { error: 'This field is set at submit time, not autosave.' },
      { status: 400 },
    );
  }

  const resolution = await resolveIntakeToken(token);
  if (!resolution.ok || resolution.completed) {
    // Never disclose whether the token was unknown or already completed.
    return NextResponse.json(
      { error: 'This intake link is no longer active.' },
      { status: 404 },
    );
  }

  const project = resolution.project;
  const responses = (project.intake_responses ?? {}) as Record<string, unknown>;
  const next = setDeep(responses, fieldPath.split('.'), body.value);

  const db = getSupabaseAdmin();
  const savedAt = new Date().toISOString();
  const { error } = await db
    .from('spec_projects')
    .update({
      intake_responses: next,
      updated_at: savedAt,
    })
    .eq('id', project.id)
    .is('intake_completed_at', null);

  if (error) {
    console.error('[spec/intake/autosave] update failed', {
      specProjectId: project.id,
      fieldPath,
      error: error.message,
    });
    return NextResponse.json({ error: 'Could not save. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ saved_at: savedAt });
}

/**
 * Deep-set a value at the given key path. Returns a NEW object (never mutates
 * the input). Creates intermediate objects as needed.
 */
function setDeep(
  source: Record<string, unknown>,
  segments: string[],
  value: unknown,
): Record<string, unknown> {
  if (segments.length === 0) return source;
  const [head, ...rest] = segments;
  const next = { ...source };
  if (rest.length === 0) {
    next[head] = value;
    return next;
  }
  const child = source[head];
  next[head] = setDeep(
    child && typeof child === 'object' && !Array.isArray(child)
      ? (child as Record<string, unknown>)
      : {},
    rest,
    value,
  );
  return next;
}
