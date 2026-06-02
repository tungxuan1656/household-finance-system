# TMA state and storage pattern

Canonical state-placement and device-storage rules for planned `apps/tma`.

## Scope

Use this doc for:

- bootstrap state flow
- TanStack Query ownership
- Zustand flow-store usage
- Telegram storage capabilities and fallbacks

## State split

Use the smallest state owner that fits.

- TanStack Query: worker-backed data, request lifecycle, invalidation, optimistic updates.
- Zustand: short-lived multi-step workflow state.
- Local component state: formatting, open/close UI, local selection, input affordances.

Do not create a fourth app-wide state layer unless a real gap exists.

## Bootstrap sequence

Preferred startup order:

1. Initialize Telegram wrappers and capability state.
2. Read launch params and route intent.
3. Exchange verified Telegram launch context for app session.
4. Hydrate the minimum session/user queries.
5. Resolve post-auth routing.
6. Fetch heavier reference/read data after the shell is interactive.

Rules:

- Keep first render narrow. Do not fan out five queries before session bootstrap finishes.
- Blocking launch/auth failure UI belongs in the root app shell.
- Route intent decode happens before feature routing, but product actions wait for auth success.

## Default auth-session persistence

Use this default unless a later security review explicitly changes it:

- On each supported cold open, read launch params and perform a fresh provider exchange.
- Keep the access token in memory.
- Persist the refresh token in `SecureStorage` only when supported.
- If `SecureStorage` is unavailable, keep the session memory-only and re-exchange on the next supported launch.
- Do not persist app auth tokens in `DeviceStorage` or `localStorage`.

## Query rules

- Reuse existing worker contracts. Do not invent TMA-only API shapes first.
- Query keys should stay domain-based, not screen-based.
- Prefetch only the likely next step or the first visible read surface.
- Lazy-load chart-heavy or analytics-heavy routes together with their queries.

## Zustand rules

- Use stores for amount-first multi-step flows, not generic app truth.
- Keep store shape flat and resettable.
- Persist only fields with a real resume need.
- Do not persist transient request flags or large DTO blobs.

Good store examples:

- add-expense draft
- current invite accept intent
- transient UI coordination for a multi-step picker

Bad store examples:

- full expense feed cache
- authenticated user profile mirror
- global error log

## Storage tiers

Use storage by sensitivity and lifetime.

- `SecureStorage`: sensitive session material when supported and explicitly approved by the auth feature.
- `DeviceStorage`: per-device cache, resume hints, recent context, and lightweight preferences.
- `localStorage` fallback: allowed only for non-sensitive cache behind one adapter with a security note and explicit TTL/cleanup policy.
- Backend/D1: source of truth for cross-device product data.

## Storage rules

- Sensitive keys and cache keys must not share one adapter namespace.
- Device-local storage is a cache layer, not product truth.
- Do not assume new storage capabilities exist on every Telegram client version.
- Wrap all storage calls behind one app-owned adapter so unsupported capability fallback lives in one place.

Suggested key families:

- `session:*`
- `cache:*`
- `hint:*`

## Fallback policy

- Capability checks live in the storage adapter.
- Fallback from `SecureStorage` or `DeviceStorage` must be explicit in feature evidence.
- If fallback weakens security, document the exact tradeoff in the auth feature and user-facing risk notes.
- For auth tokens, the default fallback is weaker persistence avoidance, not weaker storage.

## Resume rules

- Resume only the current device convenience state.
- Keep resume payloads small and disposable.
- Expire or reset stale drafts after submit, logout, or route-incompatible schema changes.

## Test rules

Cover at least:

- supported and unsupported storage capability branches
- stale or corrupt cache payload recovery
- flow-store reset after submit and cancel
- bootstrap order for valid auth, invalid auth, and intent-routing cases
