# New User Onboarding

## Goal

Enable a fast, low-friction first-run experience that gets a user to a usable state (account + household) within a few steps.

## Entry Conditions

- User has authenticated and does not belong to any household yet.

## User Flow

1. After first successful sign-in, show a short welcome screen that explains the core value proposition.
2. Prompt the user to choose: (a) Create a new household, or (b) Join an existing household via invite link/code.
3. If creating: collect household name, default currency, and an option to invite members now.
4. If joining: accept an invite token, validate it, and show a household summary before joining.
5. After household selection, surface quick next steps: invite members, set monthly budget, or add a first expense via quick-add.
6. Offer an optional short tour highlighting fast-add, budgets, and insights.

## Acceptance Criteria

- A new user can create a household in 2–3 steps.
- A new user can join a household via a valid invite link/token.
- Onboarding surfaces at least one clear next action (invite, set budget, quick-add).
- Users can skip inviting members and still use the app (single-player usable).

## Failure States

- Invite token invalid/expired: show clear error and allow requesting a new invite or entering a different token.
- Network or server error during household creation: persist minimal client state and allow retry without losing input.
- User abandons onboarding: ensure partial state is safe and user can resume from account settings.

---

Notes:
- Keep screens minimal with sensible defaults; measure time-to-first-household and completion rate.
- Onboarding must respect privacy choices (private vs household) and not auto-share data without confirmation.
