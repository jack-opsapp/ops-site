'use client';

/**
 * BillingAddressForm — pre-Stripe eligibility-address capture for SPEC.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § /spec/billing-address.
 * Voice: ops-copywriter (terse, tactical, sentence case).
 *
 * The form POSTs to /api/spec/create-checkout-session with the buyer's
 * Firebase ID token in the Authorization header. The API does the real
 * server-side validation and either:
 *  - Path A: returns { stripe_url } → we redirect to Stripe Checkout
 *  - Path B: returns { awaiting_approval: true } → we redirect to /spec/awaiting-approval
 *  - Bad input: returns 4xx with { error, field? } → we surface the message
 *  - No company: returns 409 with { redirectTo } → we route the buyer to OPS-Web /setup
 *  - Deposits paused: returns 503 → we redirect to /resources#contact
 */

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CANADIAN_PROVINCES, normalizePostalCode } from '@/lib/spec/quebec-validation';
import type { SpecTier } from '@/lib/spec/pricing';

interface Props {
  tier: SpecTier;
  defaults?: {
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    postal_code?: string;
  };
  buyerEmail: string;
  companyName: string;
  /**
   * OPS-Web sign-in URL — followed if the API returns 401 (session expired
   * between page render and form submit).
   */
  signInUrl: string;
}

interface FormState {
  line1: string;
  line2: string;
  city: string;
  province: string;
  postal_code: string;
  no_qc_head_office: boolean;
  no_qc_operating_address: boolean;
  no_qc_establishment: boolean;
  no_material_qc_use: boolean;
}

interface ApiError {
  error: string;
  field?: string;
  redirectTo?: string;
}

const INPUT_CLASS =
  'w-full rounded-[3px] border border-ops-border bg-ops-surface-input px-3 py-2.5 text-sm text-ops-text-primary font-heading font-light focus:outline-none focus:border-ops-accent focus:ring-1 focus:ring-ops-accent transition-colors disabled:opacity-50';

