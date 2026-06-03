# TMA Launch And Auth

## Goal

Allow a user to open the Mini App from Telegram and enter the product without a separate email/password form.

## Entry Conditions

- User opens the Mini App from a supported Telegram launch surface.

## User Flow

1. App reads Telegram launch context.
2. App exchanges the verified launch context for the normal app session.
3. If a supported `startapp` payload exists, the app routes to the matching intent after session bootstrap.
4. If launch context is invalid or missing, app shows the fatal launch screen with reopen guidance.

## Acceptance Criteria

- TMA users can authenticate without a browser sign-in form inside Telegram.
- Fatal launch handling uses reopen guidance, not an in-app retry loop.
- Session semantics stay shared with `../shared/authentication-session.md`.

## Failure States

- Launch context missing or invalid: deny access and show fatal launch guidance.
- `auth_date` outside freshness window: same fatal launch guidance.
- Exchange fails during bootstrap: show localized reopen guidance.
