# Telegram Mini App

## Goal

Offer a zero-install Telegram client for the same household-finance product, optimized for fast expense capture, invite handling, and mobile-first read flows.

## Entry Conditions

- User opens the app from a supported Telegram Mini App launch surface.
- Network is available.
- Existing worker APIs remain the source of truth.

## User Flow

1. User opens the Mini App from Telegram.
2. App reads the Telegram launch context and exchanges it for the normal app session. There is no email/password form inside TMA.
3. If a supported `startapp` payload exists, the app routes to the matching intent after session bootstrap:
   - invite preview and accept
   - other future targeted actions that the product explicitly supports
4. Default navigation stays inside one SPA session. Back navigation uses Telegram `BackButton` when shown.
5. Expense capture uses a three-step flow: amount -> category -> details.
6. Read and write behavior follows the same worker rules already used by the web client.

## Acceptance Criteria

- TMA opens without a separate install flow beyond Telegram.
- Valid Telegram launch context can establish the same worker-backed app session model used by the web client.
- Invite deep links can land a user inside TMA and preserve the invite-accept path.
- Expense create semantics stay identical to shared product rules even though the interaction model differs from web.
- No offline write queue, guest mode, or product fork is implied.

## Failure States

- Launch context missing or invalid: show blocking re-open guidance.
- Required Telegram capability unavailable: block only the affected action or show a safe fallback.
- Invite payload invalid or expired: show actionable invite error.
- Network or auth refresh failure: show retry and re-auth guidance.

## Notes

- TMA is an additional client surface. It does not redefine expense, household, budget, group, or analytics domain rules.
- Bot chat is a companion surface, not the primary CRUD UI.
- Read this spec with `authentication.md`, `household-invitation.md`, and `quick-add-experience.md`.
