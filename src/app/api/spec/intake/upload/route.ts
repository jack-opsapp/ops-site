/**
 * POST /api/spec/intake/upload
 *
 * Stage C.4 (SPEC P1-2-9) — multipart upload to Supabase Storage bucket
 * `spec-intake`. Token-validates the intake, server-side re-validates MIME
 * type + 25MB cap, builds a safe storage path under `{spec_project_id}/`,
 * uploads via the service-role client (operator-only RLS), and returns the
 * stored object path. The submission route validates that every returned
 * path actually exists under the project's prefix before stamping
 * `spec_projects.intake_files`.
 *
 * Contract:
 *   multipart/form-data with fields:
 *     - token   (string)   — plaintext intake URL token
 *     - file    (File)     — the upload (single per request)
 *
 *   200 → { path: string, content_type: string, size_bytes: number, original_filename: string }
 *   4xx → { error: string, code?: string }
 *
 * Server-only. Never trust client-supplied filenames or MIME types.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  SPEC_INTAKE_BUCKET,
  SPEC_INTAKE_MAX_BYTES,
  buildIntakeObjectPath,
  isAllowedIntakeMime,
  type SpecIntakeAllowedMime,
} from '@/lib/spec/intake-storage';
import { resolveIntakeToken } from '@/lib/spec/intake-token';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'Expected multipart/form-data.' },
      { status: 400 },
    );
  }

  const token = formData.get('token');
  const file = formData.get('file');

  if (typeof token !== 'string' || token.length === 0) {
    return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file.' }, { status: 400 });
  }

  // ── Token gate ───────────────────────────────────────────────────────────
  const resolution = await resolveIntakeToken(token);
  if (!resolution.ok || resolution.completed) {
    return NextResponse.json(
      { error: 'This intake link is no longer active.' },
      { status: 404 },
    );
  }
  const specProjectId = resolution.project.id;

  // ── Size gate (server-authoritative) ─────────────────────────────────────
  if (file.size > SPEC_INTAKE_MAX_BYTES) {
    return NextResponse.json(
      {
        error: 'File is too large. 25 MB per file maximum.',
        code: 'file_too_large',
      },
      { status: 413 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json(
      { error: 'File is empty.', code: 'file_empty' },
      { status: 400 },
    );
  }

  // ── MIME gate (server-authoritative; client MIME is hint only) ───────────
  const reportedMime = file.type || 'application/octet-stream';
  if (!isAllowedIntakeMime(reportedMime)) {
    return NextResponse.json(
      {
        error:
          'File type not supported. Allowed: PDF, PNG, JPEG, DOCX, XLSX.',
        code: 'mime_not_allowed',
      },
      { status: 415 },
    );
  }
  const mime: SpecIntakeAllowedMime = reportedMime;

  // ── Build a safe path and upload ─────────────────────────────────────────
  const objectPath = buildIntakeObjectPath(specProjectId, mime, file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  const db = getSupabaseAdmin();
  const { error: uploadError } = await db.storage
    .from(SPEC_INTAKE_BUCKET)
    .upload(objectPath, bytes, {
      contentType: mime,
      upsert: false,
    });

  if (uploadError) {
    console.error('[spec/intake/upload] storage upload failed', {
      specProjectId,
      objectPath,
      error: uploadError.message,
    });
    return NextResponse.json(
      { error: 'Could not save the file. Try again in a moment.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    path: objectPath,
    content_type: mime,
    size_bytes: file.size,
    original_filename: file.name,
  });
}
