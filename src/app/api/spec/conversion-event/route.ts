import { NextRequest, NextResponse } from 'next/server';
import {
  sendConversionEvent,
  type ConversionEventPayload,
  type SpecConversionEventName,
} from '@/lib/spec/conversion-events';
import { readAttributionFromRequest } from '@/lib/spec/attribution';

const CLIENT_SPEC_EVENTS = new Set<SpecConversionEventName>([
  'page_view',
  'spec_card_expand',
  'pay_deposit_click',
  'spec_default_ops_cta_click',
]);

const SAFE_PAYLOAD_KEYS = new Set([
  'surface',
  'spec_surface',
  'page_path',
  'tier',
  'deposits_enabled',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'has_gclid',
  'has_fbclid',
]);

function sanitizePayload(input: unknown): ConversionEventPayload {
  const out: ConversionEventPayload = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!SAFE_PAYLOAD_KEYS.has(key)) continue;
    if (typeof value === 'string') out[key] = value.slice(0, 180);
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value;
    else if (typeof value === 'boolean') out[key] = value;
  }
  return out;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { eventName?: string; payload?: unknown };
  try {
    body = (await req.json()) as { eventName?: string; payload?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const eventName = body.eventName as SpecConversionEventName;
  if (!CLIENT_SPEC_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: false, error: 'event_not_allowed' }, { status: 400 });
  }

  await sendConversionEvent(eventName, {
    ...readAttributionFromRequest(req),
    ...sanitizePayload(body.payload),
  });

  return NextResponse.json({ ok: true });
}
