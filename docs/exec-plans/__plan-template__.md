# ExecPlan Template

This document is a self-contained Execution Plan ("ExecPlan") template to guide implementations of medium-to-large changes in a repository. It is intended for humans and agent-based contributors. Fill in the sections below and keep the plan "living" by updating Progress, Decision Log, and Surprises as you work.

---

## Title

Short, action-oriented title (one line).

## Purpose / Big Picture

Explain in 2–4 sentences what this change enables for end users and how they will observe it working. State the user-visible behaviour you will enable.

## Scope

- Files, modules, and areas that will be changed (list repo-relative paths).
- What is explicitly out of scope.

## Non-negotiable Requirements

- The plan must be self-contained (include definitions and commands needed to complete it).
- The plan must produce observable behaviour or tests demonstrating success.
- Every technical term must be defined in-place.

## Progress

- Use a checkbox list; update after each stopping point and include timestamps where useful.

- [ ] Example: Create route `GET /health` (in-progress)
- [ ] Example: Add integration test `apps/worker/test/health.test.ts`

## Surprises & Discoveries

- Keep short observations discovered while implementing with evidence (logs or test output).

## Decision Log

- Decision: …
  Rationale: …
  Date/Author: …

## Outcomes & Retrospective

- Summarize final outcomes, gaps, and lessons learned once finished.

## Context and Orientation

- Brief orientation for a reader with no prior context. Name key files and their purpose with repo-relative paths.

Example:
- Worker routes: `apps/worker/src/routes/*`
- Tests: `apps/worker/test/*`

## Plan of Work (Narrative)

- Describe, in prose, the sequence of edits and additions. For each edit, name the file and location and what will be inserted or changed.

## Concrete Steps (Commands)

- Show exact commands to run, and the working directory for each. Provide expected short transcript outputs the user can compare against.

Example (run from repo root):

```bash
# install & verify
./init.sh

# run worker tests
pnpm --filter @app/worker test
```

Expected transcript examples should be short and focused (e.g., `1 passed, 0 failed`).

## Validation and Acceptance

- Describe how to exercise the feature (HTTP requests, CLI commands, test names) and the exact outputs or assertions that indicate success.

Example Acceptance Criteria:
- `curl -sSf http://localhost:8787/health` returns `OK` and HTTP 200.
- `pnpm --filter @app/worker test` shows the new test passing.

## Idempotence & Recovery

- State if steps are safe to re-run. For risky steps (DB migrations, destructive ops) provide backup and rollback commands.

## Artifacts and Notes

- Include short evidence snippets, small diffs, or terminal transcripts that prove success. Keep them concise.

## Interfaces & Dependencies

- List external libraries, services, or internal modules this change depends on and why. Provide function signatures or API contracts if applicable.

## Minimal Example: Add GET /health Endpoint

Purpose: Provide a simple health endpoint for load balancers and CI checks.

Context:
- Worker entry: `apps/worker/src/index.ts`

Plan of Work:
1. Create `apps/worker/src/routes/health.ts` with a GET handler returning 200/OK.
2. Register the route in `apps/worker/src/index.ts`.
3. Add test `apps/worker/test/health.test.ts` that calls the handler or starts the worker and asserts HTTP 200 + body `OK`.
4. Run `./init.sh` and `pnpm --filter @app/worker test` to verify.

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

## Suggested file templates

feature_list.json (example):

```json
{
  "features": [
    {
      "id": "feat-001",
      "name": "Health endpoint",
      "description": "GET /health returns OK",
      "dependencies": [],
      "status": "done",
      "evidence": "apps/worker/test/health.test.ts passes"
    }
  ]
}
```

init.sh (example snippet):

```bash
#!/bin/bash
set -e
echo "Installing dependencies"
pnpm install
echo "Running tests"
pnpm -w -s test
echo "Build"
pnpm -w -s build || true
```

## Best Practices (quick)

- Start with the user-visible purpose.
- Name files and functions precisely (repo-relative paths).
- Provide exact commands and expected outputs.
- Keep the plan idempotent when possible.
- Always add a test that demonstrates the behavior.

---

Fill this template and keep the `Progress`, `Decision Log`, and `Surprises & Discoveries` sections updated as you work.
