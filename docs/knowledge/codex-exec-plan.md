# ExecPlan: Using PLANS.md for Multi-hour Problem Solving (Structured Guide)

Author: Aaron Friel

Purpose / Big Picture

This document explains how to author, maintain, and use an ExecPlan (Execution Plan) — a self-contained, living specification that enables a human or agent to implement complex, multi-hour changes in a repository. The ExecPlan defines observable outcomes, exact commands to run, files to edit, and continuous progress tracking so a novice can reproduce and verify the work.

Scope

- Audience: engineers and agent-based contributors working on multi-step features or refactors.
- Repository artifacts addressed: `AGENTS.md`, `PLANS.md` (or per-feature ExecPlan files), `harness/feature_index.json`, `harness/features/*.json`, `harness/progress.md`, and verification scripts like `init.sh`.
- Out of scope: model selection, prompt engineering, and generic architecture patterns unrelated to an ExecPlan's execution.

Non-negotiable Requirements

- Self-contained: each ExecPlan must include definitions, commands, expected outputs, and file paths required to complete the work.
- Living document: update `Progress`, `Decision Log`, and `Surprises & Discoveries` as work proceeds.
- Observable acceptance: the plan must define how to verify the result via tests, HTTP responses, CLI output, or other reproducible artifacts.

Progress

- Use an explicit checkbox list and timestamps for each stopping point. Example:
  - [ ] (2026-04-20) Create `GET /health` route in `apps/worker`.
  - [ ] (2026-04-20) Add integration test `apps/worker/test/health.test.ts`.

Surprises & Discoveries

- Record unexpected behavior encountered while implementing with short evidence snippets (error logs, failing test output). Example:
  - Observation: Router ignored GET handlers in dev server.
    Evidence: `curl` returned 404 when expected 200.

Decision Log

- Record key decisions with rationale and author/date. Example:
  - Decision: Return plain text `OK` from `/health`.
    Rationale: Minimal surface area for load balancer checks and easier test assertion.
    Date/Author: 2026-04-20 / A. Friel

Outcomes & Retrospective

- At completion, summarize outcomes, gaps, and lessons learned. Example:
  - Outcome: Health endpoint added and tested; CI includes health check in smoke tests.
  - Lessons: Ensure dev server routing matches production bindings when adding routes.

Context and Orientation

Provide a short orientation so a novice can navigate the repo and find relevant files. Example:

- Worker app source: `apps/worker/src/`
- Worker tests: `apps/worker/test/`
- Project verification script: `init.sh` at repo root
- Agent routing guidance: `AGENTS.md` at repo root

Plan of Work (Narrative)

Describe the sequence of edits and why. Keep each edit precise and minimal. Example plan to add a health endpoint:

1. Create `apps/worker/src/routes/health.ts` with a GET handler that returns HTTP 200 and body `OK`.
2. Register the route in the worker's router (`apps/worker/src/index.ts` or equivalent).
3. Add unit/integration test `apps/worker/test/health.test.ts` asserting 200 + `OK`.
4. Update `harness/features/*.json`, `harness/feature_index.json`, and `harness/progress.md` with evidence and timestamps.

Concrete Steps (Commands)

Run these from the repository root. Replace `@app/worker` filter with the package name used in this repo if different.

```bash
# Install and verify the repo
./init.sh

# Run worker tests
pnpm --filter @app/worker test

# Run a quick curl against a running dev server (if available)
curl -sSf http://localhost:8787/health
```

Expected short transcripts (examples):

```
1 passed, 0 failed

HTTP/1.1 200 OK
OK
```

Validation and Acceptance

- Acceptance criteria must be observable and executable. Examples:
  - `pnpm --filter @app/worker test` shows the new test passing.
  - `curl -sSf http://localhost:8787/health` returns `OK` with HTTP 200.

Idempotence & Recovery

- Write steps so they are safe to re-run. If any step is risky (DB migration, destructive refactor), include explicit backup and rollback instructions. Example rollback for DB migration:

```bash
# Backup
sqlite3 db.sqlite .dump > backup-$(date -u +%Y%m%dT%H%M%SZ).sql

# Rollback (restore from dump)
sqlite3 db.sqlite < backup-2026...sql
```

Artifacts and Notes

- Include minimal evidence snippets and small diffs that prove success. Keep examples short and focused.

Suggested file templates

- `harness/feature_index.json` — track feature ids, names, and high-level status.
- `harness/features/*.json` — track per-feature dependencies, evidence, and detail.
- `harness/progress.md` — session log with timestamps, actions, and blockers.
- `init.sh` — canonical repo verification script (install, typecheck, test, build).

Minimal Example: Add GET /health Endpoint

Purpose: Provide a trivial, observable health endpoint used by load balancers and CI smoke checks.

Files:
- Create: `apps/worker/src/routes/health.ts`
- Edit: `apps/worker/src/index.ts` to register route
- Create: `apps/worker/test/health.test.ts`

Plan of Work:
1. Add handler returning 200 with body `OK`.
2. Register route and ensure server starts in dev.
3. Add test that calls the handler or starts the worker and performs an HTTP request.
4. Run `./init.sh` and `pnpm --filter @app/worker test`.

Concrete Commands (repo root):

```bash
./init.sh
pnpm --filter @app/worker test
```

Expected:

```
1 passed, 0 failed

HTTP/1.1 200 OK
OK
```

Milestones and Prototyping

- Break larger work into milestones with acceptance criteria for each milestone.
- Use small prototypes (spikes) where external library behavior or approach is uncertain. Label prototypes clearly and include promotion criteria.

Formatting and Authoring Rules

- If the ExecPlan is stored as the only content in a `.md` file, the plan must be self-contained and omit additional code-fence wrapping (this file is an example full document).
- Keep the narrative prose-first; use checklists only in `Progress`.
- Define any non-obvious term in-place and list exact file paths and commands.

Best Practices (quick)

- Start with user-visible purpose.
- Name files and functions precisely (repo-relative paths).
- Provide exact commands and expected outputs.
- Keep the plan idempotent when possible.
- Always add a test that demonstrates the behavior.

Decision note

This file adapts the original Codex ExecPlan guidance into a concise, structured ExecPlan template and example that is suitable for repository use and agent execution. Update `Progress`, `Decision Log`, and `Surprises & Discoveries` as you implement changes.
```
