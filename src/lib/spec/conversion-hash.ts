import { createHash } from 'node:crypto';

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function hashEmail(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = normalizeEmail(value);
  return normalized ? sha256Hex(normalized) : null;
}

export function hashPhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = normalizePhone(value);
  return normalized ? sha256Hex(normalized) : null;
}
