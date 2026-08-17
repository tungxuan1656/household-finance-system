# TMA shadcn UI migration Implementation Plan

> **Execution:** Work through the checked tasks in order. Do not pass an oracle gate until its audit is clean; use the scoped rollback checkpoint before proceeding to the next destructive phase.

**Goal**

Migrate feasible generic TMA UI primitives to the approved shadcn/ui foundation while preserving product behavior, native picker contracts, DataState behavior, Telegram navigation/safe-area behavior, and the accepted eager-route policy.

**Architecture**

- Keep generic UI contracts under `apps/tma/src/components/ui/`, route composition under `apps/tma/src/app/router/` and `apps/tma/src/routes/`, and Telegram adapters under `apps/tma/src/lib/telegram/`.
- Keep CTA state in route/page content and retain shell ownership of route composition, BackButton behavior, safe-area layout, tab rail, and the single scroll root.
- Keep generated UI provenance in `apps/tma/components.json` and isolate local compatibility behavior in the existing component seams.

**Tech Stack**

- React + Vite SPA, React Router, TanStack Query, Zustand, Framer Motion, and Tailwind CSS v4 remain the application substrate.
- Use Base UI through exact shadcn preset `b6G3fhkA4` (Lyra, yellow/neutral, Geist Mono, Lucide).
- Pin the shadcn generator to `4.18.0`; use exact migration dependency specifiers and lock the resulting graph in `apps/tma/package.json` and `pnpm-lock.yaml`.

## Global Constraints

- Keep TMA visual UI fixed light-only. Do not bind Telegram host theme colors into the visual system.
- Do not use Telegram `BottomButton` or `MainButton` anywhere. Every CTA is an in-page shadcn `Button`.
- Locally customize the generated Button while preserving the current Button public API initially. One enabled activation produces exactly one Telegram `impact('light')` from the centralized Button path.
- A loading CTA uses `disabled` and `aria-busy`; loading must not invoke the handler or produce a Button haptic.
- Preserve `NativePicker`, `DatePicker`, and `DataState` public contracts and behavior. Native picker/date-picker haptics remain intact.
- Non-button controls do not gain indiscriminate feedback; preserve only existing native picker/date-picker and meaning-specific haptics.
- Retain Telegram `BackButton`, required `themeParams.mount()` setup, platform safe-area setup, the tab rail, and one scroll root per screen.
- Remove legacy visual `--tma-*` tokens only after the visual-token audit returns zero consumers. Keep Telegram platform safe-area variables and their binding.
- Canonical UI decisions are already reconciled in `docs/references/frontend/tma/native-ui-and-navigation-pattern.md` and `apps/tma/DESIGN.md`; implementation does not schedule duplicate documentation edits.

---

## Scope and non-goals

### In scope

- Generator/config provenance, exact dependency locking, and generated Base UI component baseline.
- Migration of feasible generic primitives under `apps/tma/src/components/ui/`.
- Central Button activation, haptic, disabled, and loading contracts.
- In-page CTA replacement on the nine current routes listed below.
- Complete BottomButton/MainButton bridge removal, including bootstrap, capability detection, mocks, tests, and shell cleanup.
- Fixed-light theme binding cleanup while preserving viewport safe-area CSS variables.
- Legacy visual token migration and zero-reference deletion.
- Root-route BackButton ownership/visibility audit and shell/layout regression review.
- Non-render unit tests, required repository checks, and real Telegram iOS/Android QA.

### Non-goals

- No dark-mode implementation or Telegram-adaptive visual theme.
- No NativePicker or DatePicker replacement.
- No DataState behavior, API, backend, auth, route-order, or product-flow changes.
- No change to the accepted eager static route-import policy. Do not remove or add unrelated lazy-loading or preload work; leave `apps/tma/src/app/router/app-router.tsx` and the existing `prefetchRoute` policy in `apps/tma/src/components/shared/tma-bottom-tabs.tsx` outside this migration except for required token or CTA-adjacent edits.
- No visual redesign beyond applying the approved generated foundation and replacing native global CTAs with in-page Buttons.
- No commit steps.

