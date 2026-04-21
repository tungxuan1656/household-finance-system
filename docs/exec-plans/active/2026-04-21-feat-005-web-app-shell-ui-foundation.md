# feat-005: Web app shell & UI foundation

## Purpose / Big Picture

Set up a shell for `apps/web` to provide the app with a stable navigation framework and layout for all MVP flows. After this change, users accessing `/` will be taken to `/sign-in`, which is publicly accessible at `/sign-in` and `/sign-up`, and after authentication will enter a separate shell for the logged-in or onboarding flow. This shell also standardizes toast, themes, form primitives, and empty/loading/error states so that subsequent features like auth, household, expense, and settings don't have to rebuild the UI.

## Scope

In scope:
- `apps/web/src/main.tsx`
- `apps/web/src/app.tsx`
- `apps/web/src/index.css`
- Use `apps/web/src/components/theme-provider.tsx` if you need to adjust the shell integration method.
- `apps/web/src/components/ui/sonner.tsx`
- New route/layout files under `apps/web/src/*`
- Shared shell-level form primitives and route guard helpers
- UI test library setup in `apps/web/package.json`
- Tests for route redirect, public auth routes, protected shell scaffold, and toast/theme integration

Out of scope:
- Firebase sign-in, token exchange, refresh, logout
- Household creation, invitation, member management
- Expense entry, budgets, analytics
- Backend worker changes
- Business logic for auth/session state beyond shell-level routing and placeholder guards

## Non-negotiable Requirements

- `/` must redirect to `/sign-in`.
- Public auth routes must live at `/sign-in` and `/sign-up`.
- Use React Router for route composition and shell-level redirects.
- Add a UI test library so shell behavior can be verified with component-level tests.
- Reuse existing shadcn/Tailwind primitives already present in `apps/web/src/components/ui`.
- Keep the shell responsive and accessible from the first pass.
- Toasts must use the app’s local theme provider, not `next-themes`.
- The plan must remain self-contained and produce observable behavior and tests.

## Progress

- [ ] Create router and shell composition for guest/auth/onboarding states
- [ ] Replace placeholder home screen with redirect and route groups
- [ ] Add public auth route scaffolds for `/sign-in` and `/sign-up`
- [ ] Add protected app shell scaffold and onboarding placeholder
- [ ] Standardize shared form primitives for shell-level screens
- [ ] Fix toast/theme integration to match local provider
- [ ] Add UI test library and route/shell smoke tests
- [ ] Run web typecheck, tests, and build

## Surprises & Discoveries

- `apps/web` already has many useful shadcn-style primitives, including `Field`, `InputGroup`, `Label`, `Empty`, and `NativeSelect`.
- `apps/web/src/components/ui/sonner.tsx` currently imports `next-themes`, which does not match the local `ThemeProvider` setup.
- `apps/web` is still a minimal Vite starter, so the shell work is mostly orchestration and route structure rather than replacing an existing app router.

## Decision Log

- Decision: Redirect `/` to `/sign-in`
  Rationale: Keeps the public entry point explicit and matches the requested auth-first flow.
  Date/Author: 2026-04-21 / user decision

- Decision: Public auth routes live at `/sign-in` and `/sign-up`
  Rationale: Clean, direct URLs and no extra `/auth` nesting for MVP.
  Date/Author: 2026-04-21 / user decision

- Decision: Use React Router for shell routing
  Rationale: Gives a clear route boundary for guest, authenticated, and onboarding states without overloading the root component.
  Date/Author: 2026-04-21 / assistant recommendation

- Decision: Add UI test library now
  Rationale: Shell routing and redirect behavior need executable verification instead of manual-only checks.
  Date/Author: 2026-04-21 / user decision

## Outcomes & Retrospective

To be filled after implementation. Expected outcome is a stable frontend shell with route scaffolding, shared primitives, and verifiable redirect behavior.

## Context and Orientation

- Web app entry: `apps/web/src/main.tsx`
- Current placeholder app: `apps/web/src/app.tsx`
- Global styles and theme tokens: `apps/web/src/index.css`
- Local theme provider: `apps/web/src/components/theme-provider.tsx`
- Toast wrapper needing alignment: `apps/web/src/components/ui/sonner.tsx`
- Existing shell primitives: `apps/web/src/components/ui/*`
- Web package manifest: `apps/web/package.json`
- Product auth behavior: `docs/product-specs/authentication.md`
- Onboarding and household entry points: `docs/product-specs/new-user-onboarding.md`, `docs/product-specs/household-management.md`, `docs/product-specs/profile-management.md`

## Plan of Work (Narrative)

1. Replace the starter `App` placeholder with a router root that redirects `/` to `/sign-in`, exposes public auth routes, and branches authenticated users into a protected shell.
2. Add route-group components for guest and signed-in states. The guest branch owns `/sign-in` and `/sign-up`; the protected branch owns the app shell and onboarding placeholder state for users who have no household yet.
3. Create a lightweight shell layout with top-level navigation, empty states, and placeholder panels for future app sections such as dashboard, expenses, budgets, insights, and settings.
4. Build or compose shared form primitives for the shell-level auth and onboarding screens using the existing `Field`, `Label`, `InputGroup`, `Input`, `Textarea`, `NativeSelect`, and `Empty` components.
5. Fix `sonner` so it uses the local theme provider instead of `next-themes`, then mount the toaster at the app root.
6. Add the UI test library and write route/shell tests that prove redirect behavior, auth route reachability, and the protected shell placeholder behavior.
7. Polish global shell styling in `index.css` so the public auth pages and protected app shell feel intentionally different while staying within the current design system.

## Concrete Steps (Commands)

Run from repo root:

```bash
pnpm --filter web add react-router-dom
pnpm --filter web add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
pnpm --filter web test
pnpm --filter web typecheck
pnpm --filter web build
```

Expected transcript:
- Tests include at least one router redirect/shell smoke test passing.
- Typecheck completes with no errors.
- Build completes successfully.

## Validation and Acceptance

The feature is accepted when all of the following are true:
- Visiting `/` lands on `/sign-in`.
- `/sign-in` and `/sign-up` render as public routes without requiring auth.
- Protected shell routes render a stable layout for logged-in users.
- The onboarding placeholder is reachable for authenticated users without a household.
- Toasts render with the local theme provider.
- UI tests cover the redirect and route-group behavior.
- `pnpm --filter web typecheck`, `pnpm --filter web test`, and `pnpm --filter web build` pass.

## Idempotence & Recovery

- Route scaffolding and layout changes should be safe to rerun because they are additive and file-local.
- If router wiring needs to be refactored, keep the redirect target and public route URLs unchanged.
- Test setup changes should be reversible by keeping the test library isolated to `apps/web`.

## Artifacts and Notes

- Add a plan note to `harness/features/feat-005.json` only if implementation work starts and evidence becomes available.
- Keep the route shape and auth/onboarding assumptions documented in this file so later sessions can resume from repository state alone.

## Interfaces & Dependencies

- `react-router-dom`: app routing, redirect, and nested shell routes.
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`: component and route behavior tests.
- Existing local theme provider in `apps/web/src/components/theme-provider.tsx`: must remain the theme source of truth.
- Existing shadcn-style primitives in `apps/web/src/components/ui/*`: should be reused instead of duplicated.
- Future auth/session features from `feat-008` and `feat-009`: this plan only provides the shell they will mount into.

## Summary

This feature should establish a durable frontend foundation, not a one-off screen. The goal is to make `apps/web` ready for auth, onboarding, and MVP feature shells with clear route boundaries and executable verification.
