# TMA shared period selection and multi-range analytics

## Title

Ship one shared TMA period chip + picker flow with week/month/year presets backed by date ranges

## Purpose / Big Picture

Add one shared period-selection flow for the Telegram Mini App so Home, household list, and household detail all read the same selected range and stay in sync. Users will see the current period as a tappable chip, open a dedicated picker page with week/month/year tabs, choose a preset with the Telegram BottomButton, and return to the previous screen with refreshed analytics that match the generated `date_from` / `date_to` window.

## Scope

- Change TMA shared period modeling, route wiring, picker UI, and cross-screen Zustand state under `apps/tma/src`.
- Extend worker analytics query contracts and handlers under `apps/worker/src` so `GET /api/v1/analytics/overview` and `GET /api/v1/analytics/comparison` accept additive `date_from` / `date_to` ranges alongside the existing month query for compatibility.
- Update Home, household list, household detail, and shared summary/household smart components to consume the shared period state instead of hardcoded current month.
- Add focused worker and TMA tests for period parsing, store behavior, picker behavior, and selected-period query plumbing.
- Update harness artifacts for the new slice.

Out of scope:

- Web app period UI.
- Group analytics or CSV export period broadening.
- Budget schema changes or non-monthly budget entities.
- Persisting selected period across app restarts.

## Non-negotiable Requirements

- The plan must stay consistent with TMA router/navigation ownership and worker contract boundaries.
- Observable success must include both focused test evidence and interactive behavior evidence for the shared picker flow.
- Week/month/year preset semantics must be explicit in code and tests; the worker source of truth is a concrete date range, not an overloaded period string.
- Monthly budgets remain monthly truth. Week/year views must not fake budget aggregation from monthly budget rows.

## Progress

- [x] 2026-06-05 Inspect active TMA + worker period code paths and write failing tests for shared period modeling/store and worker query validation/range helpers.
- [x] Implement worker additive date-range query parsing and overview/comparison range support without breaking existing month consumers in the same session.
- [x] Implement TMA shared period store, formatting helpers, and picker route with tabbed year/month/week selection plus BottomButton confirm flow.
- [x] Rewire Home, household list, household detail, and shared finance/household components to read the shared period state and render the shared chip.
- [x] Run focused verification, final repo verification, GitNexus change detection, and harness updates.

## Surprises & Discoveries

- The current worker analytics contracts only accept `YYYY-MM` query values, so week/year support requires a contract shift to date ranges.
- Household/home summary cards currently mix analytics totals with monthly budget state. Repo product docs define budgets as monthly only, so week/year views must hide budget-progress/budget labels instead of inventing new budget semantics.

## Decision Log

- Decision: move worker analytics query contracts to `date_from` / `date_to` and keep TMA preset selection as `{ granularity, dateFrom, dateTo }`.
  Rationale: date ranges scale to future presets or custom ranges better than a month-only period string, while TMA still needs granularity metadata to render the chip as week/month/year.
  Date/Author: 2026-06-05 / Codex
- Decision: keep selected-period state in a small non-persisted Zustand store.
  Rationale: the user asked for Zustand-backed cross-page sync, while TMA state docs warn against unnecessary persistence; session-only synchronization is enough for this feature.
  Date/Author: 2026-06-05 / Codex
- Decision: render budget state only for `month` selections.
  Rationale: `docs/product-specs/shared/budget-management.md` defines monthly budget creation/tracking; week/year budget rollups would change product meaning.
  Date/Author: 2026-06-05 / Codex

## Outcomes & Retrospective

- Home, household list, and household detail now share one Zustand-backed TMA period selection and open one dedicated picker route.
- Worker analytics overview/comparison now accept additive `date_from` / `date_to` ranges while preserving existing month-query callers.
- Budget UI stays truthful by remaining month-only when the selected preset is week or year.

## Context and Orientation

- TMA shared summary UI: `apps/tma/src/features/finance/components/summary.tsx`
- TMA household smart components: `apps/tma/src/features/finance/components/households.tsx`
- TMA home + household pages: `apps/tma/src/features/home/components/home-overview-section.tsx`, `apps/tma/src/features/households/pages/household-list-page.tsx`, `apps/tma/src/features/households/pages/household-detail-page.tsx`, `apps/tma/src/features/households/components/household-overview-section.tsx`
- TMA router and shell: `apps/tma/src/app/router/app-router.tsx`, `apps/tma/src/components/shared/tma-page-shell.tsx`, `apps/tma/src/lib/constants/routes.ts`
- Current TMA period helper: `apps/tma/src/lib/period.ts`
- Worker analytics contracts/handlers: `apps/worker/src/contracts/analytics-schemas.ts`, `apps/worker/src/contracts/analytics-types.ts`, `apps/worker/src/handlers/analytics/*.ts`
- Worker analytics repositories consume explicit timestamps: `apps/worker/src/db/repositories/expense-analytics-repository.ts`, `apps/worker/src/db/repositories/expense-query-repository.ts`

