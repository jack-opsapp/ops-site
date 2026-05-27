/**
 * Server-side Firebase ID-token verification for ops-site SPEC routes.
 *
 * Mirrors the pattern used in `OPS-Web/src/lib/firebase/admin-verify.ts`:
 * verifies Firebase RS256 ID tokens against Google's public JWKS via jose.
 * Tries Supabase Auth (iOS) first, then Firebase Auth (web dashboard).
 *
 * Server-only — never import from client code.
 */

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  ),
);

let _supabaseJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;
function supabaseJWKS() {
  if (!_supabaseJWKS) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
    _supabaseJWKS = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
  }
  return _supabaseJWKS;
}

export interface VerifiedUser {
  uid: string;
  email?: string;
  claims: JWTPayload;
}

async function verifySupabaseToken(token: string): Promise<VerifiedUser> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');

  const { payload } = await jwtVerify(token, supabaseJWKS(), {
    issuer: `${supabaseUrl}/auth/v1`,
  });
  if (!payload.sub) throw new Error('Token missing subject (uid)');
  return {
    uid: payload.sub,
    email: payload.email as string | undefined,
    claims: payload,
  };
}

async function verifyFirebaseToken(token: string): Promise<VerifiedUser> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID not configured');

  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.sub) throw new Error('Token missing subject (uid)');
  return {
    uid: payload.sub,
    email: payload.email as string | undefined,
    claims: payload,
  };
}

export async function verifyAuthToken(token: string): Promise<VerifiedUser> {
  let supabaseError: unknown;
  let firebaseError: unknown;

  try {
    return await verifySupabaseToken(token);
  } catch (err) {
    supabaseError = err;
  }
  try {
    return await verifyFirebaseToken(token);
  } catch (err) {
    firebaseError = err;
  }

  console.error('[verifyAuthToken] Both verification methods failed:', {
    supabase: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
    firebase: firebaseError instanceof Error ? firebaseError.message : String(firebaseError),
  });
  throw firebaseError;
}