## Current interfaces and file boundaries

- `apps/tma/src/components/ui/button.tsx`: preserve `ButtonProps`, `ButtonVariant`, `ButtonSize`, `buttonVariants`, native button attributes, `type`, `disabled`, and children behavior while replacing the styling/implementation foundation with generated Base UI-compatible code.
- `apps/tma/src/components/ui/data-state.tsx`: preserve `DataStateProps`, loading/error/empty branching, retry callback, custom action, and child rendering; restyle its existing Card/Button presentation.
- `apps/tma/src/components/ui/native-picker.tsx`: preserve `NativePickerProps`, hidden native `<select>`, `onChange`, disabled behavior, and existing `impact('light')` native-picker haptic.
- `apps/tma/src/components/ui/date-picker.tsx`: preserve `DatePickerProps`, `date`/`month` modes, hidden native input, `onChange`, disabled behavior, and existing `impact('light')` date-picker haptic.
- `apps/tma/src/components/ui/card.tsx`, `form.tsx`, `chip-button.tsx`, `segmented-control.tsx`, `primitives.tsx`, and `index.ts`: retain consumer-facing exports where feasible and migrate their implementation or composition to generated Base UI/shadcn primitives without changing product semantics.
- `apps/tma/src/components/shared/tma-page-shell.tsx`: remove BottomButton cleanup and `reserveBottomButton` after all consumers migrate; retain the single `main` scroll root, safe-area padding, route shell, pull-to-refresh, and tab rail.
- `apps/tma/src/lib/telegram/back-button.ts`, `safe-area.ts`, and `haptics.ts`: retain their BackButton-close, safe-area, and haptic contracts.
- `apps/tma/src/lib/telegram/bottom-button.ts`: delete only after all nine route consumers and shell references are gone.

## Implementation tasks

### Task 1: Establish generator and dependency provenance

- [ ] Add `apps/tma/components.json` from the pinned `shadcn@4.18.0` generator using preset `b6G3fhkA4`, Base UI, Lyra, yellow/neutral, Geist Mono, Lucide, the existing `src/index.css`, `@/components/ui`, and `@/lib/utils` aliases.
- [ ] Add the generator as an exact `4.18.0` development dependency in `apps/tma/package.json`; add only the runtime packages emitted by the approved Base UI preset and lock their resolved versions in `pnpm-lock.yaml`.
- [ ] Use exact version specifiers for every new migration dependency and confirm the `apps/tma` importer and package snapshots in `pnpm-lock.yaml` match those specifiers.
- [ ] Capture the generated component/config baseline before local customization. Keep generated provenance distinguishable from local compatibility changes; do not hand-copy a different shadcn version or preset.
- [ ] Confirm the existing `cn()` utility in `apps/tma/src/lib/utils.ts` remains the shared class-composition seam used by generated and compatibility components.

### Task 2: Migrate generic UI primitives and preserve contracts

- [ ] Replace `button.tsx` with the generated Base UI Button foundation, then retain the current `ButtonProps`, `ButtonVariant`, `ButtonSize`, `buttonVariants`, native attributes, and initial consumer call sites through a local compatibility layer.
- [ ] Implement the centralized Button activation path so an enabled activation calls `impact('light')` exactly once and then invokes the caller handler once.
- [ ] Enforce the loading contract in the Button activation path: `disabled` or `aria-busy` prevents both handler and haptic; callers expose pending state through `disabled` and `aria-busy`; no separate global progress bridge remains.
- [ ] Ensure `NativePicker` and `DatePicker` keep their native hidden control and existing haptic path. Their presentational Button must not create a second activation because it remains non-interactive to pointer input while the native control owns the click.
- [ ] Rebase `Card`, `Field`, `FieldLabel`, `Input`, `Textarea`, and `FieldError` on generated Base UI/shadcn-compatible primitives while retaining their current exported names and prop behavior.
- [ ] Make `ChipButton` and `SegmentedControl` use the migrated Button/base interaction foundation where feasible, preserving category/source/filter selection callbacks and semantic selection haptics.
- [ ] Keep `primitives.tsx` as local finance presentation wrappers where no generated primitive is appropriate; migrate visual classes away from legacy visual token aliases.
- [ ] Keep `DataState` behavior unchanged and restyle its Card, title, description, and retry Button through the migrated foundation.
- [ ] Keep `apps/tma/src/components/ui/index.ts` as the stable barrel and update exports only for generated or compatibility files actually used by TMA.

