/**
 * Bug Report Screenshot — POST /api/bug-report/screenshot
 *
 * Multipart upload: { file, reportId }. Uploads to the private `bug-reports`
 * bucket at `${ANONYMOUS_COMPANY_ID}/${reportId}/screenshot.png` and persists
 * the path on the bug_reports row. Service-role client bypasses bucket RLS.
 *
 * The reportId is validated to belong to the ANONYMOUS USER company so this
 * route can't be used to overwrite screenshots on real product reports.
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ANONYMOUS_COMPANY_ID } from '@/lib/bug-report-config';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const file = form.get('file');
  const reportId = form.get('reportId');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required.' }, { status: 400 });
  }
  if (typeof reportId !== 'string' || !reportId) {
    return NextResponse.json({ error: 'reportId is required.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 5MB.' }, { status: 413 });
  }
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: report, error: lookupErr } = await supabase
    .from('bug_reports')
    .select('id, company_id')
    .eq('id', reportId)
    .single();

  if (lookupErr || !report) {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  }
  if (report.company_id !== ANONYMOUS_COMPANY_ID) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/webp' ? 'webp' : 'png';
  const path = `${ANONYMOUS_COMPANY_ID}/${reportId}/screenshot.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('bug-reports')
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadErr) {
    console.error('[api/bug-report/screenshot] Upload failed:', uploadErr.message);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }

  const { error: updateErr } = await supabase
    .from('bug_reports')
    .update({ screenshot_url: path, updated_at: new Date().toISOString() })
    .eq('id', reportId);

  if (updateErr) {
    console.error('[api/bug-report/screenshot] Failed to persist path:', updateErr.message);
    return NextResponse.json({ error: 'Failed to persist screenshot.' }, { status: 500 });
  }

  return NextResponse.json({ path });
}
