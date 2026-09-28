/**
 * RFC 9562 version-4 UUIDs for code that can run in a browser.
 *
 * `crypto.randomUUID` only exists in secure contexts (https, localhost) and
 * in engines from 2021 onward (Chrome 92, Safari 15.4, Firefox 95). Called
 * bare, it throws on plain-http pages and older browsers. When it is absent,
 * the same UUID is built from `crypto.getRandomValues`, which has neither
 * restriction and draws from the same CSPRNG.
 *
 * There is deliberately no Math.random fallback: an identifier from this
 * helper is cryptographically random, or the call throws. Server-side token
 * generation stays on `node:crypto` (see src/lib/spec/token-hash.ts).
 */

type UuidRandomSource = Partial<Pick<Crypto, 'randomUUID' | 'getRandomValues'>>;

function globalCrypto(): UuidRandomSource | undefined {
  return typeof crypto === 'undefined' ? undefined : crypto;
}

export function randomUUID(
  source: UuidRandomSource | undefined = globalCrypto(),
): string {
  if (typeof source?.randomUUID === 'function') {
    return source.randomUUID();
  }
  if (typeof source?.getRandomValues === 'function') {
    const bytes = source.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC variant (10xx)
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return (
      `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-` +
      `${hex.slice(16, 20)}-${hex.slice(20)}`
    );
  }
  throw new Error('randomUUID: no secure random source is available.');
}