### Task 3: Replace every route CTA before bridge deletion

Replace the current BottomButton effect with an in-page shadcn `Button` in each route below. Keep the existing handler, validation, navigation, mutation, notification, selection, and semantic haptic behavior; only move CTA ownership from the Telegram bridge into page content.

| Route path | Current source | CTA contract to preserve |
|---|---|---|
| `/expenses/new/details` | `apps/tma/src/routes/add-expense-details.tsx` | Continue only when amount/source are valid; preserve category/date state, Enter handling, success notification, and navigation to context. |
| `/expenses/new/context` | `apps/tma/src/routes/add-expense-context.tsx` | Save only when the draft is ready; preserve household/group pickers, mutation pending state, save label, feedback, reset, and navigation. |
| `/expenses/new/chat` | `apps/tma/src/routes/add-expense-chat.tsx` | Parse only when input is non-empty; preserve pending state, warning/error notifications, parse result state, and navigation to import preview. |
| `/expenses/new/import` | `apps/tma/src/routes/add-expense-import-preview.tsx` | Save the selected import items; preserve selected count, pending state, partial-failure feedback, success notification, reset, and navigation to expenses. |
| `/incomes/new` | `apps/tma/src/routes/add-income.tsx` | Save only when valid and not pending; preserve one-page income behavior, success/error handling, and return to the income list. |
| `/expenses/:id/edit` | `apps/tma/src/routes/expense-edit.tsx` | Save only when the edit draft is valid and not pending; preserve draft lifetime across the category subroute, semantic save haptic, notifications, and detail navigation. |
| `/expenses/filter` | `apps/tma/src/features/expenses/pages/expense-filter-page.tsx` | Apply current filter state and preserve reset, period state, picker state, and history/back navigation. |
| `/period` | `apps/tma/src/features/period/pages/period-picker-page.tsx` | Apply the candidate period and preserve subpage return state, selected-period state, and history/back navigation. |
| `/invitations/:token` | `apps/tma/src/features/invitations/pages/accept-invitation-page.tsx` | Show Accept only for an authenticated valid preview; preserve pending state, accept mutation, notifications, household navigation, and the route-owned BackButton that closes the deep-link entry. |

- [ ] Add each CTA inside the route’s existing `TmaPageShell` content without creating a second scroll root or changing route transitions.
- [ ] Use `disabled` and `aria-busy` for every pending CTA; ensure Button text/progress presentation remains truthful in page content.
- [ ] Review all other `Button` consumers in `apps/tma/src/routes/**` and `apps/tma/src/features/**` for the migrated public API, including existing reset, retry, delete, close, and form-submit actions.
- [ ] Review shell/layout surfaces `apps/tma/src/components/shared/tma-page-shell.tsx`, `tma-bottom-tabs.tsx`, `tma-page-header.tsx`, `app-shell.tsx`, `pull-to-refresh.tsx`, and `loading-picker.tsx`; retain the tab rail, safe-area offsets, one scroll root, and existing eager-route behavior.

### Task 4: Delete the Telegram BottomButton/MainButton bridge completely

