/**
 * /spec/intake/[token] — token-gated SPEC intake form
 *
 * Stage C.4 (SPEC P1-2-9). The intake token is issued by Stage C.2's webhook
 * at deposit_paid (and by Stage C.3's owner-approval handler at the moment
 * the buyer's checkout token is consumed). The plaintext is emitted in the
 * `spec.deposit_confirmed` / `spec.owner_approval_granted` email link;
 * `spec_projects.intake_token_hash` stores only the SHA-256 hash.
 *
 * Server-side renders the form with autosaved responses pre-populated. The
 * IntakeForm client component drives per-field autosave + file upload +
 * submission. A 404 is returned for any unknown / malformed token (never
 * disclose). An already-completed intake renders a friendly "you're done"
 * panel so the user can re-share/scheduling link without re-submitting.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IntakeForm } from '@/components/spec/intake/IntakeForm';
import { resolveIntakeToken } from '@/lib/spec/intake-token';

// Disable static caching — the token always needs a fresh DB lookup.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SPEC Intake · OPS',
  description: 'Token-gated SPEC intake form for active engagements.',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SpecIntakePage({ params }: PageProps) {
  const { token } = await params;
  const decoded = decodeURIComponent(token ?? '');
  const resolution = await resolveIntakeToken(decoded);

  if (!resolution.ok) {
    notFound();
  }

  const calendlyUrl = process.env.SPEC_DISCOVERY_CALENDLY_URL ?? null;

  if (resolution.completed) {
    return (
      <main className="min-h-screen bg-ops-canvas px-6 py-16 sm:py-24">
        <div className="w-full max-w-[620px] mx-auto">
          <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-text-tertiary">
            {'// INTAKE COMPLETE'}
          </p>
          <h1 className="font-heading font-bold uppercase text-ops-text-primary text-3xl sm:text-4xl mt-3 leading-tight">
            Your intake is already in
          </h1>
          <p className="font-heading font-light text-sm text-ops-text-secondary mt-4 leading-relaxed">
            We received your intake for the {resolution.project.tier} engagement.
            Watch your inbox for the discovery confirmation, or pick a time below.
          </p>
          {calendlyUrl ? (
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-6 px-6 py-3.5 rounded-[3px] bg-ops-accent text-white border border-ops-accent hover:bg-ops-accent/90 transition-colors font-caption text-xs uppercase tracking-[0.15em]"
            >
              Book discovery →
            </a>
          ) : (
            <p className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-text-mute mt-6">
              [Discovery scheduling arrives by email shortly.]
            </p>
          )}
        </div>
      </main>
    );
  }

  const { project, companyName } = resolution;
  const initialFiles = (project.intake_files ?? []).map((path) => ({
    path,
    // The DB only stores the path. Surface a best-effort label until the
    // operator detail UI exposes the original metadata; uploads in this
    // session will have the proper original_filename from the upload route.
    original_filename: path.split('/').pop() ?? path,
    size_bytes: 0,
    content_type: '',
  }));

  return (
    <main className="min-h-screen bg-ops-canvas px-6 py-16 sm:py-24">
      <IntakeForm
        token={decoded}
        tier={project.tier}
        companyName={companyName ?? 'your company'}
        buyerEmail={project.customer_email}
        initialResponses={(project.intake_responses ?? {}) as never}
        initialFiles={initialFiles}
        calendlyUrl={calendlyUrl}
      />
    </main>
  );
}
