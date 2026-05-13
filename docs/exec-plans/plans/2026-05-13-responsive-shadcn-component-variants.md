# Responsive shadcn Component Variants

---

## Title

Refactor shadcn UI primitives for mobile-first responsive sizing.

## Purpose / Big Picture

This plan makes the project-owned shadcn source components use mobile-first control sizing: comfortable 44px touch targets and 16px input text on mobile, then more precise 36px controls and 14px text from the `sm` breakpoint upward. Users should observe easier tapping and no iOS input auto-zoom on phones, while desktop screens keep the compact shadcn feel.

This is not a custom visual design system. The work keeps shadcn/ui as the source-code component baseline and only adjusts the project-owned component variants/classes required for accessibility, responsive ergonomics, and existing app compatibility.

## Scope

In scope:

- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/toggle.tsx`
- `apps/web/src/components/ui/toggle-group.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/native-select.tsx`
- `apps/web/src/components/ui/input-group.tsx`
- `apps/web/src/components/ui/combobox.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/alert.tsx`
- `apps/web/src/components/ui/dialog.tsx`
- `apps/web/src/components/ui/alert-dialog.tsx`
- `apps/web/src/components/ui/drawer.tsx`
- A small focused logic-style test file under `apps/web/src/components/ui/` if the project allows non-render class contract tests.
- Existing consumers that currently use unsupported or stale primitive props, especially `Button size='xl'` and `DialogContent size='default'`.
- Harness updates: `harness/feature_index.json`, `harness/features/feat-052.json`, and `harness/progress.md`.

Out of scope:

- No broad page redesign.
- No new color palette, token brand system, glassmorphism restoration, or bespoke design-system documentation.
- No backend, D1, API, auth, or data-contract changes.
- No upstream shadcn overwrite without explicit approval.
- No component/page render tests; validation should use typecheck, lint, class contract tests if added, and browser/manual evidence.

## Non-negotiable Requirements

- Use `pnpm dlx shadcn@latest` for shadcn CLI commands because root `package.json` declares `packageManager: pnpm@10.28.1`.
- Run shadcn commands from `apps/web` or with `-c apps/web`; root `info` reports monorepo root.
- Preserve shadcn/radix composition and accessibility rules: `DialogTitle`/`DrawerTitle` remain required; `SelectItem` remains inside `SelectGroup` where consumers group items; icons inside buttons use `data-icon` and no explicit size classes in consumers.
- Use semantic Tailwind tokens only. Do not introduce raw colors or manual `dark:` color overrides as part of this responsive sizing pass.
- `className` on product/page consumers stays layout-only; responsive sizing belongs in UI primitives or primitive variants.
- Mobile default target for clickable controls: at least 44px high/wide on screens below `640px`.
- Input text remains `text-base` on mobile to prevent iOS focus zoom; desktop may use `sm:text-sm`.
- Keep desktop compactness at `sm:` and above: default controls should become `sm:h-9`; small controls should become `sm:h-8`.

## Progress

- [x] 2026-05-13: Analyze shadcn config and installed UI components.
- [x] 2026-05-13: Fetch shadcn docs URLs for the main touched components and extract relevant usage notes.
- [x] 2026-05-13: Run GitNexus upstream impact checks for representative primitives; all returned LOW risk, but graph did not report consumer edges, so text-search evidence must drive implementation review.
- [ ] Implementation current owner: Orchestrator or assigned implementation agent. Start with contract tests/typecheck baseline, then update primitives in the order listed below.
- [ ] Run verification and record evidence.
- [ ] Mark `feat-052` done after implementation and successful verification.

## Surprises & Discoveries

- `pnpm dlx shadcn@latest info -c apps/web --json` reports `framework: Next.js`, `rsc: true`, `tailwindVersion: v4`, `tailwindCss: apps/web/src/index.css`, `base: radix`, `iconLibrary: lucide`, and installed UI components including button, input, textarea, select, native-select, card, alert, dialog, drawer, toggle, toggle-group, input-group, combobox, and alert-dialog.
- Current UI primitives are shadcn source files under `apps/web/src/components/ui`, not an external package.
- Current default `Button`, `Toggle`, `Input`, `SelectTrigger`, `NativeSelect`, `InputGroup`, and `ComboboxChips` heights are mostly `h-9`, below the mobile 44px touch target.
- Existing product code uses `Button size='xl'` in multiple places, but `button.tsx` currently exposes only `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`. Implementation must either add `xl` intentionally or migrate consumers. The safer compatibility path is to add `xl` because many consumers already reference it.
- `household-create-dialog.tsx` currently passes `size='default'` to `DialogContent`, but `DialogContent` does not declare a `size` prop. Implementation should add a typed `size?: 'default' | 'sm' | 'lg'` contract to `DialogContent` or remove the stale prop. The better primitive-owned path is to add the contract and remove consumer width overrides over time.
- GitNexus impact returned LOW for `Button`, `Input`, `DialogContent`, `SelectTrigger`, and `Card`, each with `impactedCount: 0`; this appears incomplete for React component imports, so implementation must treat the text-search consumer list as authoritative.

## Decision Log

- Decision: Keep shadcn-first, source-code component customization, not a separate custom design system.
  Rationale: User explicitly removed custom design-system docs and wants original shadcn components with responsive variants for mobile/desktop ergonomics.
  Date/Author: 2026-05-13 / Orchestrator.
- Decision: Use mobile-first classes in the component primitives, e.g. `h-11 sm:h-9 text-base sm:text-sm`.
  Rationale: This satisfies Apple-style touch target requirements on mobile and preserves compact desktop controls.
  Date/Author: 2026-05-13 / Orchestrator.
- Decision: Do not make `Dialog` itself secretly render `Drawer`.
  Rationale: Radix Dialog and Vaul Drawer have different roots, triggers, portals, and a11y contracts. A primitive-level responsive wrapper should be introduced only where product flows need mobile bottom sheets. Low-level `Dialog` and `Drawer` should remain predictable shadcn primitives.
  Date/Author: 2026-05-13 / Orchestrator.

## Outcomes & Retrospective

- To be completed after implementation. Expected outcome: responsive primitive classes are centralized, consumers compile without unsupported props, mobile touch targets meet 44px, desktop controls remain compact, and full verification passes.

## Context and Orientation

- Repo root: `/Users/tungdoan/Projects/Web/household-finance-system`.
- Frontend app: `apps/web`, Next.js App Router, React 19, Tailwind v4, shadcn/radix, lucide icons.
- shadcn config: run `pnpm dlx shadcn@latest info -c apps/web --json` from repo root or `pnpm dlx shadcn@latest info --json` from `apps/web`.
- UI primitives: `apps/web/src/components/ui/*`.
- Global Tailwind CSS variables: `apps/web/src/index.css`. This plan should not need global CSS changes.
- Existing frontend guidance that applies:
  - `docs/references/frontend/project-folder-structure.md`: shared UI primitives stay in `components/ui`; feature-specific components stay in `components/<feature>`.
  - `docs/references/frontend/component-structure-pattern.md`: keep files small and split if over 200 lines.
  - `docs/references/frontend/naming-and-conventions-pattern.md`: kebab-case files, named exports, import order third-party then internal.
  - `docs/references/frontend/form-pattern.md`: forms use `FieldGroup`, `Field`, `FieldLabel`, `aria-invalid`, and `data-invalid`.
  - `docs/references/frontend/dialog-and-form-pattern.md`: dialog content should not receive ad hoc padding/spacing overrides unless necessary.
- Relevant shadcn docs checked:
  - Button supports `variant` and `size`, icon spacing via `data-icon`, and loading via composed `Spinner`.
  - Input docs emphasize `Field` composition and `aria-invalid`/`data-invalid` validation.
  - Select docs emphasize `SelectGroup`, `SelectLabel`, and `aria-invalid` on `SelectTrigger` for invalid state.
  - Dialog docs require normal `DialogContent`/`DialogHeader`/`DialogTitle`/`DialogDescription` composition and allow `showCloseButton`.
  - Drawer docs support mobile bottom sheet usage and Dialog+Drawer responsive patterns.

## Plan of Work (Narrative)

### 1. Establish a baseline and focused assertions

Run typecheck before edits to expose existing incompatible props such as `Button size='xl'` or `DialogContent size='default'`. If typecheck is already red, record the exact failures in the plan progress and treat fixing those primitive contracts as part of this plan.

If non-render tests are acceptable, add `apps/web/src/components/ui/responsive-variants.test.ts` or `.tsx` that imports exported variant helpers and asserts class strings for mobile/desktop contracts. Keep this as a logic/class-contract test, not a DOM render test.

Minimum assertions:

- `buttonVariants({ size: 'default' })` contains `h-11`, `sm:h-9`, `text-base`, `sm:text-sm`, `gap-2`, and `sm:gap-1.5`.
- `buttonVariants({ size: 'sm' })` contains `h-9`, `sm:h-8`.
- `buttonVariants({ size: 'lg' })` contains `h-12`, `sm:h-10`.
- `buttonVariants({ size: 'icon' })` contains `size-11`, `sm:size-9`.
- `buttonVariants({ size: 'xl' })` exists if compatibility is preserved.
- `toggleVariants({ size: 'default' })` matches button default height/min-width.

### 2. Refactor Button variants first

Edit `apps/web/src/components/ui/button.tsx`.

Planned classes:

```ts
default: 'h-11 sm:h-9 gap-2 sm:gap-1.5 px-4 sm:px-3 text-base sm:text-sm has-data-[icon=inline-end]:pr-3 sm:has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-3 sm:has-data-[icon=inline-start]:pl-2.5'
xs: 'h-8 sm:h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*="size-"])]:size-3'
sm: 'h-9 sm:h-8 gap-1.5 sm:gap-1 px-3 text-sm sm:text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2'
lg: 'h-12 sm:h-10 gap-2 sm:gap-1.5 px-5 sm:px-4 text-base sm:text-sm has-data-[icon=inline-end]:pr-4 sm:has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-4 sm:has-data-[icon=inline-start]:pl-3'
xl: 'h-[52px] sm:h-11 gap-2 px-6 sm:px-5 text-base sm:text-sm has-data-[icon=inline-end]:pr-5 sm:has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-5 sm:has-data-[icon=inline-start]:pl-4'
icon: 'size-11 sm:size-9'
'icon-xs': 'size-8 sm:size-6 [&_svg:not([class*="size-"])]:size-3'
'icon-sm': 'size-9 sm:size-8'
'icon-lg': 'size-12 sm:size-10'
```

Keep `data-size={size}` and `data-variant={variant}` unchanged.

### 3. Align Toggle and ToggleGroup to Button sizing

Edit `apps/web/src/components/ui/toggle.tsx`.

Use the same height/min-width family:

- `default`: `h-11 sm:h-9 min-w-11 sm:min-w-9 text-base sm:text-sm`.
- `sm`: `h-9 sm:h-8 min-w-9 sm:min-w-8 text-sm sm:text-xs`.
- `lg`: `h-12 sm:h-10 min-w-12 sm:min-w-10 text-base sm:text-sm`.

Edit `apps/web/src/components/ui/toggle-group.tsx` only if group spacing or rounded group rules conflict with the new item sizes. Preserve the current context pass-through pattern.

### 4. Refactor Input and Textarea controls

Edit `apps/web/src/components/ui/input.tsx`.

Replace the fixed `h-9 px-3 text-base md:text-sm` shape with:

- `h-11 sm:h-9`
- `px-4 sm:px-3`
- `py-1`
- `text-base sm:text-sm`
- existing focus, disabled, invalid, placeholder, file-input, and semantic token classes preserved.

Edit `apps/web/src/components/ui/textarea.tsx`.

Textarea is multiline, so use minimum height rather than forcing exact height:

- `min-h-24 sm:min-h-16`
- `px-4 sm:px-3`
- `py-3`
- `text-base sm:text-sm`

Preserve resize, invalid, disabled, and focus classes.

### 5. Refactor Select and NativeSelect triggers

Edit `apps/web/src/components/ui/select.tsx`.

For `SelectTrigger`, use:

- base `text-base sm:text-sm`.
- `px-4 sm:px-3`.
- `data-[size=default]:h-11 data-[size=default]:sm:h-9`.
- `data-[size=sm]:h-9 data-[size=sm]:sm:h-8`.
- icon default `size-5 sm:size-4` where the primitive itself owns the icon.

For `SelectItem`, keep desktop/menu density unless mobile menus are proven hard to tap. If changing, use `min-h-10 sm:min-h-8` rather than full `h-11`, because menu rows can contain long text and should not clip.

Edit `apps/web/src/components/ui/native-select.tsx` with the same trigger heights and padding:

- `h-11 sm:h-9` default.
- `data-[size=sm]:h-9 data-[size=sm]:sm:h-8`.
- `text-base sm:text-sm`.
- `pr-10 sm:pr-8 pl-4 sm:pl-3`.
- icon `size-5 sm:size-4`.

### 6. Refactor InputGroup and Combobox chips

Edit `apps/web/src/components/ui/input-group.tsx`.

- Root `InputGroup`: `h-11 sm:h-9`.
- Addon text: keep `text-sm` unless input group content must match input text; do not enlarge helper adornments unnecessarily.
- `InputGroupButton` sizes should map to the updated Button sizes without making inline clear/search actions too large on desktop:
  - `xs`: `h-8 sm:h-6`.
  - `icon-xs`: `size-8 sm:size-6`.
  - `icon-sm`: `size-9 sm:size-8`.

Edit `apps/web/src/components/ui/combobox.tsx`.

- `ComboboxChips`: use `min-h-11 sm:min-h-9 px-4 sm:px-3 text-base sm:text-sm`.
- Individual `ComboboxChip`: keep chip compact but readable, e.g. `h-7 sm:h-[calc(--spacing(5.5))]`; do not force every removable chip to 44px because the chip row itself is the input target. The remove button should still be at least `size-8` on mobile if it is independently clickable.

### 7. Normalize container padding for Card, Alert, Dialog, Drawer

Edit `apps/web/src/components/ui/card.tsx`.

- Change top-level card vertical padding from `py-6` and `data-[size=sm]:py-4` toward `py-5` for default and `py-4 sm:py-4` for `sm`.
- Change header/content/footer horizontal padding from `px-6` to `px-5`; `size='sm'` can remain `px-4` if compact cards are intentional.
- Keep full Card composition intact: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

Edit `apps/web/src/components/ui/alert.tsx`.

- Replace `px-4 py-3` with `p-5` only if visual QA confirms alert actions still fit. If actions become cramped, use `p-5` plus adjusted action offset rather than reverting to raw page overrides.

Edit `apps/web/src/components/ui/dialog.tsx`.

- Add typed `size?: 'sm' | 'default' | 'lg'` to `DialogContent` if keeping primitive-owned width control.
- Use `p-5` instead of `p-6`.
- Replace close button `size='icon-sm'` with `size='icon'` so mobile close target is `44px`; keep `sm:size-9` from the button variant for desktop.
- Keep `showCloseButton` supported.

Edit `apps/web/src/components/ui/alert-dialog.tsx`.

- Use `p-5` instead of `p-6`.
- Audit action buttons and any close/cancel affordance for mobile 44px target.

Edit `apps/web/src/components/ui/drawer.tsx`.

- Change content/header/footer padding from `p-4` to `p-5`.
- Keep bottom sheet composition and `DrawerTitle`/`DrawerDescription` expectations.

### 8. Overlay adaptability without breaking primitives

Do not alter `Dialog` to render `Drawer` internally. Instead, if this implementation must satisfy mobile Drawer vs desktop Dialog behavior now, create a small explicit wrapper such as `apps/web/src/components/ui/responsive-dialog.tsx` with this contract:

```tsx
type ResponsiveDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  trigger?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}
```

The wrapper should use CSS/media-query based rendering or a stable media hook that is safe with Next.js RSC boundaries. Because it uses state/media behavior, it must start with `'use client'`. It renders Drawer on mobile and Dialog on `sm` and above. It must always render `DialogTitle` or `DrawerTitle`; visually hidden titles use `className='sr-only'`.

Only migrate consumers in this pass if they clearly represent modal form flows where bottom sheet behavior is desired, for example quick-add expense. Otherwise, leave wrapper creation as a documented follow-up in `docs/exec-plans/tech-debt-tracker.md`.

### 9. Consumer cleanup and compatibility

Use text search to identify incompatible or stale consumer usage:

```bash
rg "size='xl'|size=\"xl\"|<DialogContent[^>]*size=|className='sm:max-w-md'|className=\"sm:max-w-md\"" apps/web/src
```

Required cleanup:

- Ensure `Button size='xl'` compiles by adding `xl` to `buttonVariants` or migrate consumers to `lg`. Prefer adding `xl` for compatibility because multiple page and feature components already use it.
- Ensure `DialogContent size='default'` compiles by adding the `size` prop or removing the prop. Prefer adding `size` because primitive-owned width avoids repeated `className='sm:max-w-md'` overrides.
- Do not do broad page restyling. Only change consumers that fail typecheck or rely on unsupported primitive props.

### 10. Harness and documentation updates

- Update `harness/features/feat-052.json` from planned to done after implementation.
- Update `harness/feature_index.json` status for `feat-052` from planned to done after implementation.
- Update `harness/progress.md` with implementation evidence.
- Update this ExecPlan progress and outcomes.
- Do not recreate deleted custom design-system docs.

## Concrete Steps (Commands)

Run from repo root unless otherwise noted.

```bash
# Confirm shadcn workspace and installed components
pnpm dlx shadcn@latest info -c apps/web --json

# Get component docs URLs before editing touched shadcn primitives
pnpm dlx shadcn@latest docs button input textarea select card dialog drawer toggle toggle-group alert

# Baseline typecheck before edits
pnpm --filter web typecheck

# Search known compatibility risks
rg "size='xl'|size=\"xl\"|<DialogContent[^>]*size=|className='sm:max-w-md'|className=\"sm:max-w-md\"" apps/web/src

# After edits, auto-fix lint per AGENTS.md
pnpm lint:fix

# Focused web checks
pnpm --filter web typecheck
pnpm --filter web test

# Full workspace verification before claiming done
./init.sh
```

Expected short outputs:

- shadcn info includes `"framework":"Next.js"`, `"tailwindVersion":"v4"`, `"base":"radix"`, and `"ui":"/Users/tungdoan/Projects/Web/household-finance-system/apps/web/src/components/ui"`.
- `pnpm --filter web typecheck` exits 0 after primitive compatibility fixes.
- `pnpm lint:fix` exits 0, allowing previously known unrelated warnings only if the command itself succeeds.
- `pnpm --filter web test` exits 0.
- `./init.sh` completes install, harness checks, lint, type-check, tests, and web build.

## Validation and Acceptance

Acceptance criteria:

- Mobile default `Button`, `Toggle`, `Input`, `SelectTrigger`, `NativeSelect`, and `InputGroup` controls are at least `h-11` or `size-11` below `sm`.
- Desktop default controls become `sm:h-9` or `sm:size-9` at `sm` and above.
- Inputs and textareas use `text-base sm:text-sm`; no iOS auto-zoom risk from sub-16px mobile input text.
- Button icon sizes are primitive-owned through variant classes; consumers continue using `data-icon` rather than explicit icon size classes inside buttons.
- Dialog close button target is `size-11 sm:size-9` through `Button size='icon'`.
- Cards, alerts, dialogs, and drawers use planned `p-5` or equivalent primitive-owned padding; product pages do not need visual override classes to restore spacing.
- Existing `Button size='xl'` consumers compile or are intentionally migrated.
- Existing `DialogContent size='default'` usage compiles or is intentionally removed.
- No backend files change.
- No custom design-system docs are recreated.

Recommended browser/manual checks:

- On a mobile viewport below 640px, inspect a form page or dialog and confirm controls measure 44px or larger.
- On a desktop viewport, confirm default buttons and inputs visually shrink to compact 36px height.
- On iOS Safari or a simulated mobile Safari environment, focus an input and confirm no automatic zoom.
- Open a dialog and verify the close button remains reachable and accessible.

## Idempotence & Recovery

- All edits are source-code class changes and are safe to re-run.
- No database migrations, no destructive operations, no external service changes.
- If a shadcn upstream merge is needed later, preview first with `pnpm dlx shadcn@latest add <component> --dry-run` and inspect per-file diffs with `--diff`; do not use `--overwrite` without explicit user approval.
- Rollback path: revert the touched UI primitive files and harness/plan status changes with git, then rerun `pnpm --filter web typecheck`.

## Artifacts and Notes

Evidence to attach during implementation:

- `gitnexus_impact` summary for edited symbols before edits: representative checks already returned LOW for `Button`, `Input`, `DialogContent`, `SelectTrigger`, and `Card`.
- `pnpm dlx shadcn@latest info -c apps/web --json` output or summary.
- Focused grep before/after for `h-9`, `size-9`, `p-6`, `p-4`, and unsupported `size='xl'` / `DialogContent size` patterns.
- Typecheck/lint/test/init transcripts.
- Browser/manual measurement notes for one mobile form and one desktop form.

## Interfaces & Dependencies

- shadcn CLI: `pnpm dlx shadcn@latest`, used only for info/docs/diff previews.
- UI primitive dependencies already installed: `class-variance-authority`, `radix-ui`, `vaul`, `lucide-react`.
- No new npm dependencies planned.
- Internal import aliases from shadcn info: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`, `@/lib`.
- Layer impact under `ARCHITECTURE.md`: UI-only. This change stays in `UI`; it does not affect `Types -> Config -> Repo -> Service -> Runtime` layers and does not bypass runtime/service contracts.

## Standards Enforcement

- `docs/references/frontend/project-folder-structure.md`: shared shadcn primitives remain in `apps/web/src/components/ui`; no feature logic goes into `lib`.
- `docs/references/frontend/component-structure-pattern.md`: keep each primitive focused; if a new responsive wrapper exceeds 200 lines, split helpers.
- `docs/references/frontend/naming-and-conventions-pattern.md`: use kebab-case file names, named exports, and import order third-party before internal alias imports.
- `docs/references/frontend/form-pattern.md`: preserve `Field`/`FieldGroup` and invalid-state patterns; do not replace form semantics while adjusting sizing.
- `docs/references/frontend/dialog-and-form-pattern.md`: use primitive-owned dialog sizing/padding instead of ad hoc `DialogContent className` visual overrides.
- shadcn styling rules: no `space-y-*`; use `gap-*`; use semantic tokens; use `size-*` for square controls; use `cn()` for classes; no manual overlay `z-index` changes beyond existing primitive implementation.

## Companion Skills for Implementation

- Use `test-driven-development` before production-code edits because this is a refactor with observable behavior.
- Use `subagent-driven-development` or `executing-plans` for implementation.
- Use `typescript-reviewer` after TypeScript/shadcn primitive edits.
- Use `requesting-code-review` before merge.
- Use `verification-before-completion` before claiming done.
- Use `agent-browser` or `playwright-cli` for mobile/desktop visual measurement checks.

## Open Decisions

- Should implementation create a new `ResponsiveDialog` wrapper in this pass, or only prepare `Dialog`/`Drawer` primitives and defer consumer migration? Recommendation: defer wrapper unless a specific product flow is selected, because changing modal behavior globally is higher risk than sizing primitives.
- Should `Button size='xl'` remain as a supported project compatibility variant? Recommendation: yes, because existing consumers already use it and it maps cleanly to mobile-first CTA sizing.
- Should compact dropdown/select menu items also enforce 44px mobile rows? Recommendation: only if browser QA shows tap difficulty; trigger controls are the primary mobile touch target.
