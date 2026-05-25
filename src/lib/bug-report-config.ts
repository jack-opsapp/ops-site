/**
 * Bug-report sentinel identifiers for ops-site.
 *
 * The marketing site has no auth, but `bug_reports.company_id` and
 * `bug_reports.reporter_id` are NOT NULL. We pin every anonymous report
 * to a sentinel "ANONYMOUS USER" company row and a fixed reporter UUID so
 * the admin feedback view (`/admin/feedback` in OPS-Web) can distinguish
 * marketing-site reports from real product reports.
 *
 * The company id below corresponds to a real row in `public.companies`
 * (name = "ANONYMOUS USER"). The reporter id is a fixed sentinel — there is
 * no FK on `bug_reports.reporter_id`, and the admin UI does not join it.
 */
export const ANONYMOUS_COMPANY_ID = '552674fe-aa32-4fcf-824d-e2c79eb56f32';
export const ANONYMOUS_REPORTER_ID = '00000000-0000-0000-0000-000000000001';
export const BUG_REPORT_SOURCE = 'ops-site';
