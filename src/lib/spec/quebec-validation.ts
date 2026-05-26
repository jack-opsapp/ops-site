/**
 * Quebec eligibility validation for SPEC deposit billing addresses.
 *
 * Source: ops-software-bible/SPEC/04_CUSTOMER_UX.md § /spec/billing-address +
 * SPEC/01_BUSINESS_MODEL.md § 3 (governing law / Quebec exclusion).
 *
 * Four rejection paths (all server-authoritative):
 *  - country != 'CA'        → "We're CAD-only at launch."
 *  - province == 'QC'       → "We're not currently serving Quebec engagements."
 *  - postal code malformed  → "Please enter a valid Canadian postal code."
 *  - any attestation false  → "Confirm all four Quebec eligibility statements."
 *
 * The 13 Canadian subdivisions (ISO-3166-2). Quebec ('QC') is excluded.
 */

export const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
] as const;

// Canada Post format: A1A 1A1 (letter, digit, letter, optional space, digit, letter, digit).
// Excludes letters D, F, I, O, Q, U as first letter (Canada Post convention) — and
// W, Z anywhere but we accept loosely since Stripe Tax will re-validate downstream.
const POSTAL_CODE_RE = /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i;

export interface BillingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export interface QuebecAttestations {
  no_qc_head_office: boolean;
  no_qc_operating_address: boolean;
  no_qc_establishment: boolean;
  no_material_qc_use: boolean;
}

export type ValidationOk = { ok: true };
export type ValidationError = {
  ok: false;
  code:
    | 'country_not_ca'
    | 'province_quebec'
    | 'province_invalid'
    | 'postal_code_invalid'
    | 'missing_field'
    | 'attestation_not_confirmed';
  message: string;
  field?: string;
};

export type ValidationResult = ValidationOk | ValidationError;

export function validateBillingAndAttestations(
  billing: BillingAddress,
  attestations: QuebecAttestations,
): ValidationResult {
  // Required-field checks before the eligibility gate so we don't false-reject blanks.
  const requiredStrings: Array<[keyof BillingAddress, string]> = [
    ['line1', 'address line 1'],
    ['city', 'city'],
    ['province', 'province'],
    ['postal_code', 'postal code'],
    ['country', 'country'],
  ];
  for (const [field, label] of requiredStrings) {
    const value = billing[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      return {
        ok: false,
        code: 'missing_field',
        message: `Please enter your ${label}.`,
        field,
      };
    }
  }

  const country = billing.country.trim().toUpperCase();
  if (country !== 'CA') {
    return {
      ok: false,
      code: 'country_not_ca',
      message: "We're CAD-only at launch. Use the contact form to reach the founder.",
      field: 'country',
    };
  }

  const provinceCode = billing.province.trim().toUpperCase();
  const knownProvince = CANADIAN_PROVINCES.find((p) => p.code === provinceCode);
  if (!knownProvince) {
    return {
      ok: false,
      code: 'province_invalid',
      message: 'Please select a Canadian province or territory.',
      field: 'province',
    };
  }

  if (provinceCode === 'QC') {
    return {
      ok: false,
      code: 'province_quebec',
      message:
        "We're not currently serving Quebec engagements. Use the contact form to reach the founder.",
      field: 'province',
    };
  }

  const postal = billing.postal_code.trim().toUpperCase();
  if (!POSTAL_CODE_RE.test(postal)) {
    return {
      ok: false,
      code: 'postal_code_invalid',
      message: 'Please enter a valid Canadian postal code (e.g. V5K 0A1).',
      field: 'postal_code',
    };
  }

  const allAttested =
    attestations.no_qc_head_office === true &&
    attestations.no_qc_operating_address === true &&
    attestations.no_qc_establishment === true &&
    attestations.no_material_qc_use === true;

  if (!allAttested) {
    return {
      ok: false,
      code: 'attestation_not_confirmed',
      message:
        'Confirm all four Quebec eligibility statements. We can only serve customers outside Quebec.',
      field: 'attestations',
    };
  }

  return { ok: true };
}

export function normalizePostalCode(input: string): string {
  // Standard Canada Post display format: "A1A 1A1" with single space.
  const cleaned = input.replace(/[\s-]+/g, '').toUpperCase();
  if (cleaned.length !== 6) return input.trim().toUpperCase();
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
}
