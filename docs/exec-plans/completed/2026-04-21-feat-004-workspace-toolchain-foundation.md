# feat-004: Workspace Tooling Without Centralizing App Dependencies

## Summary
Make the repository act like one workspace from the root while keeping dependency ownership inside each app package. The root should provide the canonical install, lint, typecheck, test, and build entry points, but it should not become a shared dependency bucket that forces future stacks like Flutter or a landing page into the web/worker toolchain.

## Key Changes
- Keep `pnpm-workspace.yaml` as the workspace boundary and leave app dependencies in each app `package.json`.
- Keep TypeScript config app-owned so each app can define its own compiler settings without depending on a shared base file.
- Keep app-specific config where it is genuinely required:
  - `apps/web` keeps Vite and frontend-specific TypeScript settings.
  - `apps/worker` keeps Cloudflare Worker and Vitest-specific settings.
- Add root `test` and `build` scripts so `init.sh` can verify the repo from one entry point.
- Keep `init.sh` as the one-command verification path and make it call the root scripts.

## Scope
- In scope: root `package.json`, `init.sh`, and the app tsconfig files needed to keep each app self-contained.
- In scope: harness bookkeeping in `harness/feature_index.json`, `harness/features/feat-004.json`, and `harness/progress.md`.
- Out of scope: moving dependencies into a shared package, app feature work, backend/data changes, and UI changes.

## Test Plan
- Run `./init.sh`.
- Run `pnpm run lint`.
- Run `pnpm run typecheck`.
- Run `pnpm run test`.
- Run `pnpm run build`.
- Confirm `pnpm --filter web test` and `pnpm --filter worker test` still work independently.

## Assumptions
- Shared tooling should coordinate the workspace, not force one dependency graph or shared config base across every future app.
- The root `build` target remains frontend-only until the worker has a concrete build artifact to produce.
- App-local manifests remain the source of truth for runtime and dev dependencies.
