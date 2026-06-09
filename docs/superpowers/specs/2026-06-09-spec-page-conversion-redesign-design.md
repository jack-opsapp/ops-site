# SPEC Page Conversion Redesign — Design

- **Date:** 2026-06-09
- **Worktree / branch:** `/private/tmp/ops-site-spec-release` @ `release/spec-launch-ops-site-20260607` (build directly here; no parallel ops-site work per owner)
- **Surface:** ops-site customer-facing `/spec` (public SPEC sales page) — NOT the ops-web `/admin/spec` operator back-office
- **Status:** Direction approved 2026-06-09. Implementation phased + verified live on `localhost:3001`.

## Goal
Make `/spec` an extremely well-converting, design-system-perfect customer page for the SPEC service (done-for-you custom software; **live Stripe deposits** — $750 / $2,125 / $4,500 for Setup / Build / Enterprise). Every change traces to the OPS design system **and** a conversion rationale.

## Current-state findings
- **Layout cage:** hero, how-it-works, and pricing are locked into a `lg:w-[55%]` + `max-w-[720px]` column because a fixed 3D phone occupies the right ~55%. The OPS BOARD already breaks out full-width → packages render in the left half.
- **Buried CTA:** the deposit button only appears after expanding a package card (2 clicks deep) and is `depositsEnabled`-gated.
- **Accent overuse:** `ops-accent` (#6F94B0) paints tier labels, checkmarks, example chips, expanded-card tint, bullets, guarantee underlines, board selected rows — far beyond the reserved "primary CTA + focus + single active marker."
- **Availability is real, live data** (`spec_public_board_snapshot`, 5-min refresh; `availability` / `waitlist_bucket` / `next_start_week`). Looks empty locally only because Supabase isn't wired in this worktree (fallback = all OPEN / 0 waitlist).
- **Timeline = OPS BOARD** (Today→Discovery→Build→Delivery), fed by snapshot + dict strings; dates are currently static labels. `TIER_DURATIONS` (discovery/build day ranges per tier) already exist in `SpecOpsBoard`.

## Design-system guardrails (every change)
- **Accent = primary CTA fill + focus rings + the single "you-are-here/active" data-viz marker. Nothing else.** Everything else → monochrome (white-opacity tiers) or earth-tone semantics (olive/tan/rose).
- Numbers: JetBrains Mono, tabular-lining, slashed-zero, always formatted; empty = `—`.
- Motion: one easing `cubic-bezier(0.22,1,0.36,1)`, no bounce, honor `prefers-reduced-motion` with an equivalent reduced variant (not a disabled one).
- Voice (all new copy via `ops-copywriter`): terse, tactical, no exclamation; "subtrades / crew / owner-operator", never "contractor."

## Workstreams
1. **Color rollback (foundation).** Strip `ops-accent` from labels, checkmarks, example chips, card tints, bullets, guarantee underlines, board selected-row → hairlines + white-opacity (checkmarks may use olive for "included" if desired). Accent survives only on: deposit CTA, focus rings, the timeline TODAY node. Components: PackageCard, SpecPricing, WhatsIncluded, SpecGuarantees, HowItWorks, SpecOpsBoard, SpecHero (secondary), SpecBottomCTA, and the flow forms (BillingAddress/Intake/OwnerApproval/Confirmation) for consistency.
2. **Timeline rebuild + dynamic dates (OPS BOARD).** Rebuild the rail as a tactical instrument (research §1): ticked CSS-ruler substrate; three-state nodes (complete = filled square / active = hollow + one pulsing halo / upcoming = dashed hairline); single animated fill with a 1px leading scan-edge (animate the active segment only — Vercel status-dot discipline); monospaced date-window labels. Exactly one infinite animation (active halo) + one entrance (one-time draw-in); reduced-motion → final state. **Dates** computed from today + selected tier's discovery/build durations + next-open-slot: `TODAY · Jun 09` → `DISCOVERY · Jun 12–17` → `BUILD · Jun 18–Jul 09` → `DELIVERY · ~Jul 14`; unknown → `—`. Route: animation-studio:web-animations + data-visualization.
3. **Full-width packages + surfaced deposit CTA + sticky bar.** Lift SpecPricing out of the 55% column (phone has scrolled away by then) to full width; convert the click-to-expand accordion into a 3-up tier comparison with **Build** elevated (highlighted recommended tier ≈ +22% vs flat). Deposit CTA always visible per card: verb-first outcome label ("Reserve your build slot — $2,125 deposit") + mono ledger ("DEPOSIT · CREDITED TO BUILD · BALANCE OVER 4 MILESTONES"). Add a persistent hairline **sticky deposit bar** (appears after hero; one action + live slot count + next-start). Wired to existing `/api/spec/create-checkout-session`; flag-safe via `depositsEnabled`.
4. **"Help me choose" questionnaire.** ≤4 questions, one-per-screen (scope / timeline / team size / budget band — never features), weighted → deterministic `recommend(answers): Tier` (bias Build on ties; pure + unit-tested). Resolves by scrolling to packages with the recommended card pre-highlighted + a one-line rationale; result persisted to a URL param (shareable with a co-owner). Opt-in entry near packages. Copy via ops-copywriter.
5. **Availability / demand (Decision A — recommended path).** Drive the board from **real, operator-controlled capacity seeded with plausible baselines** that evolve as operators update it — NOT a synthetic client-side random generator (fabricated scarcity erodes trust + carries consumer-protection risk per research, and would fight the live snapshot pipeline). Locally, populate the fallback so the page never looks dead. Render `—` when unknown. (If owner insists on synthetic numbers later, revisit — flagged.)

## Phasing (build → verify → commit each, live on :3001)
**P1** Color rollback → **P2** Timeline + dynamic dates → **P3** Full-width packages + deposit CTA + sticky bar → **P4** Questionnaire → **P5** Availability/demand seed.

## Verification
- `npm run build` clean per phase; visual check on `localhost:3001` (`/spec`, English); reduced-motion pass on the timeline; `recommend()` unit test; deposit CTA → Stripe session (flag-aware) smoke.

## Out of scope
- ops-web admin surface; checkout/intake/owner-approval internals (only the entry CTA + flag wiring); the i18n EN-toggle bug (diagnosed separately, fix still pending).
