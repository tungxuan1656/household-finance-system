# Telegram Mini App docs and harness foundation

## Purpose / Big Picture

Add the durable docs and harness structure needed before implementation starts on a Telegram Mini App client. This work does not add runtime code yet. It makes the future TMA work legible: where product behavior lives, where durable client decisions live, which frontend/backend leaf rules to read, and which harness features should be executed in order.

## Scope

- Files and areas changed:
  - `docs/design-docs/index.md`
  - `docs/design-docs/telegram-mini-app-client-architecture.md`
  - `docs/product-specs/index.md`
  - `docs/product-specs/authentication.md`
  - `docs/product-specs/household-invitation.md`
  - `docs/product-specs/quick-add-experience.md`
  - `docs/product-specs/telegram-mini-app.md`
  - `docs/TMA.md`
  - `docs/FRONTEND.md`
  - `docs/BACKEND.md`
  - `docs/references/index.md`
  - `docs/references/tma/app-structure-and-client-rules.md`
  - `docs/references/tma/auth-and-bot-pattern.md`
  - `ARCHITECTURE.md`
  - `docs/exec-plans/index.md`
  - `harness/feature_index.json`
  - `harness/features/feat-078.json`
  - `harness/features/feat-079.json`
  - `harness/features/feat-080.json`
  - `harness/features/feat-081.json`
  - `harness/features/feat-082.json`
  - `harness/features/feat-083.json`
  - `harness/features/feat-084.json`
  - `harness/features/feat-085.json`
  - `harness/progress.md`
- Out of scope:
  - creating `apps/tma`
  - adding worker routes or auth code
  - choosing final Telegram SDK package versions in code
  - BotFather setup or deployment

## Non-negotiable Requirements

- Keep one product. TMA is a new client surface, not a product fork.
- Keep one session model. Telegram auth must join the existing worker token lifecycle.
- Keep docs split by responsibility: product behavior, durable design, frontend leaf rules, backend leaf rules, and harness rollout.
- Do not hardcode secrets or copy Telegram tokens into tracked files.

## Progress

- [x] Read workflow, plan, frontend, backend, security, shared-type, product, design, and harness docs.
- [x] Pressure-test the user-provided TMA notes against current repo truth and official Telegram docs.
- [x] Create the TMA design doc, product spec, frontend rule doc, and backend rule doc.
- [x] Update routers and cross-linked specs so TMA guidance has a canonical home.
- [x] Seed ordered harness features for phased TMA delivery.
- [x] Run docs/harness verification and record evidence.

## Surprises & Discoveries

- Telegram package selection should stay on one package family, with `@tma.js/*` as the default line for new work.
- Telegram launch context is not guaranteed in every surface. Keyboard-button and inline launches can miss `initData`, so TMA auth cannot assume every launch path is valid.
- The current worker auth contract is still Firebase-shaped (`provider` + `idToken`). TMA auth should not bolt on a second session flow; it should first neutralize provider-specific naming.

## Decision Log

- Decision: TMA will be a separate frontend package at `apps/tma`.
  Rationale: `apps/web` is Next.js App Router and shadcn-first. TMA needs SPA routing, Telegram bridge lifecycle, and different UI primitives.
  Date/Author: 2026-06-01 / Codex

- Decision: TMA gets its own router doc and reference folder instead of living under frontend or backend only.
  Rationale: The platform crosses client UI, worker auth, launch modes, storage, and bot boundaries. A dedicated `docs/TMA.md` scales better and leaves room for future platform routers such as React Native.
  Date/Author: 2026-06-01 / Codex

- Decision: The long TMA architecture brief belongs in a design doc, not inside a product spec.
  Rationale: Most of the input is durable client architecture, native bridge policy, and UI/UX implementation direction.
  Date/Author: 2026-06-01 / Codex

- Decision: TMA auth should extend the current provider exchange flow instead of inventing a second worker session system.
  Rationale: The worker already owns access token, refresh token, and local user/session mapping. New provider, same session lifecycle.
  Date/Author: 2026-06-01 / Codex

## Outcomes & Retrospective

