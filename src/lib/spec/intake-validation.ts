/**
 * Server-authoritative validation for SPEC intake submissions.
 *
 * Three independent gates fire on submit:
 *   1. Regulated-workflow attestation — any of the 5 categories === true →
 *      block submission, stamp regulated_workflow_flagged_at, fire operator
 *      notification. (Source: SPEC/01_BUSINESS_MODEL.md § 3 prohibited.)
 *   2. Quebec re-check — if intake collects any QC criterion (head office,
 *      operating address, establishment, material SPEC use) marked true,
 *      block + operator notification + refund path. (Source:
 *      SPEC/04_CUSTOMER_UX.md § /spec/intake/[token] § 2 Business basics.)
 *   3. Uploaded file paths must be under `{spec_project_id}/` (no escape, no
 *      other project's bucket).
 */

import { isValidIntakeObjectPath } from '@/lib/spec/intake-storage';

export const REGULATED_WORKFLOW_KEYS = [
  'phi_phipa',
  'pci_raw_card',
  'regulated_credit',
  'surveillance',
  'casl_bulk_messaging',
] as const;

export type RegulatedWorkflowKey = (typeof REGULATED_WORKFLOW_KEYS)[number];

export type RegulatedWorkflowAttestations = Record<RegulatedWorkflowKey, boolean>;

export const REGULATED_WORKFLOW_LABELS: Record<RegulatedWorkflowKey, string> = {
  phi_phipa: 'HIPAA / PHIPA / health-data workflows',
  pci_raw_card: 'PCI raw card capture',
  regulated_credit: 'Regulated credit decisions',
  surveillance: 'Unlawful surveillance',
  casl_bulk_messaging: 'CASL- or TCPA-violating bulk messaging',
};

export const QUEBEC_INTAKE_KEYS = [
  'qc_head_office',
  'qc_operating_address',
  'qc_establishment',
  'qc_material_use',
] as const;

export type QuebecIntakeKey = (typeof QUEBEC_INTAKE_KEYS)[number];

export type QuebecIntakeAttestations = Record<QuebecIntakeKey, boolean>;

export const QUEBEC_INTAKE_LABELS: Record<QuebecIntakeKey, string> = {
  qc_head_office: 'Quebec head office',
  qc_operating_address: 'Quebec operating address',
  qc_establishment: 'Quebec establishment',
  qc_material_use: 'Material SPEC use in Quebec',
};

export type IntakeGate =
  | { ok: true }
  | { ok: false; code: 'regulated_workflow'; flagged: RegulatedWorkflowKey[] }
  | { ok: false; code: 'quebec_intake'; flagged: QuebecIntakeKey[] }
  | { ok: false; code: 'file_path_invalid'; bad: string[] }
  | { ok: false; code: 'malformed' };

export interface IntakeSubmissionPayload {
  responses: Record<string, unknown>;
  regulated_workflow_attestations: RegulatedWorkflowAttestations;
  quebec_intake_attestations: QuebecIntakeAttestations;
  uploaded_file_paths: string[];
}

export function normalizeAttestations<T extends string>(
  keys: readonly T[],
  input: unknown,
): Record<T, boolean> {
  const result = {} as Record<T, boolean>;
  const obj = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  for (const key of keys) {
    result[key] = obj[key] === true;
  }
  return result;
}

export function regulatedWorkflowFlags(
  attestations: RegulatedWorkflowAttestations,
): RegulatedWorkflowKey[] {
  return REGULATED_WORKFLOW_KEYS.filter((k) => attestations[k] === true);
}

export function quebecIntakeFlags(
  attestations: QuebecIntakeAttestations,
): QuebecIntakeKey[] {
  return QUEBEC_INTAKE_KEYS.filter((k) => attestations[k] === true);
}

/**
 * Run every gate in the order required by the rollout spec. Stops at the
 * first failing gate — the caller fires the appropriate operator notification
 * + email path per code.
 */
export function validateIntakeSubmission(
  specProjectId: string,
  payload: IntakeSubmissionPayload,
): IntakeGate {
  if (!payload.responses || typeof payload.responses !== 'object') {
    return { ok: false, code: 'malformed' };
  }

  const regulated = regulatedWorkflowFlags(payload.regulated_workflow_attestations);
  if (regulated.length > 0) {
    return { ok: false, code: 'regulated_workflow', flagged: regulated };
  }

  const qc = quebecIntakeFlags(payload.quebec_intake_attestations);
  if (qc.length > 0) {
    return { ok: false, code: 'quebec_intake', flagged: qc };
  }

  const bad = payload.uploaded_file_paths.filter(
    (p) => !isValidIntakeObjectPath(p, specProjectId),
  );
  if (bad.length > 0) {
    return { ok: false, code: 'file_path_invalid', bad };
  }

  return { ok: true };
}