## Standards and Reference Docs

- `docs/TMA.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`
- `docs/BACKEND.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/error-handling-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/shared/type-naming-pattern.md`
- `docs/product-specs/shared/analytics-overview.md`
- `docs/product-specs/shared/budget-management.md`
- `docs/product-specs/shared/household-management.md`

Concrete coding constraints from those references:

- TMA route/page components own navigation and BottomButton wiring; the chip itself only links into the picker page.
- TanStack Query remains owner of worker-backed data; Zustand only owns the selected-period UI state and pending picker draft.
- Worker validation must be explicit. The new analytics range contract should align naming with existing repo query filters (`date_from`, `date_to`) instead of inventing a second range vocabulary, while preserving the old month query as a compatibility path.
- Protected analytics endpoints stay behind auth middleware and keep the existing JSON envelope.
- New DTO/request/response names use standard `DTO`/`Response` naming.

## Plan of Work (Narrative)

First, add failing tests for shared period modeling on both sides: worker helper/schema tests proving additive `date_from` / `date_to` validation and previous-range logic, plus TMA tests proving the selected-period store defaults to the current month range, supports drafting a new preset, and applies it only on confirm. Then implement a worker-side analytics contract expansion with optional date ranges, plus pure helpers that build previous-range descriptors from the selected `[dateFrom, dateTo)` window. Update the analytics overview/comparison handlers to use those helpers while preserving the existing response envelope and keeping existing month callers working.

On the TMA side, introduce one small period domain module under `apps/tma/src/features/period/` (types, store, helpers, picker page). The shared selected-period object will keep `granularity`, `dateFrom`, and `dateTo`. Add a shared chip component that formats week as `dd/MM-dd/MM`, month as `MM/yy`, and year as `yyyy`. The picker route will render three tabs and show: years list for the year tab; a two-column year/month layout for month; and a two-column year/week layout for week. The page owns the BottomButton text, disabled state, and apply handler. A local draft selection will update immediately inside the picker, but the global selected period store only changes when the BottomButton confirms.

Finally, replace hardcoded `getCurrentPeriod()` usage across Home, household list, household detail, and shared finance/household components with the shared selected-period store and chip. Analytics queries will include `date_from` and `date_to` derived from the shared store. Budget queries/rendering will remain enabled only for `month` selections, with truthful fallback copy for week/year. Finish by updating harness records and running focused plus full verification.

## Concrete Steps (Commands)

Run from repo root:

```bash
./init.sh sync
pnpm --filter worker exec vitest run test/unit/analytics-period.test.ts
pnpm --filter tma exec vitest run src/test/period-store.test.tsx src/test/period-picker-page.test.tsx
./init.sh typecheck
./init.sh lint
./init.sh test
./init.sh build
./init.sh
```

Expected short outputs:

- Focused vitest commands print passing test counts after first failing red step is resolved.
- `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` print `OK`.
- Final `./init.sh` prints `Done!`.

## Validation and Acceptance

Happy path:

- Opening Home, household list, or household detail shows the same formatted period chip.
- Tapping the chip opens the period picker route without a WebView reload.
- Switching to month and choosing year/month requires BottomButton confirmation before all three read surfaces refresh together.
- Switching to week shows a `dd/MM-dd/MM` chip label and updates Home + household summaries consistently.
- Switching to year shows a `yyyy` chip label and updates Home + household summaries consistently.
- Network requests for analytics overview/comparison carry the selected `date_from` / `date_to` range instead of a month string.

Validation/error path:

- Invalid worker analytics range values return validation failure rather than silently coercing.
- If the picker has no selected candidate yet, BottomButton stays disabled.
- Week/year selections do not show misleading monthly budget-progress UI.

Regression checks:

- Existing month behavior still works for analytics overview/comparison consumers.
- Household list/detail navigation and BottomButton cleanup remain correct after leaving the picker page.

## Idempotence & Recovery

- Code/test/doc steps are safe to re-run.
- No schema migration is planned, so rollback is a normal git revert of touched files if needed.
- If a contract change proves too broad, the recovery path is to keep the richer period helper internal and preserve the old query shape until consumers are updated in the same session.

## Artifacts and Notes

- Harness updates required: `harness/feature_index.json`, `harness/features/feat-096.json`, `harness/progress.md`
- Plan index update required: `docs/exec-plans/index.md`
- GitNexus evidence required before the final ready summary: upstream impact on touched symbols before edits and `detect_changes(scope: "all")` before completion.

## Interfaces & Dependencies

- Existing analytics endpoints: `GET /api/v1/analytics/overview`, `GET /api/v1/analytics/comparison`
- Existing TMA auth/query stack: `apps/tma/src/lib/api/client.ts`, TanStack Query hooks under `apps/tma/src/features/home/api.ts` and `apps/tma/src/features/households/api.ts`
- Telegram BottomButton wrapper: `apps/tma/src/lib/telegram/bottom-button.ts`
- Zustand: already in repo for TMA expense/auth state; reuse for selected-period state