- [ ] Remove BottomButton imports, effects, cleanup calls, comments, and `reserveBottomButton` props from the nine route sources and every other source consumer.
- [ ] Remove the `hideBottomButton` effect and extra reserve-bottom-button padding from `apps/tma/src/components/shared/tma-page-shell.tsx`; retain normal tab-rail and safe-area bottom padding.
- [ ] Delete `apps/tma/src/lib/telegram/bottom-button.ts` after the consumer audit is empty.
- [ ] Remove only `mainButton` mounting from `apps/tma/src/app/bootstrap/telegram-init.ts`; retain required `themeParams.mount()` for Telegram Mini App setup, SDK init, `miniApp`, `backButton`, viewport, swipe behavior, init-data restore, and fixed host background setup.
- [ ] Remove `mainButton` and obsolete bridge capability entries from `apps/tma/src/lib/telegram/capabilities.ts`; retain supported haptics, storage, and BackButton capability checks.
- [ ] Update `apps/tma/src/test/telegram-init.test.ts` mocks and assertions for the remaining bootstrap surfaces; remove MainButton expectations and retain the required `themeParams.mount()` expectation.
- [ ] Update or replace `apps/tma/src/test/theme.test.ts` so visual Telegram theme binding is absent while viewport safe-area binding and cleanup remain covered.
- [ ] Search all TMA mocks and tests, including `apps/tma/src/test/telegram-init.test.ts`, for MainButton/BottomButton bridge assumptions before declaring deletion complete.

### Task 5: Make visual theme fixed light-only without losing safe-area setup

- [ ] Remove visual Telegram theme binding from `apps/tma/src/lib/telegram/theme.ts`, including Telegram theme CSS-variable subscriptions and visual theme cleanup; retain `themeParams.mount()` in bootstrap, `syncViewportInsets()`, and the `--tma-safe-*`/`--tma-content-safe-*` viewport mapping.
- [ ] Keep fixed light base colors and `color-scheme: light` in `apps/tma/src/index.css`; keep the native Telegram background/header/bottom-bar setup aligned with the fixed light base.
- [ ] Preserve `apps/tma/src/lib/telegram/safe-area.ts`, viewport mount timing, safe-area CSS variables, and `TmaPageShell` safe-area padding.
- [ ] Ensure host light and host dark Telegram settings produce the same fixed light TMA visual UI while safe-area and native picker behavior remain functional.

### Task 6: Migrate and remove legacy visual tokens only after the zero-reference gate

- [ ] Replace every consumer returned by the visual-token audit across `apps/tma/src/components/**`, `apps/tma/src/routes/**`, `apps/tma/src/features/**`, shared shell files, and tests with generated shadcn/Base UI semantic tokens or local non-visual platform-safe-area values.
- [ ] Do not remove any `--tma-safe-*` or `--tma-content-safe-*` declaration or binding; these are Telegram platform values, not legacy visual tokens.
- [ ] After the visual-token audit returns zero, remove the legacy visual declarations and Tailwind aliases from `apps/tma/src/index.css` and delete only now-unused compatibility styling.
- [ ] Re-run the safe-area audit after cleanup and review every remaining result manually against `theme.ts`, `TmaPageShell`, and the tab rail.

### Task 7: Audit BackButton ownership and preserve shell navigation

- [ ] Enumerate every `app-router.tsx` route and classify BackButton ownership as RootLayout-owned history/close behavior or invitation-route-owned deep-link close behavior.
- [ ] Confirm `/` hides BackButton, non-root in-app routes show it when a meaningful back target exists, and `/invitations/:token` keeps its single page-owned close handler without a duplicate RootLayout handler.
- [ ] Explicitly review `/fatal`, route-error output, and every dynamic detail/edit route for a meaningful back target; no route may inherit an accidental duplicate or orphaned BackButton binding.
- [ ] Preserve `apps/tma/src/lib/telegram/back-button.ts`, `RootLayout` cleanup, tab rail behavior, route shell ownership, and one scroll root; do not replace BackButton with an in-page fake.
- [ ] Keep `apps/tma/src/app/router/app-router.tsx` eager static imports unchanged and review its diff explicitly for accidental route-policy changes.

