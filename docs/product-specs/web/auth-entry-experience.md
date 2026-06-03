# Web Auth Entry Experience

## Goal

Let web users sign up, sign in, and sign out through a normal browser-first auth experience.

## Entry Conditions

- User opens `apps/web` without an active session.

## User Flow

1. User opens sign-in or sign-up.
2. User authenticates with Firebase email/password.
3. Web client exchanges the verified provider credential for app session tokens.
4. Web client enters the protected app.
5. User can sign out from the web shell.

## Acceptance Criteria

- Web users can sign up and sign in without Telegram.
- Web auth entry uses browser forms, not launch-context auth.
- Web sign-out is reachable from the protected shell.

## Failure States

- Invalid email/password: show inline form error.
- Network or provider error: show retryable auth error.

---

Notes:
- Session semantics live in `../shared/authentication-session.md`.