The repo now has a clean landing zone for TMA work. Future agents can read one design doc for durable client direction, one product spec for TMA-visible behavior, one frontend leaf for `apps/tma` implementation rules, one backend leaf for worker-side Telegram auth/bot boundaries, and a harness roadmap split into small enough delivery features.

## Context and Orientation

- Current frontend rules start at `docs/FRONTEND.md`.
- Current backend rules start at `docs/BACKEND.md`.
- Durable UX and architecture decisions live in `docs/design-docs/*`.
- Product-visible behavior lives in `docs/product-specs/*`.
- Harness execution state lives in `harness/feature_index.json`, `harness/features/*.json`, and `harness/progress.md`.

## Plan of Work (Narrative)

First, inspect the existing docs routers, product specs, design-doc index, and harness format to avoid inventing a parallel docs tree. Second, create a TMA design doc for stable client architecture and UI direction, then add a TMA product spec for launch/auth/navigation/invite behavior. Third, create a dedicated `docs/TMA.md` router with exact TMA leaf rules so future `apps/tma` and worker work have one platform home outside `frontend` and `backend`. Fourth, patch existing auth, invite, quick-add, architecture, and router docs so they point at TMA without claiming the feature is already implemented. Fifth, seed the harness with one docs-foundation feature and a phased rollout sequence for scaffold, auth, expense flow, household flow, read surfaces, hardening, and bot companion work.

## Concrete Steps (Commands)

Run from repo root:

```bash
# inspect current docs and harness
sed -n '1,220p' docs/FRONTEND.md
sed -n '1,220p' docs/BACKEND.md
sed -n '1,220p' harness/feature_index.json

# verify harness JSON after edits
node -e "JSON.parse(require('fs').readFileSync('harness/feature_index.json','utf8')); JSON.parse(require('fs').readFileSync('harness/features/feat-078.json','utf8')); console.log('OK')"

# docs/harness sanity
./scripts/check_harness_size.sh
git diff --check

# final repo verification
./init.sh
```

Expected short outputs:

- JSON parse check prints `OK`.
- `./scripts/check_harness_size.sh` prints a pass message.
- `git diff --check` prints nothing.
- `./init.sh` ends with `Done!`.

## Validation and Acceptance

Acceptance is met when:

- `docs/design-docs/index.md` routes the new TMA design doc.
- `docs/product-specs/index.md` routes the new TMA product spec.
- `docs/TMA.md`, `docs/FRONTEND.md`, `docs/BACKEND.md`, and `docs/references/index.md` route the new TMA leaf docs.
- Existing auth/invite/quick-add specs no longer imply that web-only behavior is the only future client path.
- Harness includes one completed docs-foundation feature plus the ordered planned TMA rollout features.
- JSON validation, harness-size check, whitespace check, and final repo verification pass.

## Idempotence & Recovery

- Re-running the doc edits is safe.
- Re-running JSON, harness-size, whitespace, and `./init.sh` verification is safe.
- No migrations, destructive data changes, or deploy steps are part of this plan.

## Artifacts and Notes

- Main design artifact: `docs/design-docs/telegram-mini-app-client-architecture.md`
- Main product artifact: `docs/product-specs/telegram-mini-app.md`
- Main implementation rule artifacts:
  - `docs/TMA.md`
  - `docs/references/tma/app-structure-and-client-rules.md`
  - `docs/references/tma/auth-and-bot-pattern.md`
- Harness rollout artifacts:
  - `harness/features/feat-078.json`
  - `harness/features/feat-079.json`
  - `harness/features/feat-080.json`
  - `harness/features/feat-081.json`
  - `harness/features/feat-082.json`
  - `harness/features/feat-083.json`
  - `harness/features/feat-084.json`
  - `harness/features/feat-085.json`

## Interfaces & Dependencies

- Telegram runtime concepts checked against the official Mini Apps docs and package pages on 2026-06-01:
  - launch modes and `initData`
  - `BackButton`, `BottomButton`, `DeviceStorage`, `SecureStorage`
  - package-line churn across Telegram Mini Apps package families
- Internal repo dependencies:
  - current worker auth/session flow in `apps/worker/src/routes/auth.ts`
  - current product/auth specs under `docs/product-specs/*`
  - current harness workflow under `AGENTS.md`, `docs/PLANS.md`, and `harness/*`