### Task 8: Add non-render unit coverage and run oracle gates

- [ ] Add non-render unit coverage for the Button activation contract: enabled activation calls one light impact and one handler; disabled and `aria-busy` activation calls neither; the current public Button prop/variant/size contract remains represented.
- [ ] Keep tests for `NativePicker`, `DatePicker`, `DataState`, and safe-area behavior non-render; do not add React component rendering tests or a browser harness for this migration.
- [ ] Update bootstrap/theme mocks and tests to assert complete MainButton/BottomButton removal while preserving viewport safe-area setup.
- [ ] Run real Telegram QA on iOS and Android with Telegram host light and host dark settings. Check all nine CTA routes, BackButton ownership, fixed light UI, safe-area offsets, tab rail, one scroll root, native picker/date-picker behavior, and existing haptics.
- [ ] Run the required repository verification commands listed below.

## Exact audit commands and oracle gates

Run from the repository root. Expected empty-output audits must be empty before the corresponding gate is accepted.

1. **CTA bridge consumer audit** — before deletion, this lists the nine routes and any remaining consumers:

   ```bash
   rg -n --hidden --glob '!node_modules' --glob '!dist' 'BottomButton|MainButton|bottom-button|setBottomButton|updateBottomButton|hideBottomButton|reserveBottomButton|mainButton' apps/tma/src apps/tma/package.json pnpm-lock.yaml
   ```

2. **Complete bridge deletion gate** — after route replacement and bootstrap/test cleanup, this must return no matches:

   ```bash
   rg -n --hidden --glob '!node_modules' --glob '!dist' 'BottomButton|MainButton|bottom-button|setBottomButton|updateBottomButton|hideBottomButton|reserveBottomButton|mainButton' apps/tma/src apps/tma/package.json pnpm-lock.yaml
   ```

3. **Visual Telegram-theme binding gate** — visual binding paths must return no matches, while required `themeParams.mount()` must remain:

   ```bash
   rg -n --hidden --glob '!node_modules' --glob '!dist' 'miniApp\.bindCssVars|themeParams\.bindCssVars|--tg-theme-|bindTheme' apps/tma/src
   rg -n --hidden --glob '!node_modules' --glob '!dist' 'themeParams\.mount\(\)' apps/tma/src/app/bootstrap/telegram-init.ts
   ```

   The first command must return no matches. The second command must retain the bootstrap mount.

4. **Legacy visual-token zero-reference gate** — this must return no matches before visual declarations/aliases are deleted:

   ```bash
   rg -n --glob '*.{ts,tsx,css}' -- '--tma-(base-bg|text-color|page-bg|card-bg|card-plain|text-strong|text-muted|line|primary|positive|warning|error|error-bg|shadow|shadow-soft)|--(color|shadow|animate)-tma-|(?:bg|text|border|shadow|animate)-tma-' apps/tma/src
   ```

5. **Safe-area preservation gate** — review every remaining match; expected matches are only platform setup and consumers of safe-area values:

   ```bash
   rg -n --glob '*.{ts,tsx,css}' -- '--tma-(safe|content-safe)-(top|right|bottom|left)' apps/tma/src
   ```

6. **BackButton set/ownership audit** — review against the route table and the expected RootLayout/invitation ownership split:

   ```bash
   rg -n --hidden --glob '!node_modules' --glob '!dist' 'backButton|BackButton|miniApp\.close|RootLayout|invitations' apps/tma/src/app apps/tma/src/routes apps/tma/src/features/invitations apps/tma/src/lib/telegram
   ```

7. **Eager-route regression review** — no route-policy changes are allowed in this feature:

   ```bash
   git diff -- apps/tma/src/app/router/app-router.tsx apps/tma/src/components/shared/tma-bottom-tabs.tsx
   ```

