# TMA pristine shadcn UI migration and Sera Phase 2 rebaseline Implementation Plan

> **Execution:** Follow the repository's implementation and verification rules. Use `subagent-driven-development` or `executing-plans` only when installed and appropriate. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the completed Phase 1 migration record and rebaseline the active TMA UI on pristine Base UI/Sera output from pinned `shadcn@4.18.0` and exact preset `b6GzOWK7U`, while preserving product behavior, native controls, Telegram shell behavior, and finance semantics.

**Architecture:** `apps/tma/src/components/ui/` becomes generated shadcn output only. Project/platform behavior lives outside that directory: `TmaHapticButton` wraps the generated Button, `NativePicker`, `DatePicker`, and `DataState` retain their behavior in project-owned locations, and screens own layout and finance meaning. Consumers use upstream Button, Card, Field, Input, Textarea, Label, Badge, Avatar, and ToggleGroup APIs directly instead of compatibility primitives.

**Tech Stack:** React 19, Vite, React Router, TanStack Query, Zustand, Framer Motion, Tailwind CSS v4, Base UI, pinned `shadcn@4.18.0`, exact preset `b6GzOWK7U`, Sera olive/yellow, Geist Mono, Lucide, Vitest, ESLint, TypeScript, and the existing `@tma.js/*` bridge.

## Global Constraints

- Do not manually edit any generated file under `apps/tma/src/components/ui/`. The shadcn CLI is the only writer allowed to initialize, add, or overwrite generated files; after generation, treat those files as immutable output.
- Use Base UI from pinned `shadcn@4.18.0` and exact preset `b6GzOWK7U` (Sera, olive/yellow, Geist Mono, Lucide).
- `apps/tma/DESIGN.md` is the canonical Phase 2 card, form, selection, surface, and primitive-composition reference. Do not create a competing plan-level visual system.
- Restore the generated global preset CSS and Geist Mono; remove the system-font override rather than adding another local font stack.
- Keep fixed light visual behavior: do not apply a dark root class or dark token override, do not bind Telegram theme colors into visual tokens, and do not alter generated dark branches.
- `TmaHapticButton` is external to `components/ui` and composes the untouched generated Button. Haptics must not be implemented in generated Button code.
- Move `NativePicker`, `DatePicker`, and `DataState` outside `components/ui` without changing their public behavior, native controls, callbacks, disabled behavior, or existing meaningful haptics.
- Migrate consumers to upstream `Button`, `Card`, `Field`, `Input`, `Textarea`, `Label`, `Badge`, `Avatar`, and `ToggleGroup` APIs. Do not preserve local compatibility aliases for removed custom primitives.
- Move layout and finance-specific styling to usage sites. Generic primitive font, radius, borders, shadows, and visual states come from the generated preset.
- Do not add generic consumer overrides for primitive background, radius, shadow, border, or color. Only meaningful finance/domain accents may be consumer-owned.
- Use `ToggleGroup` for fixed 2–7-option selections, `NativePicker` for dynamic or long choices, and `Badge` for display-only status or metadata.
- Put every `Input`, `Textarea`, `NativePicker`, and `DatePicker` in logical Cards with `FieldGroup`/`Field` and linked labels where the generated Sera components support them. Retain only fields present in the current store/API; do not invent a note or textarea field.
- Remove custom UI files after import and zero-reference gates pass. Do not leave `ChipButton`, `SegmentedControl`, `Eyebrow`, `Section`, `SectionHeader`, `Chip`, `IconBadge`, `MoneyLabel`, or the old form compatibility layer under `components/ui`.
- Retain in-page CTAs, `BackButton`, safe-area variables and padding, the tab rail, one scroll root per screen, native picker/date-picker interaction, and existing semantic haptics.
- Do not use Telegram `BottomButton` or `MainButton` anywhere after migration.
- Do not change backend, worker, API, auth/session, DTO, route-order, product-flow, or business-rule behavior.
- Do not change the accepted eager static route-import policy or unrelated preload behavior.
- Eliminate legacy visual token and compatibility code only after both import audits and zero-reference audits are empty.
- All automated tests added or modified for this feature are `.test.ts` pure-helper or contract tests. Do not add `.test.tsx` files, render tests, DOM tests, or component-test harnesses; verify DOM/native-control behavior through real Telegram manual evidence.
- No commit steps are part of this plan.

---

## Scope and non-goals

### In scope

- Safe retirement of the earlier custom-primitive migration direction.
- CLI-owned shadcn initialization and regeneration from the pinned generator and exact preset.
- Generated global CSS restoration, global Geist Mono restoration, and removal of the system body-font override.
- External `TmaHapticButton`, `NativePicker`, `DatePicker`, and `DataState` seams.
- Upstream primitive API migration for every TMA consumer.
- Phase 2 Sera rebaseline of generated UI and the remaining root, analytics, filter, flow, feature, and raw-control consumers.
- Removal of custom UI files and old compatibility exports after zero-reference gates.
- CTA migration, complete BottomButton/MainButton bridge deletion, fixed-light cleanup, and legacy-token cleanup.
- Generated-file immutability audits, wrapper/behavior tests, repository verification, and real Telegram iOS/Android QA.

### Non-goals

- No dark-mode implementation or Telegram-adaptive visual theme.
- No replacement of native picker/date-picker interaction.
- No change to `DataState` loading, error, empty, retry, action, or child-render behavior.
- No backend/API/business behavior changes.
- No redesign of screen hierarchy, finance content, tab-rail composition, safe-area layout, or route behavior beyond moving generic styling to consumers.
- No new compatibility barrel that re-exports removed custom primitives.

## File and ownership map

