---
name: tma-development
description: Build and maintain this repo's Telegram Mini App (TMA) client. Use when tasks mention `apps/tma`, Telegram Mini Apps/TMA, launch-context auth, `@tma.js/sdk-react`, `BackButton`/`BottomButton`, `startapp`/`startattach` deep links, safe-area or keyboard hardening, or bot companion flows tied to the Mini App.
---

# TMA Development

Use this skill for repo-specific Telegram Mini App work. It keeps terminology, package choice, session model, and doc routing aligned with this repo.

## When to use

- Any task touching `apps/tma`
- Any request mentioning Telegram Mini Apps, TMA, launch context, `BackButton`, `BottomButton`, haptics, `startapp`, `startattach`, safe areas, fullscreen, or keyboard overlap
- TMA auth, session, deep-link, or bot-boundary planning
- TMA docs, scaffold, or hardening work

## When not to use

- `apps/web` work with no TMA impact
- Worker changes unrelated to TMA
- Generic Telegram bot chat automation that does not launch or support the Mini App

## First steps

1. Normalize wording: interpret any old Telegram Mini App terminology as TMA.
2. Read `docs/TMA.md`.
3. Read only the exact leaf docs needed under `docs/references/frontend/tma/*`.
4. If the task is scaffold/bootstrap work, read `docs/exec-plans/plans/2026-06-02-telegram-mini-app-runtime-scaffold.md`.
5. If the task touches auth or worker boundaries, also read `docs/product-specs/shared/authentication-session.md`, `docs/product-specs/tma/launch-and-auth.md`, and `docs/references/frontend/tma/auth-and-bot-pattern.md`.

## Locked defaults

- Use `apps/tma`, never the old app path.
- Use `@tma.js/sdk-react` as the primary React-facing package.
- Do not introduce alternate Telegram Mini App package families into the repo.
- Cold-open auth exchanges Telegram launch context with the worker on each supported open.
- Keep the access token memory-only. Persist the refresh token in `SecureStorage` only when supported; otherwise keep the session memory-only.
- Default bot companion shape is worker-first behind an explicit adapter boundary.

Read `references/locked-defaults.md` when package, session, or bot decisions matter.

## Task map

- Scaffold/bootstrap: read `references/task-map.md` section `feat-079`.
- Auth/session: read `references/task-map.md` section `feat-080`.
- Expense flow, invite flow, read surfaces, hardening, and bot companion: read the matching `feat-08x` section there before planning or coding.

## Repo workflow

- Before editing functions, classes, or methods, run the required GitNexus impact checks from `AGENTS.md`.
- Keep TMA code separate from `apps/web`; do not import web UI or feature code into `apps/tma`.
- Use SPA routing only; `window.location` route changes are a bug for TMA flows.
- Update harness records and `harness/progress.md` when the session changes repo truth.
- Use `verification-before-completion` before any done or ready claim.

## Forbidden behavior

- Do not reintroduce old terminology, old paths, or alternate Telegram Mini App package families.
- Do not persist auth tokens in `DeviceStorage` or `localStorage`.
- Do not bypass the shared worker auth/session lifecycle.
- Do not broaden docs reading to whole trees when `docs/TMA.md` already routes exact leaves.
- Do not treat bot chat as the primary CRUD UI.

## Output format

When useful, summarize TMA work in this compact form:

```text
TMA check:
- Slice:
- Docs read:
- Defaults preserved:
- Open decision:
- Verification:
```

## Verification expectations

- Docs-only: validate touched JSON or harness files, run `./scripts/check_harness_size.sh`, `git diff --check`, and final `gitnexus_detect_changes`.
- Runtime code: use `./init.sh <param>` for scoped checks and full `./init.sh` only when repo rules require it.

## Related skills

- `using-skills`
- `grill-with-docs`
- `writing-plans`
- `skill-maintenance`
- `verification-before-completion`
