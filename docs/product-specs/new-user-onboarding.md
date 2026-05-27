# New User Onboarding

## Goal

Get a new user to their first expense as quickly as possible. The product is immediately usable for personal finance; household setup is optional.

## Entry Conditions

- User has successfully authenticated.

## User Flow

1. After first successful sign-in, show one brief welcome screen.
2. User lands on the Home screen in personal view:
   - empty state invites first expense
   - quick-add is visible immediately
3. User can start recording expenses, reviewing spending, and setting a personal budget without any household step.
4. After the user has some activity, the app gently surfaces household options:
   - create household
   - join household from invite
5. Household setup is always optional and reachable later from appropriate settings or household entry points.

## Acceptance Criteria

- A new user can record their first expense quickly after sign-in without creating or joining a household.
- Personal view is the only visible finance context for users without households.
- Household creation and invite acceptance are accessible but never blocking.
- Onboarding is short and does not force a multi-step wizard.

## Failure States

- Invite token invalid or expired: show clear error and allow retry.
- Network or server error during household creation: surface retry UI without affecting the user's personal data.
- User leaves mid-onboarding: next session resumes in personal view safely.

---

Notes:
- The onboarding philosophy is immediate utility first.
- New expenses start with no household and no group unless the user chooses them.
