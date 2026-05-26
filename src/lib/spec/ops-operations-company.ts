/**
 * Constant UUID of the seeded "OPS Operations" company.
 *
 * Source: ops-software-bible/SPEC/02_DATA_MODEL.md § OPS Operations internal
 * company. Operator-facing notifications use this `company_id` because
 * `public.notifications.company_id` is `text NOT NULL`.
 *
 * Seeded by `migrations/2026-05-25-spec-phase1-02-internal-company.sql`.
 */

export const OPS_OPERATIONS_COMPANY_ID = '00000000-0000-0000-0000-00000000000a';