export function BillingAddressForm({
  tier,
  defaults,
  buyerEmail,
  companyName,
  signInUrl,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [state, setState] = useState<FormState>({
    line1: defaults?.line1 ?? '',
    line2: defaults?.line2 ?? '',
    city: defaults?.city ?? '',
    province: defaults?.province ?? '',
    postal_code: defaults?.postal_code ?? '',
    no_qc_head_office: false,
    no_qc_operating_address: false,
    no_qc_establishment: false,
    no_material_qc_use: false,
  });

  const handleField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
      if (serverError?.field === key) setServerError(null);
    },
    [serverError],
  );

  const handlePostalBlur = useCallback(() => {
    setState((prev) => ({ ...prev, postal_code: normalizePostalCode(prev.postal_code) }));
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setServerError(null);

      startTransition(async () => {
        let res: Response;
        try {
          res = await fetch('/api/spec/create-checkout-session', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tier,
              billing: {
                line1: state.line1,
                line2: state.line2 || null,
                city: state.city,
                province: state.province,
                postal_code: state.postal_code,
                country: 'CA',
              },
              attestations: {
                no_qc_head_office: state.no_qc_head_office,
                no_qc_operating_address: state.no_qc_operating_address,
                no_qc_establishment: state.no_qc_establishment,
                no_material_qc_use: state.no_material_qc_use,
              },
            }),
          });
        } catch (networkErr) {
          console.error('[BillingAddressForm] network error', networkErr);
          setServerError({
            error: 'Network error. Check your connection and try again.',
          });
          return;
        }

        if (res.status === 401) {
          window.location.href = signInUrl;
          return;
        }

        if (res.status === 503) {
          const body = (await safeJson(res)) as { contactUrl?: string } | null;
          window.location.href = body?.contactUrl ?? '/resources#contact';
          return;
        }

        if (res.status === 409) {
          const body = (await safeJson(res)) as ApiError | null;
          if (body?.redirectTo) {
            window.location.href = body.redirectTo;
            return;
          }
          setServerError(body ?? { error: 'We need a bit more setup before payment.' });
          return;
        }

        if (!res.ok) {
          const body = (await safeJson(res)) as ApiError | null;
          setServerError(body ?? { error: 'Something went wrong. Try again.' });
          return;
        }

        const body = (await safeJson(res)) as
          | { stripe_url?: string; awaiting_approval?: boolean }
          | null;

        if (body?.stripe_url) {
          window.location.href = body.stripe_url;
          return;
        }

        if (body?.awaiting_approval) {
          router.push('/spec/awaiting-approval');
          return;
        }

        setServerError({ error: 'Unexpected response from server.' });
      });
    },
    [tier, state, signInUrl, router],
  );

  const allAttested =
    state.no_qc_head_office &&
    state.no_qc_operating_address &&
    state.no_qc_establishment &&
    state.no_material_qc_use;
  const canSubmit =
    !isPending &&
    state.line1.trim().length > 0 &&
    state.city.trim().length > 0 &&
    state.province.length > 0 &&
    state.postal_code.trim().length > 0 &&
    allAttested;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[560px] mx-auto"
      noValidate
      aria-describedby="billing-form-help"
    >
      <header className="mb-8">
        <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-text-tertiary">
          {'// BILLING ADDRESS'}
        </p>
        <h1 className="font-heading font-bold uppercase text-ops-text-primary text-3xl sm:text-4xl mt-3 leading-tight">
          Confirm where you operate
        </h1>
        <p
          id="billing-form-help"
          className="font-heading font-light text-sm text-ops-text-secondary mt-3 max-w-[460px]"
        >
          We collect this here so we can confirm CAD eligibility before payment.
        </p>
        <p className="font-caption text-[11px] uppercase tracking-[0.15em] text-ops-text-mute mt-2">
          [{companyName.toUpperCase()}] · [{buyerEmail}]
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <Field id="line1" label="Address line 1" required>
          <input
            id="line1"
            name="line1"
            type="text"
            autoComplete="address-line1"
            required
            value={state.line1}
            onChange={(e) => handleField('line1', e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <Field id="line2" label="Address line 2 (optional)">
          <input
            id="line2"
            name="line2"
            type="text"
            autoComplete="address-line2"
            value={state.line2}
            onChange={(e) => handleField('line2', e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="city" label="City" required>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              required
              value={state.city}
              onChange={(e) => handleField('city', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>

          <Field id="province" label="Province" required>
            <select
              id="province"
              name="province"
              required
              value={state.province}
              onChange={(e) => handleField('province', e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="" disabled>
                Select a province
              </option>
              {CANADIAN_PROVINCES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="postal_code" label="Postal code" required>
            <input
              id="postal_code"
              name="postal_code"
              type="text"
              autoComplete="postal-code"
              inputMode="text"
              required
              maxLength={7}
              placeholder="V5K 0A1"
              value={state.postal_code}
              onChange={(e) => handleField('postal_code', e.target.value)}
              onBlur={handlePostalBlur}
              className={`${INPUT_CLASS} font-mono uppercase tracking-[0.08em]`}
            />
          </Field>

          <Field id="country" label="Country">
            <input
              id="country"
              name="country"
              type="text"
              value="Canada"
              readOnly
              aria-readonly="true"
              className={`${INPUT_CLASS} opacity-50 cursor-not-allowed`}
            />
          </Field>
        </div>

        <fieldset className="mt-4 border border-ops-border rounded-[3px] p-5">
          <legend className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-text-tertiary px-2">
            {'// QUEBEC ELIGIBILITY'}
          </legend>
          <p className="font-heading font-light text-sm text-ops-text-secondary mb-3">
            We&apos;re not serving Quebec engagements at launch. Confirm all four:
          </p>
          <div className="flex flex-col gap-1">
            <Attestation
              id="no_qc_head_office"
              checked={state.no_qc_head_office}
              onChange={(v) => handleField('no_qc_head_office', v)}
              label="Our company has no Quebec head office."
            />
            <Attestation
              id="no_qc_operating_address"
              checked={state.no_qc_operating_address}
              onChange={(v) => handleField('no_qc_operating_address', v)}
              label="Our company has no Quebec operating address."
            />
            <Attestation
              id="no_qc_establishment"
              checked={state.no_qc_establishment}
              onChange={(v) => handleField('no_qc_establishment', v)}
              label="Our company has no Quebec establishment."
            />
            <Attestation
              id="no_material_qc_use"
              checked={state.no_material_qc_use}
              onChange={(v) => handleField('no_material_qc_use', v)}
              label="Our use of SPEC will not be material to a Quebec operation."
            />
          </div>
          <p className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-text-mute mt-4">
            [Misrepresentation is a material breach. Guarantee Refund unavailable.]
          </p>
        </fieldset>

        {serverError && (
          <div
            role="alert"
            className="border border-ops-brick rounded-[3px] p-3 bg-ops-brick/[0.08]"
          >
            <p className="font-heading font-light text-sm text-ops-brick">{serverError.error}</p>
            {serverError.field === 'attestations' && (
              <p className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-text-mute mt-1">
                [Check all four boxes above to continue]
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 px-6 py-3.5 rounded-[3px] bg-ops-accent text-white border border-ops-accent hover:bg-ops-accent/90 transition-colors font-caption text-xs uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Working…' : 'Continue to payment'}
        </button>

        <p className="font-caption text-[11px] uppercase tracking-[0.15em] text-ops-text-mute text-center">
          [Stripe Checkout opens next · CAD only · GST/HST calculated automatically]
        </p>
      </div>
    </form>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="font-caption text-[11px] uppercase tracking-[0.15em] text-ops-text-tertiary">
        {label}
        {required && <span className="text-ops-brick"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Attestation({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 cursor-pointer select-none rounded-[2px] px-2 py-2 hover:bg-white/[0.02] transition-colors"
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-ops-accent shrink-0"
      />
      <span className="font-heading font-light text-sm text-ops-text-secondary">{label}</span>
    </label>
  );
}

async function safeJson(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
