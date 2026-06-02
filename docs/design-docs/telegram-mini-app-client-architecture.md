# Telegram Mini App client architecture

Owner: product + frontend + backend
Update trigger: when TMA package boundary, auth/session model, or native bridge policy changes

## Why this doc exists

The repo has two web clients:

- `apps/web` — Next.js browser client
- `apps/tma` — Telegram Mini App client (planned)

TMA adds different constraints:

- Telegram WebView instead of a normal browser tab
- native bridge APIs for back button, bottom buttons, theme, haptics, and storage
- launch-context auth instead of a form-first sign-in entry
- stricter mobile performance and keyboard behavior

This doc locks the durable client direction before runtime code starts.

## Short summary

- TMA is a new client under `apps/tma`. It does not replace `apps/web`.
- Product truth, worker APIs, and D1 truth stay shared.
- Use React + Vite SPA. Do not embed TMA inside Next.js App Router.
- Use SPA routing only. Full-page reload navigation is a bug.
- TMA does not inherit `shadcn/ui` as its primary UI system.
- Telegram bridge features are first-class when supported: back button, bottom buttons, theme vars, haptics, closing confirmation, and deep links.
- Bot chat is companion UX only: launch, invite, alerts, and summaries.

## Boundary with the current repo

### One product, two clients

- `apps/web` remains the normal browser client.
- `apps/tma` becomes the Telegram client.
- `apps/worker` stays the only backend API surface.

Rules:

- Do not import UI or feature code directly from `apps/web` into `apps/tma`.
- Reuse product truth through worker contracts, shared DTOs, and extracted helpers only.
- Do not fork business rules between clients.

### Worker session model stays shared

TMA auth is a new provider input, not a new session system.

Rules:

- TMA launches with Telegram context.
- Worker verifies Telegram context.
- Worker still issues the same app access token and refresh token model.
- Refresh and logout stay in the existing worker auth lifecycle.

## Client stack direction

### Core framework

- React, not Preact-compat.
- Vite SPA, not Next.js.
- React Router for in-app history.
- TanStack Query for server state.
- Zustand for small client-local workflow state.
- Framer Motion for screen transitions and high-touch interactions.

### Package policy

The Mini Apps JS ecosystem has package churn across multiple package families.

Rules:

- Use the `@tma.js/*` line for new runtime work.
- For a React client, make `@tma.js/sdk-react` the primary app-facing package.
- Add lower-level `@tma.js/*` packages only when the React package does not already cover the needed API cleanly.
- Do not mix multiple Telegram Mini Apps package families in one app.
- Keep alternate package families out unless a concrete runtime blocker is proven and recorded.

## UI system direction

### What carries over from web

- Product semantics
- API contracts
- i18n discipline
- feature-first ownership mindset

### What does not carry over from web

- Next.js route structure
- web protected-shell wrappers
- shadcn-first page composition
- desktop-first dialog assumptions

### TMA UI policy

- Telegram-adaptive list, section, cell, and switch primitives are allowed for low-level mobile shell UI.
- Project-owned components should own high-touch finance flows such as amount entry, bottom sheets, and success/error microstates.
- Theme colors should come from Telegram CSS vars first. Avoid hardcoded web-theme assumptions.

## Navigation and native chrome

### SPA routing only

Allowed:

- `navigate()`
- `Link`
- history back inside the SPA

Not allowed:

- `window.location` route changes
- full-page refresh navigation between TMA screens

### Step URLs are good when they stay inside the SPA

TMA expense capture may use separate routes such as:

- `/add/amount`
- `/add/category`
- `/add/details`

That is correct only when the bundle stays loaded and state stays in memory/store.

### Telegram-native controls

- `BackButton` is manual. Show, hide, and wire it per route or flow shell.
- `BottomButton` state belongs to the current flow shell, not random leaf controls.
- There is no native title header. The app renders its own header.

## Storage, session, and cache

### Session policy

- On cold open, always prefer a fresh launch-context exchange instead of assuming a persisted app session.
- Keep the access token memory-only by default.
- Persist the refresh token in Telegram `SecureStorage` only when supported.
- If `SecureStorage` is unavailable, fall back to a memory-only session and re-exchange on the next supported launch.
- Do not persist app auth tokens to `DeviceStorage` or `localStorage` in TMA.

### Cache policy

- `DeviceStorage` is for per-device cache and resume hints only.
- Do not treat device-local cache as cross-device truth.
- No offline write queue is planned.

## Performance and device behavior

- Optimize for Telegram WebView first.
- Animate `transform` and `opacity`, not layout properties.
- Keep keyboard-safe layouts, safe-area spacing, and low-end Android fallback in the core plan.
- Heavy analysis screens should lazy-load.
- Haptics should be meaningful, not everywhere.
- Touch-first handlers are allowed on high-frequency controls only when there is measured delay or gesture benefit.

## Launch mode and bot boundary

### Supported launch direction

Use launch surfaces that provide the Mini App context needed for auth and deep-link routing.

Preferred:

- bot menu button
- direct Mini App link with `startapp`
- other supported Mini App launch surfaces with valid `initData`

Do not make keyboard-button or inline-mode launches a hard dependency for authenticated TMA flows.

### Bot companion role

Bot chat should handle:

- opening the Mini App
- sharing invite links
- budget alerts
- summary digests

Bot chat should not become the primary CRUD UI for expenses, budgets, or household management.

### Bot runtime default

- Start with a worker-hosted bot adapter boundary inside `apps/worker`.
- Keep webhook handling, outbound send helpers, and notification orchestration behind explicit bot modules.
- Extract to a sibling runtime only if operational evidence shows the worker-hosted shape is insufficient.

## Rollout map

The harness rollout is intentionally phased:

- feat-079: workspace scaffold and bootstrap
- feat-080: Telegram auth exchange and session bootstrap
- feat-081: expense capture flow
- feat-082: household and invite flows
- feat-083: read surfaces for budgets, groups, and insights
- feat-084: device hardening and performance QA
- feat-085: bot companion launch and notifications

## Runtime defaults now locked

- SDK package line: `@tma.js/*`
- Cold-open auth model: exchange launch context on each supported open
- Token persistence: access token in memory, refresh token in `SecureStorage` only, otherwise memory-only fallback
- Bot runtime default: worker-first adapter boundary inside `apps/worker`

## Remaining implementation-time details

- Exact module names and file seams for the first `apps/tma` scaffold
- Exact wrapper API for Telegram capabilities under `apps/tma/src/lib/telegram/*`
- Whether future notification scale requires queue or service extraction after feat-085 evidence exists
