# ExecPlan: feat-009b - Clean & Minimal Mobile-First Auth UI

## Purpose / Big Picture

This change significantly cleans up the Authentication screens (Sign-in and Sign-up) to deliver an ultra-clean, minimal-text, and premium mobile-first experience. End users will see the login/registration form immediately on mobile without scrolling, free from any technical jargon or debug labels. The design will leverage the `radix-mira` template's larger typography and sizes for better touch targets and readability.

## Scope

- **Shell Layout**: `apps/web/src/components/layouts/public-shell.tsx`
- **Auth Components**: `apps/web/src/components/auth/auth-panel.tsx`, `apps/web/src/components/auth/auth-field.tsx`
- **Auth Pages**: `apps/web/src/pages/auth/sign-in-page.tsx`, `apps/web/src/pages/auth/sign-up-page.tsx`

**Out of scope**: Changes to backend auth endpoints or database schemas.

## Non-negotiable Requirements

- **Mobile-first**: The authentication form MUST be visible "above the fold" on mobile (375px width). The hero/info section must drop below the form or be hidden on mobile.
- **Minimal Text**: Remove all debug badges (e.g., "TUYẾN CÔNG KHAI"), internal route descriptions, and technical placeholder text.
- **Premium Interaction**: Buttons and inputs must be sized comfortably for touch (minimum `h-10`), fully utilizing the new template's scaling.
- The plan must be self-contained and produce observable behavior.

## Progress

- [ ] Reorder flex layout in `public-shell.tsx` to display the form block before the info block on mobile (`flex-col-reverse` or `order` classes).
- [ ] Strip out debug badges, routing text, and technical slogans from `auth-panel.tsx` and `public-shell.tsx`.
- [ ] Simplify the hero section to a single, impactful headline and minimal subtext.
- [ ] Ensure input fields and buttons in `auth-field.tsx` and auth pages utilize the larger sizing scale (`h-10` / `h-11`).
- [ ] Verify clean, minimal aesthetic on browser (mobile and desktop).
- [ ] Run `./init.sh` to ensure no tests or types are broken.

## Context and Orientation

- **Public Shell (`apps/web/src/components/layouts/public-shell.tsx`)**: The main layout wrapper for public auth pages. Currently renders a split screen but incorrectly stacks the hero section on top for mobile.
- **Auth Panel (`apps/web/src/components/auth/auth-panel.tsx`)**: Wraps the form elements. Contains several debug badges and verbose placeholder text that needs removal.

## Plan of Work (Narrative)

1. **Layout Reversal (Mobile)**: Edit `public-shell.tsx`. Change the main container's responsive grid/flex utility to ensure the right-hand column (containing the `<Outlet />` for forms) is ordered *first* on mobile screens, pushing the visual hero section below it.
2. **Text Purge**: Edit `public-shell.tsx` and `auth-panel.tsx`. Remove the `Badge` components displaying "TUYẾN CÔNG KHAI", delete the footer paragraphs explaining route paths, and reduce the placeholder feature lists to minimal, user-friendly copy.
3. **Component Sizing Verification**: Edit `auth-field.tsx` and the form buttons in `sign-in-page.tsx` / `sign-up-page.tsx`. Explicitly set classes like `h-10` or `h-11` and ensure font sizes (`text-sm` or `text-base`) are used instead of `text-xs`.
4. **Spacing & Breathing Room**: Increase padding (`p-6` to `p-8` or `p-10`) around the form container to make the UI feel lighter and cleaner.

## Concrete Steps (Commands)

```bash
# Start frontend dev server to observe changes interactively
pnpm --filter web dev

# Verify code quality after modifications
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
```

## Validation and Acceptance

- Open `http://localhost:5174/auth/sign-in` on a 375px mobile emulator.
  - The email input and "Sign In" button are immediately visible.
  - No debug text or badges are present.
- Resize to 1440px desktop view.
  - The UI is a clean split-screen with generous whitespace and minimal text.
- Running `./init.sh` passes 100%.

## Idempotence & Recovery

- All UI changes are frontend-only and purely presentational.
- Changes can be reverted via Git if the design direction needs adjustment.

## Artifacts and Notes

- Browser subagent confirmed that the previous iteration had the hero section blocking the form on mobile and was cluttered with debug strings.
- Template `radix-mira` provides a good foundation for sizing, but explicit height overrides may be needed if components default to `h-8`.
