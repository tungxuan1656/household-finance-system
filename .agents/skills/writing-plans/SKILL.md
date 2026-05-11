---
name: writing-plans
description: 'Use when you have a spec or requirements for a multi-step task, before touching code. For this harness-system repo, write a self-contained ExecPlan that follows docs/exec-plans and harness state.'
argument-hint: 'Describe feature goal, scope (frontend/backend/fullstack), constraints, and expected verification artifacts.'
---

# Writing Plans

Create a high-quality, implementation-ready ExecPlan for an engineer with zero project context and uneven taste. Minimize ambiguity, make delivery repeatable, and keep the plan usable by both humans and coding agents.

## When To Use

Use this skill when you need to:
- Create a new execution plan in `docs/exec-plans/plans/`.
- Rewrite or tighten an existing plan before implementation.
- Ensure a plan is fully aligned with harness workflow and quality gates.
- Force scope-based standards and pattern selection before coding starts.

Do not use this skill for:
- One-off tiny edits that do not need a plan.
- Generic brainstorming without concrete implementation intent.

## Mandatory Inputs

Collect or infer the following before drafting:
- User-visible outcome (what behavior changes and how to verify it).
- Scope boundaries (in-scope and out-of-scope).
- Target domain: `frontend`, `backend`, `shared`, `fullstack`, or `tooling/docs`.
- Risks or constraints (security, rollout, data migration, compatibility).

If the scope is unclear, ask concise clarifying questions before writing the plan.

## Required Source Documents