8. **Button contract surface audit** — review the preserved public API and all CTA/loading consumers:

   ```bash
   rg -n --hidden --glob '!node_modules' --glob '!dist' 'ButtonProps|ButtonVariant|ButtonSize|buttonVariants|aria-busy|disabled|<Button' apps/tma/src/components/ui apps/tma/src/routes apps/tma/src/features
   ```

9. **Required verification**:

   ```bash
   pnpm --filter tma lint
   pnpm --filter tma typecheck
   pnpm --filter tma test
   pnpm --filter tma build
   ./init.sh
   git diff --check
   ```

## Rollback checkpoints

- **Checkpoint A — provenance/config:** preserve the pre-generator state of `apps/tma/package.json`, `pnpm-lock.yaml`, `apps/tma/components.json`, `apps/tma/src/index.css`, and `apps/tma/src/components/ui/`. If the generator or dependency gate fails, remove only the newly generated/configured files and reverse the scoped dependency patch; do not restore unrelated working-tree files.
- **Checkpoint B — primitives:** after the generated baseline and compatibility wrappers pass typecheck, preserve the scoped primitive/token patch. If a public contract or picker/DataState behavior regresses, reverse only the UI primitive and CSS patch and retain the dependency provenance for correction.
- **Checkpoint C — route CTAs:** migrate the nine routes one at a time. After each route passes its static audit and focused non-render tests, preserve that route’s scoped patch. If a flow regresses, reverse only that route and leave completed route replacements intact.
- **Checkpoint D — bridge deletion:** do not delete `bottom-button.ts` or remove bootstrap/capability mocks until the route audit is empty. If bridge deletion fails, reverse only the bridge/bootstrap/test patch; do not restore migrated Button or route CTA work.
- **Checkpoint E — token deletion and QA:** do not delete legacy visual declarations until the zero-reference audit is empty and safe-area review passes. If Telegram QA finds a visual or inset regression, reverse only the final token/theme patch while retaining the tested CTA and bridge changes.
- Use scoped working-tree patches outside the repository for checkpoint recovery. Never use a repository-wide restore operation, and do not introduce commit steps as part of this feature.

## Acceptance gates

- [ ] `components.json` and generated component provenance identify Base UI, preset `b6G3fhkA4`, Lyra, yellow/neutral, Geist Mono, Lucide, and generator `4.18.0`.
- [ ] `apps/tma/package.json` and `pnpm-lock.yaml` lock the generator/runtime dependency graph without unrelated packages.
- [ ] Current Button public API remains usable by existing consumers; enabled Button activation has exactly one centralized light impact; disabled/`aria-busy` Button activation has no handler or haptic.
- [ ] NativePicker, DatePicker, and DataState contracts and behavior remain intact, including existing picker/date-picker haptics.
- [ ] All nine CTA paths use in-page shadcn Buttons and no Telegram BottomButton/MainButton bridge remains in source, bootstrap, capabilities, mocks, or tests.
- [ ] BackButton, safe-area setup, tab rail, one scroll root, and eager route imports remain intact.
- [ ] Bootstrap retains required `themeParams.mount()`; only visual theme binding paths (`bindCssVars`, `--tg-theme-*`, and `bindTheme`) are removed.
- [ ] Fixed light UI remains unchanged under Telegram host light and host dark settings.
- [ ] Legacy visual token audit is zero before visual token declarations/aliases are removed; safe-area platform variables remain.
- [ ] Non-render unit tests pass; no render-test harness is added.
- [ ] Required lint, typecheck, test, build, `./init.sh`, and `git diff --check` pass; real Telegram iOS/Android QA evidence covers host light/dark and the required shell/CTA behaviors.

## Handoff

- Plan path: `docs/plans/feat-128.md`
- Canonical UI references: `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`, `apps/tma/DESIGN.md`
- Implementation starts at Checkpoint A and must not modify the already-reconciled canonical docs.
- No known plan gaps: route matrix, public interfaces, dependency provenance, bridge deletion, BackButton ownership, safe-area/token gates, rollback checkpoints, non-render tests, Telegram QA, and required verification are all covered.
