# New User Onboarding

## Goal

Get a new user recording their first expense as quickly as possible — ideally within seconds of sign-in. The product is immediately usable in personal mode. Household creation and invitation are surfaced as optional next steps, not as a gate.

## Entry Conditions

- User has successfully authenticated (first sign-in or fresh account with no prior data).

## User Flow

1. After first successful sign-in, show a brief welcome screen (1 screen, not a multi-step wizard) that explains: "Track your expenses in seconds. Start personal, grow into family when ready."
2. User lands on the **Home screen in Personal lens** — the app is already fully functional:
   - Empty state: "No expenses yet. Add your first one to get started."
   - Prominent quick-add button visible and actionable immediately.
3. User can start using the product: add expenses, view spending, set a personal budget — all without creating or joining any household.
4. After the user has entered their first few expenses (or at any time from settings), the app **gently surfaces** household options:
   - A dismissible card or banner: "Want to track family spending too? Create or join a household."
   - Always accessible via Settings or the lens selector (when households exist).
5. If creating a household: collect name only (MVP). Currency/timezone are fixed defaults.
6. If joining via invite: accept a token, validate it, confirm household summary before joining.
7. No forced tour. No multi-step wizard. The product demonstrates its value through use, not through explanation.

## Acceptance Criteria

- A new user can record their first expense within 10 seconds of completing sign-in, without any household-related steps.
- Personal mode (lens) is the default and only visible context for users without households.
- Household creation/joining is accessible but never required or obstructive.
- Onboarding surface is exactly one welcome screen, followed by an immediately usable Home screen.
- "Create/Join household" options are available from Settings and surfaced contextually once the user has engaged with the product.

## Key Metrics

- **Time-to-first-expense** (target: under 15 seconds from sign-in completion)
- **First-session expense count** (did the user add any expenses on day 1?)
- **Household creation rate** (what % of users eventually create or join a household, and when?)

## Failure States

- Invite token invalid/expired: show clear error and allow requesting a new invite or entering a different token.
- Network or server error during household creation: surface retry UI without affecting the user's existing personal data.
- User closes app mid-onboarding: no issue — they resume in personal mode next session. Partial household creation state is discarded safely.

---

Notes:
- The onboarding philosophy is: **the product sells itself through immediate utility, not through explanation.**
- Personal mode must feel complete and valuable on its own. Household is an upgrade, not a missing piece.
- The welcome screen should use minimal text and a clear "Get Started" primary action that leads directly to the Home screen.
- Onboarding must respect privacy defaults (expenses start as private) and not prompt for household sharing prematurely.
