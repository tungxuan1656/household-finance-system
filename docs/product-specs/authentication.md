# Authentication

## Goal

Provide secure, fast, and low-friction authentication for users using Firebase email/password (MVP), enabling token-based session management for frontend and backend.

## Entry Conditions

- User arrives at the app without an active session.
- User chooses to sign in or access an authenticated route.

## User Flow

1. User signs up or signs in with email + password using the Firebase Authentication SDK on the frontend.
2. Frontend receives a Firebase ID token and sends it to the backend (POST /auth/exchange).
3. Backend verifies the Firebase ID token (via Firebase Admin SDK or token verification endpoint) and maps/creates a local user record.
4. Backend issues an application `access token` (short-lived) and a `refresh token` (longer-lived) for the client to manage sessions within the app.
5. Frontend stores tokens securely (in-memory + secure storage) and redirects user to the app.
6. On access token expiry, frontend uses the app refresh token to obtain a new access token from `POST /auth/refresh`.
7. User can sign out; backend revokes refresh token or marks session invalid and optionally instructs Firebase to revoke refresh tokens for that user.

## Acceptance Criteria

- Users can sign up / sign in with email + password via Firebase and receive valid access + refresh tokens for the app.
- Token refresh flow works without forcing full re-login while refresh token is valid.
- Sign-out invalidates the client session and refresh token.
- Backend validates Firebase ID tokens on each sign-in.

## Failure States

- Provider (Firebase) returns an error: show clear error and retry option.
- Token exchange fails: deny access and show appropriate message.
- Refresh token expired/invalid: require full re-authentication.

---

Notes:
- Treat tokens as opaque to the frontend; follow secure storage best practices.
- Design API contract: POST /auth/exchange, POST /auth/refresh, POST /auth/logout.
- Use Firebase Admin SDK on the backend to verify ID tokens and optionally to revoke Firebase sessions when needed.
- Consider rate-limiting and monitoring for auth endpoints.
- Future: support additional identity providers (Google, OAuth) by adding provider-specific exchange flows; keep MVP focused on Firebase email/password.