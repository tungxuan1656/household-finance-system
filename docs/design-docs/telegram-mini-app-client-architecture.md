# Telegram Mini App client architecture

Owner: product + frontend + backend
Update trigger: when TWA package boundary, auth/session model, or native bridge policy changes

## Why this doc exists

The repo already has one web client in `apps/web`.

Telegram Mini App work adds a second client surface with different constraints:

- Telegram WebView instead of a normal browser tab
- native bridge APIs for back button, bottom buttons, theme, haptics, and storage
- launch-context auth instead of a form-first sign-in entry
- stricter mobile performance and keyboard behavior

This doc locks the durable client direction before runtime code starts.

## Short summary

- TWA is a new client at `apps/twa`. It does not replace `apps/web`.
- Product truth, worker APIs, and D1 truth stay shared.
- Use React + Vite SPA. Do not embed TWA inside Next.js App Router.
- Use SPA routing only. Full-page reload navigation is a bug.
- TWA does not inherit `shadcn/ui` as its primary UI system.
- Telegram bridge features are first-class when supported: back button, bottom buttons, theme vars, haptics, closing confirmation, and deep links.
- Bot chat is companion UX only: launch, invite, alerts, and summaries.

## Boundary with the current repo

### One product, two clients

- `apps/web` remains the normal browser client.
- `apps/twa` becomes the Telegram client.
- `apps/worker` stays the only backend API surface.

Rules:

- Do not import UI or feature code directly from `apps/web` into `apps/twa`.
- Reuse product truth through worker contracts, shared DTOs, and extracted helpers only.
- Do not fork business rules between clients.

### Worker session model stays shared

TWA auth is a new provider input, not a new session system.

Rules:

- TWA launches with Telegram context.
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

The Mini Apps JS ecosystem has package-name churn between `@tma.js/*` and `@telegram-apps/*`.

Rules:

- Lock one package line at implementation time.
- Do not mix both namespace families in one app.
- Record the chosen package line in the first TWA runtime ExecPlan.

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

### TWA UI policy

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
- full-page refresh navigation between TWA screens

### Step URLs are good when they stay inside the SPA

TWA expense capture may use separate routes such as:

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

- Prefer Telegram `SecureStorage` when supported.
- If `SecureStorage` is unavailable, the fallback must be chosen explicitly in feat-080 with a security note.
- Do not silently drop to unsafe long-lived token storage without documenting the tradeoff.

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

Do not make keyboard-button or inline-mode launches a hard dependency for authenticated TWA flows.

### Bot companion role

Bot chat should handle:

- opening the Mini App
- sharing invite links
- budget alerts
- summary digests

Bot chat should not become the primary CRUD UI for expenses, budgets, or household management.

## Rollout map

The harness rollout is intentionally phased:

- feat-079: workspace scaffold and bootstrap
- feat-080: Telegram auth exchange and session bootstrap
- feat-081: expense capture flow
- feat-082: household and invite flows
- feat-083: read surfaces for budgets, groups, and insights
- feat-084: device hardening and performance QA
- feat-085: bot companion launch and notifications

## Open edges kept for the first runtime plan

- Exact SDK package line after package-namespace verification
- Exact session fallback if `SecureStorage` is unsupported
- Whether bot runtime lives inside the worker repo, as a sibling app, or as a dedicated external service
