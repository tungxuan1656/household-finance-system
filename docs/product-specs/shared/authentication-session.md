# Authentication Session

## Goal

Provide secure, fast, low-friction authentication for supported clients while keeping one worker-owned access-token and refresh-token session model.

## Entry Conditions

- User arrives at a supported client surface without an active session.
- The client can collect or provide verified identity context.

## User Flow

1. Client authenticates the user through a supported identity provider.
2. Client sends the provider credential to the backend provider-exchange endpoint.
3. Backend verifies the provider credential and maps or creates a local user record.
4. Backend issues an application `access token` and `refresh token`.
5. Client stores tokens using the approved storage path for that surface and enters the app.
6. On access-token expiry, client uses `POST /auth/refresh` to obtain a new access token while the refresh token stays valid.
7. On sign-out, backend revokes the refresh session and ends the app session.

## Acceptance Criteria

- Supported clients can exchange verified provider identity for valid app access + refresh tokens.
- Token refresh works without forcing a full re-login while the refresh token remains valid.
- Sign-out invalidates the client session and refresh token.
- Backend validates provider credentials on each sign-in or launch exchange.
- All providers share the same `access token` / `refresh token` shape and the same `refresh_sessions` table.

## Failure States

- Provider returns an error: client shows clear error and recovery guidance appropriate to that surface.
- Token exchange fails due to network or server error: client surfaces a truthful retry or reopen path appropriate to that surface.
- Refresh token expired or invalid: client drops the session and requires a fresh authenticated entry.

---

Notes:
- Current implemented providers are Firebase for web and Telegram for TMA.
- Treat tokens as opaque to the client; follow secure storage best practices.
- Keep the provider-exchange contract provider-neutral even when providers differ.
