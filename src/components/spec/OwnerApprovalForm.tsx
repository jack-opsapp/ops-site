'use client';

/**
 * OwnerApprovalForm — Approve / Decline interaction for the owner-approval page.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § /spec/owner-approval.
 * Voice: ops-copywriter (terse, tactical, sentence case).
 *
 * POSTs to /api/spec/owner-approval/[token] with `{ action: 'approve' | 'decline' }`.
 * The Decline button opens an inline confirmation prompt (one click ≠ destructive
 * commit) — only after the operator confirms does the API call fire.
 *
 * Auth: the page itself is server-rendered + auth-gated; the API endpoint
 * re-verifies the same token + account-holder match server-side. Failures on
 * the API side are surfaced as a typed error message.
 */

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  approvalToken: string;
  buyerLabel: string;
  tierDisplayName: string;
  companyName: string;
}

type ApiResponse =
  | { status: 'approved' }
  | { status: 'declined' }
  | { error: string; code?: string };

const BUTTON_BASE =
  'inline-flex items-center justify-center font-caption text-[11px] uppercase tracking-[0.18em] px-6 py-3 rounded-[5px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export function OwnerApprovalForm({
  approvalToken,
  buyerLabel,
  tierDisplayName,
  companyName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<'idle' | 'confirm_decline' | 'approved' | 'declined'>(
    'idle',
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = useCallback(
    (action: 'approve' | 'decline') => {
      setServerError(null);
      startTransition(async () => {
        try {
          const res = await fetch(
            `/api/spec/owner-approval/${encodeURIComponent(approvalToken)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ action }),
            },
          );
          const body = (await res.json()) as ApiResponse;
          if (!res.ok || 'error' in body) {
            setServerError(('error' in body && body.error) || 'Could not complete the request.');
            return;
          }
          if (body.status === 'approved') {
            setMode('approved');
            router.refresh();
            return;
          }
          if (body.status === 'declined') {
            setMode('declined');
            router.refresh();
            return;
          }
          setServerError('Unexpected response.');
        } catch (err) {
          console.error('[OwnerApprovalForm] submit failed', err);
          setServerError('Network error. Try again.');
        }
      });
    },
    [approvalToken, router],
  );

  if (mode === 'approved') {
    return (
      <div className="border border-ops-olive/40 rounded-[10px] bg-ops-surface p-6">
        <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-olive">
          {'// APPROVED'}
        </p>
        <p className="font-heading font-light text-base text-ops-text-primary mt-3 leading-relaxed">
          {buyerLabel} has been emailed a checkout link. They have 24 hours to complete payment.
        </p>
        <p className="font-heading font-light text-sm text-ops-text-tertiary mt-4 leading-relaxed">
          You&rsquo;ll get a confirmation email once the deposit clears.
        </p>
      </div>
    );
  }

  if (mode === 'declined') {
    return (
      <div className="border border-ops-tan/40 rounded-[10px] bg-ops-surface p-6">
        <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-tan">
          {'// DECLINED'}
        </p>
        <p className="font-heading font-light text-base text-ops-text-primary mt-3 leading-relaxed">
          Request cancelled. {buyerLabel} has been notified. No charge was made.
        </p>
      </div>
    );
  }

  if (mode === 'confirm_decline') {
    return (
      <div className="border border-ops-rose/40 rounded-[10px] bg-ops-surface p-6">
        <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-rose">
          {'// CONFIRM DECLINE'}
        </p>
        <p className="font-heading font-light text-base text-ops-text-primary mt-3 leading-relaxed">
          Decline the {tierDisplayName} request for {companyName}?
        </p>
        <p className="font-heading font-light text-sm text-ops-text-tertiary mt-2 leading-relaxed">
          This cancels the purchase entirely. {buyerLabel} is notified by email.
        </p>
        {serverError && (
          <p className="font-caption text-[11px] uppercase tracking-[0.14em] text-ops-rose mt-4">
            {`// ${serverError}`}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => submit('decline')}
            className={`${BUTTON_BASE} bg-ops-rose text-ops-background hover:bg-ops-rose/90`}
          >
            {isPending ? 'Declining…' : 'Decline request'}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setMode('idle');
              setServerError(null);
            }}
            className={`${BUTTON_BASE} border border-ops-border text-ops-text-secondary hover:border-ops-border-hover hover:text-ops-text-primary`}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {serverError && (
        <p className="font-caption text-[11px] uppercase tracking-[0.14em] text-ops-rose mb-4">
          {`// ${serverError}`}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit('approve')}
          className={`${BUTTON_BASE} bg-ops-accent text-ops-background hover:bg-ops-accent/90`}
        >
          {isPending ? 'Approving…' : 'Approve purchase'}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setMode('confirm_decline')}
          className={`${BUTTON_BASE} border border-ops-border text-ops-text-secondary hover:border-ops-rose/60 hover:text-ops-rose`}
        >
          Decline
        </button>
      </div>
      <p className="font-heading font-light text-xs text-ops-text-tertiary mt-4 leading-relaxed">
        Approving releases a checkout link to {buyerLabel}. The deposit is only charged once they
        complete payment.
      </p>
    </div>
  );
}