- `apps/tma/components.json`: Phase 2 owner verifies or regenerates through the shadcn CLI; it must describe the resolved Base UI/Sera style, olive/yellow values, `src/index.css`, and the existing aliases. The opaque preset code is proven by pinned CLI decode/apply and workspace-info evidence, not stored here.
- `apps/tma/src/components/ui/`: generated `button.tsx`, `card.tsx`, `field.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `badge.tsx`, `avatar.tsx`, `toggle-group.tsx`, `alert.tsx`, `empty.tsx`, `input-group.tsx`, `skeleton.tsx`, `separator.tsx`, and `spinner.tsx` only. No hand-edited barrel, haptic, finance, picker, or compatibility file remains here.
- `apps/tma/src/components/shared/tma-haptic-button.tsx`: external Button wrapper; owns the one-enabled-activation light impact contract.
- `apps/tma/src/components/shared/native-picker.tsx`, `date-picker.tsx`, and `data-state.tsx`: moved project-owned behavior components with preserved contracts.
- `apps/tma/src/index.css`: generated preset CSS plus required platform safe-area declarations and fixed-light base setup; no system body-font override and no removed legacy visual aliases after the zero-reference gate.
- `apps/tma/src/routes/**`, `apps/tma/src/features/**`, and `apps/tma/src/components/finance/**`: direct upstream primitive imports and consumer-owned layout/domain classes.
- `apps/tma/src/components/shared/tma-page-shell.tsx`, `tma-bottom-tabs.tsx`, `tma-page-header.tsx`, `app-shell.tsx`, `loading-picker.tsx`, and Telegram bridge files: retain shell/platform behavior while removing the obsolete global CTA bridge.
- `apps/tma/src/test/**`: wrapper, primitive-behavior, bridge, theme, safe-area, route, and existing domain tests updated without backend/API test changes.

## Migration contracts

- **Generated Button:** upstream props and primitive states only; no Telegram imports, haptic calls, TMA defaults, finance classes, or local activation policy.
- **`TmaHapticButton`:** accepts the upstream Button props plus the existing caller handler; when enabled and not `disabled`/`aria-busy`, calls `impact('light')` exactly once and then calls the handler exactly once. Disabled or busy activation calls neither. It composes, rather than edits, generated Button. Its pure `runTmaHapticActivation({ disabled, ariaBusy, impact, onActivate })` helper is the automated-test seam; the wrapper's DOM behavior is manual-QA-only.
- **NativePicker:** keeps its hidden native `<select>`, option/value/change contract, disabled behavior, and existing light selection impact. Its presentation may compose generated primitives outside `components/ui`.
- **DatePicker:** keeps `date` and `month` modes, hidden native input, value/change contract, disabled behavior, and existing light selection impact.
- **DataState:** keeps loading/error/empty branching, retry callback, custom action, and child rendering; it composes upstream Card/Button outside generated `ui`.
- **Pure behavior helpers:** `shouldActivateNativeControl(disabled: boolean): boolean`, `formatDateDisplay(value: string): string`, and `resolveDataStateBranch({ isLoading, isError, isEmpty }): 'loading' | 'error' | 'empty' | 'content'` are the `.test.ts` contract seams. They support behavior preservation without rendering components or asserting DOM.
- **Consumer semantics:** screen code owns placement, grouping, amount hierarchy, meaningful domain colors, CTA copy, and route behavior. It does not redefine generic primitive font, radius, border, shadow, or visual-state contracts.

## Historical Phase 1 record — completed and preserved

Tasks 1–10 below, including their checkbox steps, file maps, interfaces, verification commands, rollback checkpoints, and acceptance evidence, are the completed Phase 1 record. They are preserved for provenance and recovery, not as active implementation instructions. Any `b6G3fhkA4`, Lyra, or neutral/yellow requirement inside this historical section is superseded by the active Phase 2 Sera rebaseline using `b6GzOWK7U`; no Phase 1 file or evidence is to be restored over the Sera output.

### Task 1: Retire the earlier custom migration at a safe cleanup checkpoint

**Files:**
- Review only: `apps/tma/src/components/ui/*`, `apps/tma/src/index.css`, `apps/tma/src/components/shared/*`, `apps/tma/src/routes/*`, `apps/tma/src/features/*`, `apps/tma/src/lib/telegram/*`, and `apps/tma/src/test/*`
- Retire in later tasks: `apps/tma/src/components/ui/button.tsx`, `card.tsx`, `form.tsx`, `chip-button.tsx`, `segmented-control.tsx`, `primitives.tsx`, `native-picker.tsx`, `date-picker.tsx`, `data-state.tsx`, and the custom `index.ts`

**Interfaces:**
- Consumes: the current working tree and the earlier custom-primitive plan.
- Produces: a scoped inventory and rollback artifact for TMA-only migration changes; backend, worker, API, auth, and business files are explicitly outside the cleanup.

- [ ] **Step 1: Capture the scoped pre-cleanup diff and file inventory.**

  Run:

  ```bash
  git diff -- apps/tma/src/components/ui apps/tma/src/index.css apps/tma/src/components/shared apps/tma/src/routes apps/tma/src/features apps/tma/src/lib/telegram apps/tma/src/test > /tmp/feat-128-pre-pristine.diff
  printf '%s\n' 'Current custom UI files:'
  printf '%s\n' apps/tma/src/components/ui/*.tsx apps/tma/src/components/ui/*.ts
  ```

  Expected: the artifact contains only scoped TMA migration work; no backend/API path is included.

- [ ] **Step 2: Record all custom primitive imports before removal.**

  Run:

  ```bash
  rg -n --hidden --glob '!node_modules' --glob '!dist' "ChipButton|SegmentedControl|Eyebrow|SectionHeader|Section|Chip|IconBadge|MoneyLabel|FieldLabel|FieldError|NativePicker|DatePicker|DataState|from '@/components/ui'" apps/tma/src
  ```

  Expected: every current consumer is listed for the direct-API migration tasks; no consumer is silently dropped.

- [ ] **Step 3: Retire the old migration policy before implementing replacements.** Remove the old central-Button customization, compatibility-layer objective, custom card/form styling objective, and any plan references that permit generated-file edits. Do not remove backend/API code, alter worker contracts, or change product handlers during this checkpoint.

- [ ] **Step 4: Establish rollback point A.** Keep `/tmp/feat-128-pre-pristine.diff` and the exact file inventory until the generated baseline, external wrappers, and Task 4's first consumer group pass verification. Recovery is limited to the scoped TMA patch; do not use a repository-wide restore.

### Task 2: Initialize and regenerate the pristine preset through the shadcn CLI

**Files:**
- CLI-owned: `apps/tma/components.json`, `apps/tma/src/components/ui/button.tsx`, `card.tsx`, `field.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `badge.tsx`, `avatar.tsx`, `toggle-group.tsx`, `skeleton.tsx`, `separator.tsx`, `spinner.tsx`, and generated CSS portions of `apps/tma/src/index.css`
- Package-manager-owned if provenance is missing: `apps/tma/package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Consumes: exact generator `shadcn@4.18.0`, exact preset `b6G3fhkA4`, existing aliases, `src/index.css`, and `@/lib/utils`.
- Produces: reproducible Base UI/Lyra generated primitives with no local behavior or compatibility exports.

- [ ] **Step 1: Verify generator provenance without hand-editing package or lock files.** Confirm `apps/tma/package.json` contains exact dev dependency `"shadcn": "4.18.0"`. If it does not, use the package manager rather than editing JSON or the lockfile:

  ```bash
  pnpm --filter tma add --save-dev shadcn@4.18.0
  ```

  Expected: pnpm updates the manifest and lockfile consistently; no manual lockfile or component-file patch is used.

- [ ] **Step 2: Initialize the exact Vite preset with the pinned CLI.** From the repository root, run:

  ```bash
  pnpm dlx shadcn@4.18.0 init --preset b6G3fhkA4 --base base --template vite --cwd apps/tma --force
  ```

  Expected: `components.json` records Base UI/`base-lyra`, neutral/yellow preset settings, `src/index.css`, `@/components/ui`, `@/lib/utils`, and Lucide aliases. `--base base` and `--template vite` are used only for the CLI's initialization mode. If the installed CLI presents an interactive confirmation, select the exact preset and overwrite only generated preset files.

- [ ] **Step 3: Add and overwrite only the approved upstream primitives through the CLI.** Run:

  ```bash
  pnpm dlx shadcn@4.18.0 add button card field input textarea label badge avatar toggle-group skeleton separator spinner --cwd apps/tma --overwrite
  git diff -- apps/tma/package.json pnpm-lock.yaml
  ```

  Expected: the listed files are generated from the exact preset and no TMA, Telegram, finance, or compatibility code is inserted into them. Let the CLI add every dependency required by `field` and `toggle-group`; review the package/lock diff as CLI/package-manager output only, and do not manually edit `apps/tma/package.json`, `pnpm-lock.yaml`, or generated component files.

- [ ] **Step 4: Restore generated global CSS and Geist Mono.** Keep the CLI-generated preset CSS and `@fontsource-variable/geist-mono` import. Remove only the existing system body-font declaration; set the global body typography to the preset Geist Mono path. Preserve the platform safe-area variables and fixed-light base rules. Do not add a dark root class, dark token override, or remove generated dark branches.

- [ ] **Step 5: Run the generated-file provenance audit.** Run:

  ```bash
  rg -n --hidden --glob '!node_modules' --glob '!dist' "@/lib/telegram|haptic|TmaHaptic|NativePicker|DatePicker|DataState|ChipButton|SegmentedControl|Eyebrow|SectionHeader|MoneyLabel|IconBadge|className=.*(finance|tma-)" apps/tma/src/components/ui
  rg -n "font-family|system-ui|-apple-system|BlinkMacSystemFont|Segoe UI" apps/tma/src/index.css
  ```

  Expected: the generated directory returns no application/platform behavior matches; the CSS audit returns no system-font override. Any remaining generated dark branch is preserved and is not edited.

- [ ] **Step 6: Establish rollback point B.** Preserve the CLI command output, generated file list, `components.json`, CSS diff, and dependency diff. If the preset or CLI output is wrong, rerun the pinned CLI command or remove only the scoped generated/configuration patch; do not hand-edit generated files.

### Task 3: Move behavior components outside generated `components/ui`

**Files:**
- Create: `apps/tma/src/components/shared/tma-haptic-button.tsx`, `native-picker.tsx`, `date-picker.tsx`, `data-state.tsx`
- Modify: all consumers currently importing `NativePicker`, `DatePicker`, or `DataState`
- Test: `apps/tma/src/test/tma-haptic-button.test.ts`, `native-picker.test.ts`, `date-picker.test.ts`, `data-state.test.ts`
- Delete after the import gate: `apps/tma/src/components/ui/native-picker.tsx`, `date-picker.tsx`, `data-state.tsx`

**Interfaces:**
- Consumes: generated upstream `Button` and `Card`, existing Telegram haptics, and the current picker/state props.
- Produces: external behavior components with the contracts listed in the migration contracts section.

- [ ] **Step 1: Move `NativePicker`, `DatePicker`, and `DataState` without changing their public props or behavior.** Update their internal imports to direct generated primitives or `TmaHapticButton`; retain hidden native controls, callback order, disabled behavior, loading/error/empty branches, retry/action callbacks, and existing picker/date-picker haptics.

- [ ] **Step 2: Implement `TmaHapticButton` as a composition wrapper.** Render the generated `Button` and forward upstream props, `type`, `disabled`, `aria-busy`, children, and caller handlers. Guard the wrapper handler so disabled or busy activation returns before both `impact('light')` and the caller handler; enabled activation calls each once. Do not import or alter generated Button source.

- [ ] **Step 3: Update direct imports to the external locations.** Use `@/components/shared/native-picker`, `@/components/shared/date-picker`, `@/components/shared/data-state`, and `@/components/shared/tma-haptic-button`; do not recreate a `components/ui/index.ts` compatibility barrel.

- [ ] **Step 4: Add pure wrapper contract tests.** `tma-haptic-button.test.ts` must call `runTmaHapticActivation` directly and prove enabled activation produces one impact and one handler call, disabled activation produces neither, `ariaBusy` activation produces neither, and a plain Button contract does not call the Telegram haptic seam. Do not render `TmaHapticButton`; its DOM behavior is covered by manual Telegram QA.

- [ ] **Step 5: Add pure behavior contract tests.** `native-picker.test.ts` must cover `shouldActivateNativeControl(disabled)` for enabled and disabled paths. `date-picker.test.ts` must cover `formatDateDisplay(value)` for valid and empty values while the manual matrix covers both `date` and `month` modes. `data-state.test.ts` must cover `resolveDataStateBranch({ isLoading, isError, isEmpty })` for loading, error, empty, and content branches. The actual DOM/native-control callback, disabled, and haptic behavior is manual Telegram evidence only.

- [ ] **Step 6: Run the focused wrapper and behavior tests.**

  ```bash
  pnpm --filter tma test -- src/test/tma-haptic-button.test.ts src/test/native-picker.test.ts src/test/date-picker.test.ts src/test/data-state.test.ts
  ```

  Expected: all focused tests pass before route migration begins.

### Task 4: Migrate shared finance and root/detail route consumers

**Files:**
- Modify: `apps/tma/src/components/finance/summary.tsx`, `shortcuts.tsx`, `expenses.tsx`, `households.tsx`, `expense-summary-card.tsx`
- Modify: `apps/tma/src/routes/expenses.tsx`, `incomes.tsx`, `expense-detail.tsx`, `expense-edit.tsx`, `expense-edit-form.tsx`, `expense-edit-category.tsx`, `expense-edit-select-row.tsx`, `not-found.tsx`, `fatal-launch.tsx`, and `route-error-boundary.tsx`
- Test: existing home, expense, and presentation tests plus the focused primitive tests from Task 3

**Interfaces:**
- Consumes: upstream generated primitives, external `DataState`/picker components from Task 3, and existing query/store/route contracts.
- Produces: shared finance and root/detail route surfaces with consumer-owned layout and unchanged finance data semantics.

- [ ] **Step 1: Migrate summary, shortcut, expense-list, household, and expense-summary components.** Replace generic wrapper imports with upstream Card/Badge/Avatar and direct markup. Keep amount formatting, category icons, household/group labels, query branching, and one-scroll-root ownership unchanged.

- [ ] **Step 2: Migrate root routes and detail/edit routes.** Replace generated primitive imports directly, move all spacing/layout classes to the route or leaf usage site, and keep existing navigation, mutation, notification, validation, BackButton, and semantic haptic calls unchanged.

- [ ] **Step 3: Keep finance semantics explicit.** Amounts remain readable with the existing money formatting and Geist Mono global typography; green/yellow/danger accents remain only where they communicate finance meaning. Do not introduce generic Card/Button/Input visual overrides.

- [ ] **Step 4: Run the group verification.**

  ```bash
  pnpm --filter tma test -- src/test/home-presentation.test.ts src/test/expense-presentation.test.ts src/test/expense-list-api.test.ts src/test/expense-draft.test.ts src/test/expense-edit-flow-route.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: root and finance behavior remains unchanged and no compatibility symbol is imported by the group.

### Task 5: Migrate add-expense, income, period, and invitation flows

**Files:**
- Modify: `apps/tma/src/routes/add-expense-category.tsx`, `add-expense-details.tsx`, `add-expense-context.tsx`, `add-expense-chat.tsx`, `add-expense-import-preview.tsx`, `add-expense-import-preview-item-card.tsx`, `add-income.tsx`
- Modify: `apps/tma/src/features/period/pages/period-picker-page.tsx`, `period/components/period-chip-link.tsx`, `period/components/period-picker-section.tsx`, `invitations/pages/accept-invitation-page.tsx`, and `invitations/components/invite-household-dialog.tsx`
- Modify: `apps/tma/src/components/shared/loading-picker.tsx`
- Test: `apps/tma/src/test/expense-flow-store.test.ts`, `expense-import-api.test.ts`, `expense-import-confirm.test.ts`, `period.test.ts`, `invitation-api.test.ts`, `back-button-routes.test.ts`

**Interfaces:**
- Consumes: completed Task 4 consumer migrations, external picker/state components from Task 3, upstream primitives, and `TmaHapticButton`.
- Produces: unchanged add-expense/income/period/invitation flows with all CTAs in page content and no global Telegram button bridge.

- [ ] **Step 1: Migrate category and details flows.** Use upstream Badge/ToggleGroup/Input/Textarea/Label and external DatePicker. Preserve category selection, date selection, amount formatting, source selection, Enter handling, validation, route transition, and meaning-specific selection haptics.

- [ ] **Step 2: Migrate context, chat, import, and income flows.** Use `TmaHapticButton` only for enabled CTA haptics, preserve pending `disabled`/`aria-busy`, selected-count labels, partial-failure notifications, mutation handlers, resets, and navigation.

- [ ] **Step 3: Migrate period and invitation surfaces.** Replace chip/section compatibility components with generated Badge/Card/ToggleGroup or consumer markup. Preserve period state, subpage return behavior, invitation preview/accept conditions, route-owned BackButton close behavior, and household navigation.

- [ ] **Step 4: Migrate loading-picker imports to the external NativePicker path.** Confirm the loading picker still uses the hidden native control and does not create duplicate haptics.

- [ ] **Step 5: Run the flow verification.**

  ```bash
  pnpm --filter tma test -- src/test/expense-flow-store.test.ts src/test/expense-import-api.test.ts src/test/expense-import-confirm.test.ts src/test/period.test.ts src/test/invitation-api.test.ts src/test/back-button-routes.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: all flow tests pass; every loading CTA exposes truthful disabled/busy state and no Telegram BottomButton/MainButton import remains in these files.

### Task 6: Migrate households, groups, budgets, and auth consumers

**Files:**
- Modify: `apps/tma/src/features/households/pages/create-household-page.tsx`, `household-detail-page.tsx`, `household-list-page.tsx`, `households/components/household-avatar-dialog.tsx`, `household-avatar-section.tsx`
- Modify: `apps/tma/src/features/groups/components/create-group-form.tsx`, `groups/pages/create-group-page.tsx`, `group-list-page.tsx`, `group-detail-page.tsx`
- Modify: `apps/tma/src/features/budgets/pages/create-budget-page.tsx`, `budget-detail-page.tsx`, `budget-list-page.tsx`, `budgets/components/budget-hero-card.tsx`, `budget-progress-section.tsx`, `stat-tile.tsx`
- Modify: `apps/tma/src/features/auth/fatal-launch-screen.tsx`
- Test: `apps/tma/src/test/household-presentation.test.ts`, `group-presentation.test.ts`, `budget-presentation.test.ts`, `auth-bootstrap.test.ts`, `auth-provider.test.ts`

**Interfaces:**
- Consumes: completed Task 5 flow migrations, upstream primitive APIs, and external behavior components.
- Produces: household, group, budget, and auth surfaces with direct upstream imports, unchanged API/query/store behavior, and consumer-owned layout/domain meaning.

- [ ] **Step 1: Migrate household and avatar consumers.** Use generated Avatar and Badge APIs, preserve upload/preview/fallback behavior, household query state, invite actions, and domain labels.

- [ ] **Step 2: Migrate group consumers.** Use generated Card, Field, Input, Textarea, Label, Badge, and external DatePicker/NativePicker; preserve form validation, date selection, group mutations, and navigation.

- [ ] **Step 3: Migrate budget consumers.** Use generated Card/Badge/Avatar/ToggleGroup and direct finance markup; preserve budget amount formatting, progress meaning, category/household filters, query states, and mutation behavior.

- [ ] **Step 4: Migrate the auth fatal screen and run the group verification.**

  ```bash
  pnpm --filter tma test -- src/test/household-presentation.test.ts src/test/group-presentation.test.ts src/test/budget-presentation.test.ts src/test/auth-bootstrap.test.ts src/test/auth-provider.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: all feature tests pass and `rg` finds no custom UI symbol in `apps/tma/src/features`.

### Task 7: Migrate remaining legacy consumers, audit imports, and remove custom UI compatibility files

**Files:**
- Modify: `apps/tma/src/routes/statistics.tsx`, `apps/tma/src/features/expenses/pages/expense-filter-page.tsx`, and `apps/tma/src/features/home/components/home-shortcuts-section.tsx`
- Test: `apps/tma/src/test/home-presentation.test.ts`, `apps/tma/src/test/expense-filter-store.test.ts`, and the focused primitive tests
- Review: all TMA consumer imports after Tasks 4–6; `apps/tma/src/components/ui/`
- Delete after the import audit: `apps/tma/src/components/ui/form.tsx`, `chip-button.tsx`, `segmented-control.tsx`, `primitives.tsx`, and custom `index.ts`
- Retain only CLI-generated files in `apps/tma/src/components/ui/`; Task 3 owns removal of the moved picker/date/state files

**Interfaces:**
- Consumes: completed shared/root, expense/income/period/invitation, household/group/budget, and auth migrations from Tasks 4–6.
- Produces: migrated statistics, expense-filter, and home-shortcut consumers, then an empty custom compatibility import audit and a generated-only `components/ui` directory, with no compatibility barrel or replacement aliases.

- [ ] **Step 1: Migrate the three remaining legacy consumers before the cleanup audit.** In `apps/tma/src/routes/statistics.tsx`, `apps/tma/src/features/expenses/pages/expense-filter-page.tsx`, and `apps/tma/src/features/home/components/home-shortcuts-section.tsx`, use direct generated Card/Button/ToggleGroup imports or consumer-owned semantic markup. Use external `TmaHapticButton` for enabled CTAs; preserve analytics `DataState`, period state/return behavior, date/period formatting, and finance readability; preserve expense-filter state, period return, native picker interaction, selection haptics, apply/reset behavior, and home-shortcut navigation/reset behavior. Keep Card padding consumer-owned. Do not edit generated UI files or add compatibility replacements.

  ```bash
  pnpm --filter tma test -- src/test/home-presentation.test.ts src/test/expense-filter-store.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: all three consumers use direct generated primitives or semantic consumer markup, enabled CTAs use the external haptic wrapper, and analytics, period, picker, haptic, formatting, finance, filter, apply/reset, and shortcut behavior remains unchanged.

- [ ] **Step 2: Run the complete consumer import and symbol audit after the three remaining consumers are migrated.**

  ```bash
  rg -n --hidden --glob '!node_modules' --glob '!dist' --glob '!components/ui/**' "from ['\"]@/components/ui['\"]|components/ui/(form|chip-button|segmented-control|primitives|native-picker|date-picker|data-state)(['\"/]|$)" apps/tma/src
  ```

  Expected: no custom UI barrel import or legacy compatibility component path remains in any consumer; direct generated imports, including `FieldLabel` and `FieldError` from `components/ui/field`, remain allowed.

- [ ] **Step 3: Delete custom UI files only after the import audit is empty.** Remove `form.tsx`, `chip-button.tsx`, `segmented-control.tsx`, `primitives.tsx`, and `index.ts`. Do not add replacement compatibility files under `components/ui`; do not remove generated files.

- [ ] **Step 4: Run the post-deletion compatibility and generated-directory gates.**

  ```bash
  rg -n --hidden --glob '!node_modules' --glob '!dist' --glob '!components/ui/**' "from ['\"]@/components/ui['\"]|components/ui/(form|chip-button|segmented-control|primitives|native-picker|date-picker|data-state)(['\"/]|$)" apps/tma/src
  printf '%s\n' apps/tma/src/components/ui/*.tsx apps/tma/src/components/ui/*.ts
  pnpm --filter tma test -- src/test/button.test.ts src/test/tma-haptic-button.test.ts src/test/native-picker.test.ts src/test/date-picker.test.ts src/test/data-state.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: the custom UI barrel and legacy compatibility path audit is empty, direct generated imports including `FieldLabel` and `FieldError` remain valid, only CLI-generated files are listed under `components/ui`, focused primitive tests pass, and typecheck passes.

### Task 8: Remove BottomButton/MainButton bridge and preserve shell/platform behavior

**Files:**
- Modify: `apps/tma/src/components/shared/tma-page-shell.tsx`, `tma-bottom-tabs.tsx`, `tma-page-header.tsx`, `app-shell.tsx`, `pull-to-refresh.tsx`, `loading-picker.tsx`
- Modify: `apps/tma/src/app/bootstrap/telegram-init.ts`, `apps/tma/src/lib/telegram/capabilities.ts`, `back-button.ts`, `safe-area.ts`, `haptics.ts`, `theme.ts`
- Modify: all former route bridge consumers and `apps/tma/src/test/telegram-init.test.ts`, `theme.test.ts`, `safe-area.test.ts`, `back-button-routes.test.ts`
- Delete after the bridge audit: `apps/tma/src/lib/telegram/bottom-button.ts`

**Interfaces:**
- Consumes: completed route CTA migration and external `TmaHapticButton`.
- Produces: in-page CTA-only TMA shell with preserved BackButton, safe-area, tab rail, one scroll root, and required Telegram bootstrap setup.

- [ ] **Step 1: Audit bridge consumers before deletion.**

  ```bash
  rg -n --hidden --glob '!node_modules' --glob '!dist' 'BottomButton|MainButton|bottom-button|setBottomButton|updateBottomButton|hideBottomButton|reserveBottomButton|mainButton' apps/tma/src apps/tma/package.json pnpm-lock.yaml
  ```

  Expected: only the known bridge implementation and not-yet-migrated references remain; route CTA work is complete.

- [ ] **Step 2: Remove route and shell bridge ownership.** Remove BottomButton imports, effects, cleanup, `reserveBottomButton`, and extra bridge padding. Keep normal tab-rail/safe-area bottom spacing, one `main` scroll root, route shell ownership, and in-page CTA state.

- [ ] **Step 3: Remove bootstrap/capability bridge surfaces.** Remove only MainButton mounting and obsolete capability entries. Retain `themeParams.mount()`, SDK initialization, Mini App, BackButton, viewport, swipe, init-data, supported haptics, storage, and safe-area capability checks.

- [ ] **Step 4: Update bridge/theme/safe-area tests.** Remove MainButton/BottomButton expectations; retain `themeParams.mount()`, safe-area CSS variables, cleanup, BackButton ownership, and fixed-light assertions.

- [ ] **Step 5: Delete `bottom-button.ts` only after the complete audit is empty.** Run the same audit again and require no matches in source, package files, lockfile, mocks, or tests.

- [ ] **Step 6: Establish rollback point C.** If bridge deletion breaks a route, restore only the bridge implementation and the failing scoped shell/test patch while retaining generated primitives and completed consumer migrations.

### Task 9: Enforce fixed-light CSS, Geist Mono, token cleanup, and generated immutability

**Files:**
- Modify: `apps/tma/src/index.css`, `apps/tma/src/lib/telegram/theme.ts`, and only consumer files returned by the audits
- Delete after zero references: legacy visual token declarations, Tailwind aliases, and compatibility styling in `apps/tma/src/index.css`

**Interfaces:**
- Consumes: generated preset CSS, safe-area platform variables, migrated consumers, and fixed-light shell setup.
- Produces: fixed-light TMA visual behavior with generated primitive CSS intact and no legacy visual-token or compatibility consumers.

- [ ] **Step 1: Remove the system-font override and audit global typography.** Require `@fontsource-variable/geist-mono`, the generated preset font mapping, and a global body/html application of preset Geist Mono. Reject `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `SF Pro`, and `Segoe UI` body stacks.

- [ ] **Step 2: Remove visual Telegram theme binding without removing platform setup.** Delete visual `bindCssVars`/`bindTheme` paths and Telegram color-token subscriptions. Keep `themeParams.mount()`, safe-area/viewport mapping, fixed-light base colors, and generated dark branches. Do not apply `.dark` or override dark tokens.

- [ ] **Step 3: Run the import and custom-file gates.**

  ```bash
  rg -n --hidden --glob '!node_modules' --glob '!dist' --glob '!components/ui/**' "from ['\"]@/components/ui['\"]|components/ui/(form|chip-button|segmented-control|primitives|native-picker|date-picker|data-state)(['\"/]|$)" apps/tma/src
  ```

  Expected: no custom `@/components/ui` barrel import or legacy compatibility component path remains; direct generated component imports, including `FieldLabel` and `FieldError`, remain allowed.

- [ ] **Step 4: Run the legacy visual-token zero-reference gate before deletion.**

  ```bash
  rg -n --glob '*.{ts,tsx,css}' -- '--tma-(base-bg|text-color|page-bg|card-bg|card-plain|text-strong|text-muted|line|primary|positive|warning|error|error-bg|shadow|shadow-soft)|--(color|shadow|animate)-tma-|(?:bg|text|border|shadow|animate)-tma-' apps/tma/src
  ```

  Expected: no legacy visual-token references. Safe-area variables `--tma-safe-*` and `--tma-content-safe-*` are not removed and are audited separately.

- [ ] **Step 5: Remove old token declarations and compatibility styling only after the gate is empty.** Preserve only platform safe-area values and generated preset CSS. Do not alter generated dark branches or add local generic primitive overrides.

- [ ] **Step 6: Run the final generated-file immutability audit.**

  ```bash
  pnpm dlx shadcn@4.18.0 add button card field input textarea label badge avatar toggle-group skeleton separator spinner --cwd apps/tma --overwrite --dry-run > /tmp/feat-128-shadcn-dry-run.txt
  git diff --no-ext-diff --unified=0 -- apps/tma/src/components/ui > /tmp/feat-128-generated-ui-diff.txt
  rg -n --hidden --glob '!node_modules' --glob '!dist' "@/lib/telegram|haptic|TmaHaptic|NativePicker|DatePicker|DataState|ChipButton|SegmentedControl|Eyebrow|SectionHeader|MoneyLabel|IconBadge|--tma-" apps/tma/src/components/ui
  git diff --check
  ```

  Expected: the pinned CLI dry run succeeds for the complete generated set, the generated-directory diff contains only the scoped CLI regeneration delta, the behavior-import audit is empty, and the diff has no whitespace errors. Review `/tmp/feat-128-shadcn-dry-run.txt` against `/tmp/feat-128-generated-ui-diff.txt` to identify local deltas; do not ban upstream utility names such as `rounded-*`, `shadow-*`, or `border-*`.

- [ ] **Step 7: Establish rollback point D.** Preserve the generated baseline, CSS diff, token audit output, and import audit output. If fixed-light or safe-area behavior regresses, reverse only the CSS/theme/token patch; retain tested generated primitives and consumer migrations.

### Task 10: Run repository verification and real Telegram QA

**Files:**
- Test and review: all changed TMA source and test files from Tasks 1–9; no backend/API files are included.

**Interfaces:**
- Consumes: completed pristine generated baseline, external behavior wrappers, all consumer migrations, bridge deletion, fixed-light CSS, and zero-reference audits.
- Produces: verified migration evidence and a manual Telegram QA matrix suitable for final feature handoff.

- [ ] **Step 1: Run focused wrapper, behavior, route, and presentation tests.**

  ```bash
  pnpm --filter tma test
  ```

  Expected: the full TMA test suite passes, including wrapper haptics, NativePicker, DatePicker, DataState, Button contract, BackButton, safe-area, route, and existing domain tests.

- [ ] **Step 2: Run repository verification.**

  ```bash
  pnpm --filter tma lint
  pnpm --filter tma typecheck
  pnpm --filter tma test
  pnpm --filter tma build
  ./init.sh
  git diff --check
  ```

  Expected: all commands pass; the documented Worker build skip in `./init.sh` remains the only configured skip.

- [ ] **Step 3: Run the complete post-migration audits.** Confirm no BottomButton/MainButton bridge, no visual Telegram theme binding, no legacy visual tokens, no custom UI imports, no generated-file behavior, no system font stack, and preserved safe-area variables.

- [ ] **Step 4: Run real Telegram iOS QA in host light and host dark settings.** Check cold launch, Home, Statistics, Settings, Expenses, all add-expense steps, income, period, invitation, household, group, budget, detail/edit, error/loading/empty states, BackButton visibility, tab rail, safe-area insets, one scroll root, native picker/date-picker interaction, one light CTA impact, semantic selection/save haptics, no BottomButton/MainButton, and fixed-light appearance.

- [ ] **Step 5: Run the same matrix on real Telegram Android in host light and host dark settings.** Record the same route, shell, picker, haptic, typography, and fixed-light evidence; specifically check keyboard overlap, viewport resizing, safe-area bottom spacing, and no accidental new chunk navigation.

- [ ] **Step 6: Establish rollback point E.** If QA finds a regression, isolate it to the generated baseline, wrapper, route group, shell bridge, or CSS/theme patch and reverse only that scoped patch. Do not restore the prior custom-primitive plan or change backend/API behavior.

## Historical Phase 1 acceptance evidence — completed and preserved

- [ ] `components.json` and generated primitive files are reproducible from pinned `shadcn@4.18.0`, exact preset `b6G3fhkA4`, Base UI, Lyra, yellow/neutral, Geist Mono, and Lucide.
- [ ] No file under `apps/tma/src/components/ui/` contains TMA props/defaults, Telegram imports, haptics, finance behavior, compatibility wrappers, or local primitive styling; any generated-file replacement came from the pinned CLI.
- [ ] Global CSS uses generated preset CSS and Geist Mono with no system-font override; fixed light has no dark root/token override and generated dark branches remain intact.
- [ ] `TmaHapticButton` is outside `components/ui`, composes upstream Button, and its enabled/disabled/`aria-busy` tests prove exactly-once behavior.
- [ ] `NativePicker`, `DatePicker`, and `DataState` are outside `components/ui` and their callbacks, native controls, disabled states, branches, and existing haptics remain intact.
- [ ] Every consumer uses upstream Button/Card/Field/Input/Textarea/Label/Badge/Avatar/ToggleGroup APIs or direct consumer markup; no custom compatibility symbols or barrel imports remain.
- [ ] Custom UI files are deleted only after import and zero-reference gates pass.
- [ ] All route CTAs are in-page; BottomButton/MainButton references are absent from source, bootstrap, capabilities, mocks, tests, package files, and lockfile.
- [ ] BackButton, safe-area setup, tab rail, one scroll root, native picker interaction, eager route imports, and finance semantics remain intact.
- [ ] Legacy visual token audit is empty before declarations/aliases are removed; safe-area platform variables remain.
- [ ] TMA lint, typecheck, tests, build, `./init.sh`, and `git diff --check` pass.
- [ ] Real Telegram iOS and Android QA covers host light/dark settings and the complete shell, route, CTA, picker, haptic, keyboard, and safe-area matrix.

## Historical Phase 1 rollback checkpoints — preserved

- **Checkpoint A — safe cleanup:** retain `/tmp/feat-128-pre-pristine.diff` and the custom-file/import inventory. Reverse only the scoped TMA cleanup if the replacement boundary is rejected.
- **Checkpoint B — CLI baseline:** retain `components.json`, package-manager output, generated file list, CSS diff, and exact CLI commands. Rerun the pinned CLI instead of hand-editing generated files when output is wrong.
- **Checkpoint C — external behavior seams:** isolate wrapper/picker/DataState regressions to the new external files and their imports; do not restore generated-file customization.
- **Checkpoint D — consumer groups:** migrate and verify shared/root, expense/income/period/invitation, and household/group/budget/auth groups independently. Reverse only the failing group while leaving verified groups intact.
- **Checkpoint E — bridge and token deletion:** do not delete bridge or legacy tokens until their audits are empty. If deletion fails, restore only the bridge or token patch required for diagnosis.
- **Checkpoint F — Telegram QA:** isolate iOS/Android regressions by shell, wrapper, route group, picker, or CSS/theme scope. Keep backend/API and product business behavior unchanged.

## Historical Phase 1 handoff — preserved

- Plan path: `docs/plans/feat-128.md`
- This historical Phase 1 record replaced the earlier custom-primitive plan. Its Lyra/`b6G3fhkA4` baseline is superseded by the active Sera Phase 2 rebaseline below; the earlier compatibility-layer direction remains retired and must not be reintroduced.
- Canonical UI references: `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`, `apps/tma/DESIGN.md`
- Phase 1 implementation began at Task 1 safe cleanup and proceeded through CLI generation, external behavior seams, consumer groups, bridge/token gates, and Telegram QA.
- No commit steps are included; rollback uses scoped migration artifacts and checkpoints only.

---

## Phase 2 rebaseline — active Sera implementation

Phase 2 supersedes the Phase 1 Lyra/`b6G3fhkA4` generated baseline. The completed Phase 1 tasks and evidence above remain historical; active work starts at Task 11 and uses only exact Sera preset `b6GzOWK7U` from pinned `shadcn@4.18.0`. `apps/tma/DESIGN.md` is the canonical source for card, form, selection, surface, and primitive-composition rules.

### Task 11: Overwrite the generated UI with the exact Sera preset

**Files:**
- Read-only prerequisite: `apps/tma/DESIGN.md`, `apps/tma/package.json`, and existing `apps/tma/components.json`
- CLI-owned: `apps/tma/components.json`, `apps/tma/src/components/ui/button.tsx`, `card.tsx`, `field.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `badge.tsx`, `avatar.tsx`, `toggle-group.tsx`, `alert.tsx`, `empty.tsx`, `input-group.tsx`, `separator.tsx`, `skeleton.tsx`, and `spinner.tsx`
- CLI-generated CSS/dependency output: `apps/tma/src/index.css`, `apps/tma/package.json`, and `pnpm-lock.yaml` only when the pinned CLI/package manager requires it

**Interfaces:**
- Consumes: canonical Sera rules in `apps/tma/DESIGN.md`, pinned `shadcn@4.18.0`, exact preset `b6GzOWK7U`, existing aliases, `src/index.css`, and `@/lib/utils`.
- Produces: reproducible Sera Base UI output with `Alert`, `Empty`, and `InputGroup` available for later surfaces; existing `Separator` and `Skeleton` remain in the generated set; no project behavior or compatibility code enters `components/ui`.

- [ ] **Step 1: Verify the prerequisite docs, generator provenance, and existing-project boundary.** Read `apps/tma/DESIGN.md`; confirm the exact pinned generator, existing `components.json`, and existing Base UI setup. Preserve existing aliases, safe-area setup, fixed-light setup, and package-manager ownership. Do not hand-edit `components.json`, package files, lockfiles, or generated components.

- [ ] **Step 2: Apply and overwrite the exact Sera preset on the existing project through the pinned CLI.** Run from the repository root with the TMA workspace as the CLI cwd:

  ```bash
  pnpm dlx shadcn@4.18.0 apply b6GzOWK7U --cwd apps/tma | tee /tmp/feat-128-sera-preset-apply.txt
  pnpm dlx shadcn@4.18.0 add button card field input textarea label badge avatar toggle-group alert empty input-group separator skeleton spinner --cwd apps/tma --overwrite
  ```

  `apply` is the approved preset-switch operation for this existing `components.json` project and preserves its Base UI setup. The pinned CLI apply output is the decoded preset evidence for `b6GzOWK7U`; preserve `separator.tsx` and `skeleton.tsx` as CLI output rather than replacing them with local implementations. Do not use `init`, manually edit configuration, or manually edit any generated file.

- [ ] **Step 3: Run generated provenance and configuration-safety audits.**

  ```bash
  rg -n --hidden --glob '!node_modules' --glob '!dist' "@/lib/telegram|haptic|TmaHaptic|NativePicker|DatePicker|DataState|finance|TmaHapticButton" apps/tma/src/components/ui
  pnpm dlx shadcn@4.18.0 info -c apps/tma --json > /tmp/feat-128-tma-shadcn-info.json
  rg -n 'style|baseColor|iconLibrary|font|tailwind|aliases|src/index.css|@/components/ui|@/lib/utils' apps/tma/components.json /tmp/feat-128-tma-shadcn-info.json
  pnpm dlx shadcn@4.18.0 add button card field input textarea label badge avatar toggle-group alert empty input-group separator skeleton spinner --cwd apps/tma --overwrite --dry-run > /tmp/feat-128-sera-dry-run.txt
  git diff -- apps/tma/components.json apps/tma/package.json pnpm-lock.yaml
  git diff --no-ext-diff --unified=0 -- apps/tma/src/components/ui
  ```

  Expected: the generated directory contains no project behavior, TMA props, finance classes, haptics, or compatibility exports; `/tmp/feat-128-sera-preset-apply.txt` records the pinned CLI `apply` decode of the requested opaque preset and `/tmp/feat-128-tma-shadcn-info.json` resolves the existing TMA workspace to Sera, olive/yellow, Geist Mono, Lucide, and Base UI values; `components.json` contains only those resolved config values plus aliases and paths, not the opaque preset code; the dry run matches the approved generated set; dependency changes are package-manager/CLI output only; and the generated diff contains only the approved CLI overwrite.

- [ ] **Step 4: Verify the generated baseline before consumer work.** Run `pnpm --filter tma typecheck` and `git diff --check`. Do not proceed if generated output, config provenance, or the Sera preset is not exact.

### Task 12: Recompose root, home, and analytics surfaces with semantic Cards

**Files:**
- Modify: `apps/tma/src/routes/home.tsx`, `statistics.tsx`, `expenses.tsx`, and `incomes.tsx`
- Modify: `apps/tma/src/components/finance/summary.tsx`, `shortcuts.tsx`, `expenses.tsx`, `households.tsx`, `expense-summary-card.tsx`, and `apps/tma/src/features/home/components/home-shortcuts-section.tsx`

**Interfaces:**
- Consumes: Task 11 Sera primitives, external `DataState` and `TmaHapticButton`, existing analytics/query/store contracts, and the locked home/statistics/expenses design in `apps/tma/DESIGN.md`.
- Produces: root/home/analytics surfaces with semantic Card headers, content, and backgrounds, unchanged data and navigation behavior, consumer-owned layout, and readable finance hierarchy.

- [ ] **Step 1: Recompose root and home summaries, shortcuts, lists, and backgrounds.** Use `CardHeader`/`CardTitle`/`CardDescription`/`CardContent` by semantic role for bounded summaries and grouped lists; keep shell/header and timeline dividers out of Cards. Preserve home shortcut navigation/reset behavior, household/recent-expense data, query branches, one scroll root, and finance formatting.

- [ ] **Step 2: Recompose statistics and analytics states.** Use semantic Card sections for the hero, selected-period content, and ranked summaries; keep `DataState`, period values, chart/data formatting, lazy-load policy, and analytics behavior unchanged. Use `Badge` only for display-only category/legend metadata.

- [ ] **Step 3: Remove generic consumer primitive overrides.** Keep Card padding and grouping at the consumer, but do not set generic Card background, radius, border, shadow, or color. Preserve only meaningful finance/domain accents and high-contrast amounts.

- [ ] **Step 4: Run the root/home/analytics verification.**

  ```bash
  pnpm --filter tma test -- src/test/home-presentation.test.ts src/test/expense-presentation.test.ts src/test/expense-list-api.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: root, home, statistics, expenses, and income presentation/data behavior passes without generated-file edits or compatibility replacements.

### Task 13: Recompose expense filters and period selection

**Files:**
- Modify: `apps/tma/src/features/expenses/pages/expense-filter-page.tsx`
- Modify: `apps/tma/src/features/period/pages/period-picker-page.tsx`, `apps/tma/src/features/period/components/period-chip-link.tsx`, and `period-picker-section.tsx`
- Modify: `apps/tma/src/components/shared/loading-picker.tsx`

**Interfaces:**
- Consumes: Task 11 Sera `Card`, `Field`, `ToggleGroup`, and generated support primitives plus external `DatePicker`/`NativePicker` behavior.
- Produces: filter and period surfaces with unchanged state, period return, native picker, selection haptic, apply, reset, and navigation contracts.

- [ ] **Step 1: Make expense filter Date and Money sort single-choice ToggleGroups.** Use generated `ToggleGroup`/`ToggleGroupItem` for the fixed choices, preserving selected state, option meaning, ordering, and existing selection haptics. Do not use `Badge` or a compatibility control as an interactive substitute.

- [ ] **Step 2: Group period and dynamic picker controls semantically.** Put `DatePicker` and dynamic/long `NativePicker` choices in logical Cards with `FieldGroup`/`Field` and linked labels. Use ToggleGroup only for fixed 2–7-option period choices; keep Card padding consumer-owned and generic Card visuals preset-owned.

- [ ] **Step 3: Preserve loading-picker and period behavior.** Retain hidden native controls, date/month modes, period return behavior, disabled states, reset/apply semantics, and exactly the existing meaningful haptics. Do not add fields or change filter/data behavior.

- [ ] **Step 4: Run filter and period verification.**

  ```bash
  pnpm --filter tma test -- src/test/expense-filter-store.test.ts src/test/period.test.ts src/test/native-picker.test.ts src/test/date-picker.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: Date and Money sort are single-choice controls, dynamic choices remain native, and filter/period tests pass with no generated UI modifications.

### Task 14: Recompose add-expense and add-income form controls

**Files:**
- Modify: `apps/tma/src/routes/add-expense-category.tsx`, `add-expense-details.tsx`, `add-expense-chat.tsx`, and `add-income.tsx`

**Interfaces:**
- Consumes: Task 11 Sera `Card`, `Field`, `FieldGroup`, `Input`, `Textarea`, `ToggleGroup`, `Label`, `Button`, external `DatePicker`, and `TmaHapticButton`; existing expense/income stores and route contracts.
- Produces: logically grouped add-expense/income forms with linked labels and unchanged existing fields, confirmation/data behavior, validation, haptics, and navigation.

- [ ] **Step 1: Put every existing add-expense/income control in a logical Card.** Use `CardHeader`/`CardContent` where the grouping has semantic meaning and `FieldGroup`/`Field` with linked labels for inputs. Retain only fields present in the current store/API; do not invent a note or textarea field, and do not alter confirmation/data behavior.

- [ ] **Step 2: Apply the selection/control rules.** Use ToggleGroup for fixed 2–7-option source/category choices, NativePicker for dynamic or long choices, external `DatePicker` for date behavior, and display-only Badge for metadata. Use external `TmaHapticButton` for enabled CTA haptics and keep generated Button haptic-free.

- [ ] **Step 3: Preserve fast-capture flow behavior.** Retain category/date routing, amount formatting, source selection, Enter handling, validation, pending `disabled`/`aria-busy`, notification/reset behavior, one-scroll-root ownership, and semantic selection/save haptics. Do not add generic primitive background, radius, shadow, border, or color overrides.

- [ ] **Step 4: Run add-flow verification.**

  ```bash
  pnpm --filter tma test -- src/test/expense-flow-store.test.ts src/test/expense-draft.test.ts src/test/incomes-api.test.ts src/test/date-picker.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: existing add-expense and income flows pass with logical Cards and linked labels, no invented controls, and all enabled CTAs remaining in-page.

### Task 15: Recompose edit, import, and context forms

**Files:**
- Modify: `apps/tma/src/routes/expense-detail.tsx`, `expense-edit.tsx`, `expense-edit-form.tsx`, `expense-edit-category.tsx`, and `expense-edit-select-row.tsx`
- Modify: `apps/tma/src/routes/add-expense-context.tsx`, `add-expense-import-preview.tsx`, and `add-expense-import-preview-item-card.tsx`

**Interfaces:**
- Consumes: Task 11 Sera form/Card primitives, external `DataState`, `DatePicker`, `NativePicker`, and `TmaHapticButton`, plus existing edit/import/context stores and mutation contracts.
- Produces: grouped edit/import/context forms and previews with unchanged confirmation, import, mutation, route, picker, disabled, and notification behavior.

- [ ] **Step 1: Group edit controls and context fields in semantic Cards.** Use FieldGroup/Field with linked labels, generated Input/Textarea only where the current product field exists, NativePicker for dynamic household/group choices, and DatePicker for existing date behavior. Preserve amount/category/date/context semantics and readability.

- [ ] **Step 2: Recompose import preview and item cards.** Use CardHeader/CardContent/CardFooter by role, keep partial-failure and selected-count behavior, preserve native picker interaction and import confirmation/data behavior, and use Badge only for display-only status.

- [ ] **Step 3: Preserve CTA and route behavior.** Use external `TmaHapticButton` for enabled CTA haptics, retain truthful `disabled`/`aria-busy`, BackButton ownership, validation, reset, notifications, and one scroll root. Do not add compatibility wrappers or generic primitive overrides.

- [ ] **Step 4: Run edit/import verification.**

  ```bash
  pnpm --filter tma test -- src/test/expense-edit-flow-route.test.ts src/test/expense-import-api.test.ts src/test/expense-import-confirm.test.ts src/test/expense-flow-store.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: edit, import, and context tests pass with unchanged data/confirmation behavior and no generated UI edits.

### Task 16: Recompose household, group, budget, and invitation surfaces

**Files:**
- Modify: `apps/tma/src/features/households/pages/create-household-page.tsx`, `household-detail-page.tsx`, `household-list-page.tsx`, `households/components/household-avatar-dialog.tsx`, `household-avatar-section.tsx`
- Modify: `apps/tma/src/features/groups/components/create-group-form.tsx`, `groups/pages/create-group-page.tsx`, `group-list-page.tsx`, and `group-detail-page.tsx`
- Modify: `apps/tma/src/features/budgets/pages/create-budget-page.tsx`, `budget-detail-page.tsx`, `budget-list-page.tsx`, `budgets/components/budget-hero-card.tsx`, `budget-progress-section.tsx`, and `stat-tile.tsx`
- Modify: `apps/tma/src/features/invitations/pages/accept-invitation-page.tsx` and `invitations/components/invite-household-dialog.tsx`

**Interfaces:**
- Consumes: Task 11 Sera Card/Field/FieldGroup/Input/Badge/Avatar/ToggleGroup output, external picker/state components, and existing household/group/budget/invitation API/query/store contracts.
- Produces: feature surfaces with semantic Cards, linked form labels, unchanged upload, preview, validation, query, mutation, invitation, and navigation behavior.

- [ ] **Step 1: Group household and invitation controls.** Use logical Cards and linked Fields for existing controls, Avatar for identity, Badge for display-only status, and NativePicker for dynamic choices. Preserve household upload/preview/fallback, invite, accept, preview, and BackButton behavior.

- [ ] **Step 2: Group and budget forms and summaries.** Use ToggleGroup only for fixed 2–7-option choices; use NativePicker for dynamic/long choices; retain existing date, amount, category, household, progress, and mutation semantics. Keep finance readability and only meaningful domain accents.

- [ ] **Step 3: Keep primitive styling preset-owned.** Consumer code may own placement, grouping, Card padding, hierarchy, and domain meaning only; it must not set generic Card/input background, radius, shadow, border, or color overrides.

- [ ] **Step 4: Run feature verification.**

  ```bash
  pnpm --filter tma test -- src/test/household-presentation.test.ts src/test/group-presentation.test.ts src/test/budget-presentation.test.ts src/test/invitation-api.test.ts src/test/back-button-routes.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: all feature tests pass with unchanged API/query/store behavior and preserved native controls and haptics.

### Task 17: Audit remaining raw controls, lists, error states, headers, Cards, and colors

**Files:**
- Modify: `apps/tma/src/routes/not-found.tsx`, `fatal-launch.tsx`
- Modify: `apps/tma/src/components/shared/route-error-boundary.tsx`, `data-state.tsx`, `date-picker.tsx`, `native-picker.tsx`, and `tma-haptic-button.tsx`
- Modify: `apps/tma/src/components/shared/tma-page-shell.tsx`, `tma-bottom-tabs.tsx`, `tma-page-header.tsx`, `app-shell.tsx`, and `pull-to-refresh.tsx`
- Review only: all Task 12–16 consumer files for raw controls, list composition, error/empty/loading states, headers, Card usage, and generic color classes

**Interfaces:**
- Consumes: completed Task 11–16 Sera output, canonical `apps/tma/DESIGN.md`, platform shell contracts, and existing behavior helpers.
- Produces: no accidental raw control or generic primitive override outside the generated directory, semantic error/empty/loading feedback, airy headers, preset-owned Cards, and preserved platform behavior.

- [ ] **Step 1: Replace remaining raw controls and list treatments at their owners.** Use generated Button/Input/ToggleGroup or external NativePicker/DatePicker according to the fixed-choice/dynamic-choice rules; use Card for bounded lists and summaries, not shell or timeline decoration; use Alert/Empty/Separator/Skeleton/InputGroup when their semantics fit.

- [ ] **Step 2: Audit error states, headers, Cards, and colors.** Keep `DataState` branches and callbacks unchanged, keep headers outside Cards, preserve safe-area and one-scroll-root ownership, and remove generic consumer background/radius/shadow/border/color overrides. Retain only meaningful finance/domain accents.

- [ ] **Step 3: Recheck platform and CTA invariants.** Preserve `BackButton`, native picker/date-picker interaction, one enabled light haptic per `TmaHapticButton`, fixed light, and no Telegram `MainButton`/`BottomButton`. Do not edit generated UI files.

- [ ] **Step 4: Run the remaining-control audit and verification.**

  ```bash
  rg -n --hidden --glob '!node_modules' --glob '!dist' --glob '!components/ui/**' "<(button|input|select|textarea)([ >]|$)|BottomButton|MainButton|from ['\"]@/components/ui['\"]|components/ui/(form|chip-button|segmented-control|primitives|native-picker|date-picker|data-state)(['\"/]|$)|className=.*(bg-|text-|border-|rounded-|shadow-)" apps/tma/src
  pnpm --filter tma test -- src/test/button.test.ts src/test/tma-haptic-button.test.ts src/test/native-picker.test.ts src/test/date-picker.test.ts src/test/data-state.test.ts src/test/theme.test.ts src/test/safe-area.test.ts
  pnpm --filter tma typecheck
  ```

  Expected: every remaining match is reviewed as an intentional native control, generated/direct primitive use, or semantic consumer markup; no forbidden bridge/path or generic primitive override remains.

### Task 18: Run automated verification and real Telegram QA for the Sera rebaseline

**Files:**
- Review and test: all changed TMA source, generated, config, CSS, and `.test.ts` files from Tasks 11–17; no backend/API files
- Manual evidence: Telegram iOS and Android on real devices in host light and host dark settings

**Interfaces:**
- Consumes: exact Sera generated baseline, all consumer recompositions, preserved behavior components, shell invariants, and completed import/color/provenance audits.
- Produces: automated verification and real-device evidence that Phase 2 Sera behavior and visual composition are complete without commits.

- [ ] **Step 1: Run the complete automated TMA verification.**

  ```bash
  pnpm --filter tma lint
  pnpm --filter tma typecheck
  pnpm --filter tma test
  pnpm --filter tma build
  ./init.sh
  git diff --check
  ```

  Expected: all commands pass; the documented Worker build skip in `./init.sh` remains the only configured skip.

- [ ] **Step 2: Run final Sera provenance and consumer audits.** Decode/apply `b6GzOWK7U` through the pinned CLI evidence from Task 11, then resolve the applied TMA workspace from the repository root with `pnpm dlx shadcn@4.18.0 info -c apps/tma --json`. Confirm that the decoded preset and workspace JSON agree on Sera, olive/yellow, Geist Mono, Lucide, and Base UI; `components.json` contains only the corresponding resolved style/baseColor/icon/alias/path values and is not required to contain the opaque code; generated files match the pinned CLI dry run; no generated file contains application behavior; no custom barrel or legacy component path remains; no generic primitive override remains; safe-area variables remain; and no MainButton/BottomButton reference exists.

- [ ] **Step 3: Run real Telegram iOS QA in host light and host dark settings.** Check cold launch, root/home, statistics, expenses, filters, period, all add-expense steps, income, edit, import, household, group, budget, invitation, loading/error/empty states, headers, Cards, raw/native controls, BackButton, tab rail, safe-area insets, one scroll root, date/native picker interaction, enabled CTA haptics, semantic selection/save haptics, fixed-light appearance, finance readability, and no MainButton/BottomButton.

- [ ] **Step 4: Run the same matrix on real Telegram Android in host light and host dark settings.** Record the same route, form, shell, picker, haptic, typography, keyboard, viewport, safe-area, and fixed-light evidence; check no accidental new chunk navigation.

- [ ] **Step 5: Establish the Phase 2 rollback point.** If validation or QA finds a regression, isolate it to the generated Sera baseline, one owned consumer group, behavior component, shell, or CSS/theme patch. Reverse only that scoped Phase 2 patch; never restore the Phase 1 generated baseline over Sera and never change backend/API behavior.

## Phase 2 acceptance gates

- [ ] The pinned CLI decode/apply evidence and `pnpm dlx shadcn@4.18.0 info -c apps/tma --json` workspace evidence resolve exact preset `b6GzOWK7U` to Sera, olive/yellow, Geist Mono, Lucide, and Base UI; `components.json` contains the matching resolved style/baseColor/icon/alias/path values and is not required to store the opaque preset code.
- [ ] Every file under `apps/tma/src/components/ui/` is reproducible exact CLI output from that pinned Sera preset, including `alert`, `empty`, `input-group`, `separator`, and `skeleton`; the generated CLI dry run matches the approved set.
- [ ] Generated UI files contain no TMA props/defaults, Telegram imports, haptics, finance behavior, consumer classes, or compatibility exports; config and dependency changes are CLI/package-manager-owned.
- [ ] `apps/tma/DESIGN.md` remains the canonical card/form/selection reference; consumers use semantic Card headers/content/background composition without generic background, radius, border, shadow, or color overrides.
- [ ] Every Input, Textarea, NativePicker, and DatePicker remains in a logical Card with FieldGroup/Field and linked labels where applicable; no note/textarea or other field is invented beyond the current store/API.
- [ ] Fixed 2–7-option choices use ToggleGroup, dynamic/long choices use NativePicker, and Badge is display-only; native DatePicker/NativePicker behavior and domain haptics remain intact.
- [ ] Root/home/statistics, expense filter/period, add-expense/income, edit/import/context, household/group/budget/invitation, and remaining raw-control/error/header/card/color groups are migrated with exact file ownership and unchanged product/data behavior.
- [ ] `DataState`, period/amount/date formatting, filter apply/reset, home shortcut navigation/reset, confirmation/import behavior, validation, disabled/busy states, BackButton, safe-area layout, one scroll root, and finance readability remain intact.
- [ ] All route CTAs remain in-page; `TmaHapticButton` stays outside `components/ui`; MainButton/BottomButton references are absent.
- [ ] TMA lint, typecheck, tests, build, `./init.sh`, and `git diff --check` pass, and real Telegram iOS/Android QA covers host light/dark settings and the full Phase 2 matrix.

## Phase 2 handoff

- Active implementation begins at Task 11 and proceeds through exact Sera generation, disjoint consumer groups, remaining-control audits, and Task 18 automated/device verification.
- Phase 1 tasks, evidence, acceptance record, and rollback checkpoints remain above as historical provenance only.
- No commit steps are included. Use scoped Phase 2 rollback only; do not restore the superseded Lyra/`b6G3fhkA4` baseline.
