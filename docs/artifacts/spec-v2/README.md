# SPEC Tier Model v2 — Evidence Pack (2026-07-14)

Branch: `feat/spec-tier-model-v2` (base: `origin/main` + merged `release/spec-launch-ops-site-20260607`).
Plan: `docs/plans/2026-07-14-spec-tier-model-v2.md`. Design authority: `ops-software-bible/SPEC/10_TIER_MODEL_V2.md`.

## Gates (final run, 2026-07-14)

| Gate | Result |
|---|---|
| Full test suite (`npm test`) | 91 / 91 pass |
| Cron suite (`npm run test:spec-cron`) | 24 / 24 pass |
| `npx tsc --noEmit` | 0 errors |
| `npm run build` | compiled, exit 0 (blog/related-posts warnings are the known local anon-env fallbacks) |
| `npm run lint` | 0 errors in any file this branch touched — remaining repo lint debt is pre-existing on `origin/main` (animations/assessment/shop + `phone-scene/SpecPhoneScene.tsx`, the read-only parallel-agent surface) |
| Banned-term grep (`contractor\|contratista` on the spec surface + dictionaries) | 0 hits |
| Old-slug grep (`setup\|build\|enterprise` in spec logic) | 0 live hits — remaining: the slug-rejection test, `timeline.ts` *phase* keys, and the documented v2→v1 phone-scene bridge in `SpecPageContent.tsx` |
| Design audit | 0 new hardcoded values; accent only on CTA fill + focus rings (one per screen state). Pre-existing notes: hero ambient hex gradients (site-wide pattern, June branch), board rgba gridline (hairline-equivalent in a background-image string) |

## Screenshots

Desktop 1280: `spec-v2-desktop-{hero,ladder,board,whitelabel-ongoing,faq,bottomcta}.png`
Guide results: `spec-v2-guide-result-{ops,spec01,spec02-existing}.png`
Mobile 375: `spec-v2-mobile-{hero,ladder,board,guide}.png` — horizontal scroll: none (367 ≤ 375).

Interaction passes (Playwright, live dev server): keyboard-only guide completion (focus seeded per step, Escape closes), reduced-motion (content opacity 1, guide functional), guide walkthroughs on all three lanes with single-fire analytics, `?fit=` deep-link writes verified (`ops`, `spec01`, `spec02`).

## Stripe proof (`stripe-test/`)

`capture-session-payloads.ts` runs the production session builder (`createSpecStripeCheckoutSession` — the same function the checkout route calls after its gates) with the SDK patched at the API boundary, and asserts the E1 checklist: spec01 $1,000 50% deposit line, spec03 $6,250 floor deposit line, `metadata.type='spec_deposit'`, v2 `metadata.tier` slugs, v2 `tos_version_hash` pinned, ToS consent required, automatic tax on, CAD. Captured payloads: `session-payloads.json`.

**Not yet proven:** Stripe *accepting* these params in test mode — no test-mode key exists on this machine (only a live restricted key, and E1 forbids live objects). Recorded as a deposit-flip gate in `07_ROLLOUT` § Phase 0; needs a test key from the Stripe dashboard.

## Cross-repo landings

- **Supabase (prod, live):** `spec_capacity` re-seeded to spec01/02/03 (v2 prices/windows/slots), tier CHECKs retargeted, additive `spec_projects` columns (`locked_total_cents`, `white_label`, `care_monthly_cents`, `care_started_at`). Migrations mirrored to `ops-software-bible/migrations/20260715035835_*` + `20260715035945_*`. Board snapshot regenerated + live-verified on-page.
- **ops-web:** admin rename on `worktree-spec-launch-consolidation` @ `514d4bbf` (0 new type errors; 8/8 spec unit tests pass).
- **Bible:** 06A ToS v2 prose + 06B/06C touches; doc-pass across 01/02/03/04/05/07/09/10.
- **Known pre-existing (not this branch):** intermittent nav-logo `useId` hydration mismatch (site shell, all pages); `SpecPhoneWrapper` phase choreography now driven by ladder/board/ongoing zones — the phone scene itself is untouched and still keys tier screens off v1 ids via the documented bridge.