Read these before writing:
- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/PLANS.md`
- `docs/exec-plans/__plan-template__.md`
- `docs/exec-plans/index.md`
- `docs/references/index.md`
- `docs/FRONTEND.md` when scope includes frontend
- `docs/BACKEND.md` when scope includes backend

Also check harness state for continuity:
- `harness/feature_index.json`
- Related `harness/features/*.json`
- `harness/progress.md`
- `harness/session-handoff.md` when the work spans sessions

## Plan Lifecycle Requirements

- Save plans to `docs/exec-plans/plans/YYYY-MM-DD-<feature-name>.md`.
- Active and completed plan files stay in `docs/exec-plans/plans/`.
- Plan status must be tracked in `docs/exec-plans/index.md` under `Active` and `Completed`.
- Deferred items must be logged in `docs/exec-plans/tech-debt-tracker.md`.

## Scope-Driven Standards Matrix

After identifying scope, require these references in the plan:

### Frontend Scope

Must apply:
- `docs/references/frontend/project-folder-structure.md`
- `docs/references/frontend/component-structure-pattern.md`
- `docs/references/frontend/naming-and-conventions-pattern.md`
- `docs/references/frontend/form-pattern.md` (if forms are involved)
- `docs/references/frontend/dialog-and-form-pattern.md` (if dialog/form flows exist)
- `docs/references/frontend/api-react-query-pattern.md` (if API hooks/queries are touched)
- `docs/references/frontend/zustand-store-pattern.md` (if state stores are touched)
- `docs/references/frontend/i18n-label-pattern.md` (if new labels/copy are added)

### Backend Scope

Must apply:
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/error-handling-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/backend/database-pattern.md` (if D1/SQL/data model changes are involved)
- `docs/references/backend/cloudflare-workers.md` (if worker runtime/config/deploy is touched)

### Shared Scope

Must apply:
- `docs/references/shared/type-naming-pattern.md`

### Fullstack Scope

Must combine all required frontend + backend + shared references relevant to touched areas.

## Companion Skills To Note In The Plan

When creating the plan, explicitly note companion skills that should be used during implementation:
- `superpowers:test-driven-development` for new features, bug fixes, and refactoring with behavior changes.
- `superpowers:systematic-debugging` for bugs, failures, or unexpected behavior.
- `superpowers:requesting-code-review` before merge or after major features.
- `superpowers:verification-before-completion` before claiming completion.
- `superpowers:subagent-driven-development` when tasks can be split and executed in the same session.
- `superpowers:executing-plans` when the plan will be executed in a separate session.
- Add a dedicated research step when framework/library/API behavior or version specifics are uncertain.
- Add domain-specific review steps in the plan when frontend, backend, data, or security constraints need explicit verification.

If uncertainty is high, include a dedicated research step in the plan before implementation.

## Plan Authoring Workflow

Follow this sequence strictly.

1. Define purpose and user-observable behavior.
2. Lock scope and explicitly list out-of-scope items.
3. Build a scope map:
   - Files and modules expected to change.
   - Layer impact using `Types -> Config -> Repo -> Service -> Runtime -> UI` from `ARCHITECTURE.md`.
   - Hard dependency checks from `ARCHITECTURE.md`:
     - Lower layers do not depend on higher layers.
     - UI does not bypass runtime/service contracts.
     - Data access enters through repository or explicit adapter boundaries.
   - If new dependencies are introduced, include explicit justification in the plan.
4. Add standards enforcement section:
   - List required references from the scope-driven matrix.
   - Convert each selected reference into concrete coding constraints.
5. Write implementation narrative:
   - File-by-file planned edits.
   - Data flow and interface contracts.
6. Add concrete commands with working directory and expected short outputs.
   - Include `./init.sh` baseline verification from repo root unless not applicable, and explain why if it is not.
7. Add validation matrix:
   - Happy path.
   - Validation/error paths.
   - Unauthorized/forbidden when relevant.
   - Regression checks for fixed bugs.
8. Add idempotence and recovery:
   - Re-run safety.
   - Backup/rollback for risky operations.
9. Add harness integration:
   - Required updates for `harness/feature_index.json`, `harness/features/*.json`, `harness/progress.md`, and `harness/session-handoff.md` when applicable.
10. Add decision log placeholders and progress checklist suitable for multi-session execution.
   - Enforce one clearly owned current step with owner and status.

## Output Contract

A plan is complete only if all checks pass:
- Uses the section structure from `docs/exec-plans/__plan-template__.md`.
- Is self-contained: no hidden assumptions.
- Includes explicit verification commands and expected outputs.
- Includes scope-based standards and coding notes from `docs/references`.
- Includes required harness updates and evidence expectations.
- Provides at least one concrete acceptance artifact (test, curl response, build transcript, or equivalent).
- Includes all minimum sections required by `docs/PLANS.md`:
  - objective
  - scope and out-of-scope
  - verification path
  - risks and blockers
  - progress log
  - open decisions

## Writing Rules

- Use exact file paths always.
- Write for a reader who has no context beyond the plan itself.
- Do not use placeholders like `TBD`, `TODO`, or `fill in later`.
- If a step changes code, show the actual code or command the engineer should use.
- Keep tasks bite-sized: one action, usually 2-5 minutes.
- Prefer test-first steps for behavior changes.
- Prefer frequent, reviewable commits when the work spans multiple tasks.
- Keep every plan self-contained so it can be executed without the original conversation.
- Remove or split any step that covers multiple independent subsystems.

## Self-Review

After writing the complete plan, review it against the spec and the harness rules yourself:

1. Spec coverage: can you point to a task for each requirement?
2. Placeholder scan: remove any incomplete sections, vague requirements, or missing commands.
3. Type and name consistency: do all file paths, function names, and commands match across tasks?
4. Harness alignment: does the plan update the required harness artifacts and respect repo layering?
5. Verification readiness: is there a concrete acceptance artifact and a clear verification path?

If you find issues, fix them inline. If a requirement has no task, add the task.

## Execution Handoff

After saving the plan, offer execution choice:

"Plan complete and saved to `docs/exec-plans/plans/<filename>.md`. Two execution options:

1. Subagent-Driven (recommended) - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?"

If Subagent-Driven is chosen:
- Use `superpowers:subagent-driven-development`.
- Fresh subagent per task plus two-stage review.

If Inline Execution is chosen:
- Use `superpowers:executing-plans`.
- Batch execution with checkpoints for review.

## Quick Prompt Examples

- "Create an ExecPlan for adding recurring expense reminder API + UI flow."
- "Plan a backend-only feature for household invitation token validation."
- "Plan a frontend-only budget form refactor with accessibility and i18n updates."
