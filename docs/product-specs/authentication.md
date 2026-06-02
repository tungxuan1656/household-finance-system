# Authentication

## Goal

Provide secure, fast, and low-friction authentication for supported clients, while keeping one worker-owned access-token and refresh-token session model.

## Entry Conditions

- User arrives at the app without an active session.
- User chooses to sign in or opens a client surface that can provide verified identity context.

## User Flow

1. User authenticates through a supported identity entry:
   - web: Firebase email/password
   - TMA: Telegram launch context
2. Client sends the provider credential to the backend provider-exchange endpoint.
3. Backend verifies the provider credential and maps/creates a local user record.
4. Backend issues an application `access token` (short-lived) and a `refresh token` (longer-lived) for the client.
5. Client stores tokens using its approved storage path and enters the app.
6. On access token expiry, client uses the app refresh token to obtain a new access token from `POST /auth/refresh`.
7. User can sign out; backend revokes the refresh session and ends the app session.

## Acceptance Criteria

- Supported clients can exchange verified provider identity for valid app access + refresh tokens.
- Web users can sign up / sign in with email + password via Firebase.
- TMA users can exchange valid Telegram launch context without a separate email/password form inside Telegram.
- Token refresh flow works without forcing full re-login while refresh token is valid.
- Sign-out invalidates the client session and refresh token.
- Backend validates provider credentials on each sign-in or launch exchange.
- Both providers share the same `access token` / `refresh token` shape and the same `refresh_sessions` table.

## Failure States

- Provider (Firebase) returns an error: show clear error and retry option.
- Telegram launch context missing or invalid: deny access and render the fatal launch screen. The CTA asks the user to reopen the Mini App from a supported Telegram surface. There is no in-app retry loop; reopen is the recovery path.
- `auth_date` is outside the freshness window: same fatal launch screen with the same reopen CTA.
- Token exchange fails (network, server error): show a localized error with the same reopen guidance when it happens during bootstrap.
- Refresh token expired/invalid: drop the session and render the fatal launch screen; the next supported launch will re-exchange.

## TMA failure-state UI contract

- The fatal launch screen is full-bleed, respects safe-area insets, and is keyboard-friendly.
- The CTA text is localized in vi and en (`tma.auth.reopenGuidance`).
- The screen never offers a retry button. Reopening from Telegram is the only recovery path for missing or invalid launch context.
- Bootstrap never sets `authenticated` status unless the worker returned a valid session. There is no offline/guest fallback for the TMA auth path.

---

Notes:
- Current implemented providers are Firebase (web) and Telegram (TMA). Both share the worker session model.
- Treat tokens as opaque to the client; follow secure storage best practices.
- Keep the provider-exchange contract provider-neutral even when providers differ.
- Consider rate-limiting and monitoring for auth endpoints.
- Future providers should extend the same exchange model instead of creating separate session systems.
