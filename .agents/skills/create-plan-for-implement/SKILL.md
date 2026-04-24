---
name: create-plan-for-implement
description: 'Create a production-ready execution plan for implementation work in this repository. Use when you need to write an ExecPlan that is self-contained, scope-driven, aligned with AGENTS.md and ARCHITECTURE.md, and enforces required standards from docs/references for frontend, backend, and shared types.'
argument-hint: 'Describe feature goal, scope (frontend/backend/fullstack), constraints, and expected verification artifacts.'
---

# Create Plan For Implement

Create a high-quality, implementation-ready ExecPlan that minimizes ambiguity and makes delivery repeatable for both humans and coding agents.

## When To Use

Use this skill when you need to:
- Create a new execution plan in `docs/exec-plans/plans/`.
- Rewrite or tighten an existing plan before implementation.
- Ensure a plan is fully aligned with harness workflow and quality gates.
- Force scope-based standards and pattern selection before coding starts.

Plan lifecycle requirements:
- Active and completed plan files stay in `docs/exec-plans/plans/` (no file moves across status folders).
- Plan status must be tracked in `docs/exec-plans/index.md` under `Active` and `Completed` sections.
- Deferred items must be logged in `docs/exec-plans/tech-debt-tracker.md`.

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
- `docs/knowledge/harness-engineering.md`
- `docs/knowledge/codex-exec-plan.md`
- `docs/references/index.md`
- `docs/FRONTEND.md` when scope includes frontend
- `docs/BACKEND.md` when scope includes backend

Also check harness state for continuity:
- `harness/feature_index.json`
- Related `harness/features/*.json`
- `harness/progress.md`

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

## Skill Selection By Task Type

When creating the plan, explicitly note companion skills that should be used during implementation:
- `tdd-workflow`: for new features, bug fixes, and refactoring with tests-first flow.
- `security-review`: whenever auth, user input, API endpoints, data access, or secrets are involved.
- `documentation-lookup`: when behavior depends on framework/library APIs or version specifics.
- `frontend-patterns`: for React/Vite UI architecture decisions.
- `backend-patterns`: for route/handler/repo boundaries and API behavior.
- `verification-loop`: for iterative verification and acceptance evidence.

If uncertainty is high, include a dedicated research step in the plan before implementation.

## Plan Authoring Workflow

Follow this sequence strictly.

1. Define Purpose and user-observable behavior.
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
   - Include `./init.sh` baseline verification from repo root unless not applicable (and state why).
7. Add validation matrix:
   - Happy path.
   - Validation/error paths.
   - Unauthorized/forbidden when relevant.
   - Regression checks for fixed bugs.
8. Add idempotence and recovery:
   - Re-run safety.
   - Backup/rollback for risky operations.
9. Add harness integration:
   - Required updates for `harness/feature_index.json`, `harness/features/*.json`, and `harness/progress.md`.
10. Add decision log placeholders and progress checklist suitable for multi-session execution.
   - Enforce one clearly owned current step with owner and status.

## Output Contract (Plan Quality Gates)

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

## Ambiguity Handling

If any of these are missing, ask before finalizing:
- Exact user-visible behavior.
- Ownership boundary between frontend/backend.
- Data migration or backward-compatibility constraints.
- Security/privacy sensitivity level.

Use minimal, high-signal questions and continue once answered.

## Suggested Plan Notes Section (Insert Into ExecPlan)

Add a short "Implementation Notes" subsection in the plan with:
- Scope-specific patterns that are mandatory.
- Skill recommendations for the implementation phase.
- Common pitfalls to avoid for this scope.

## Quick Prompt Examples

- "Create an ExecPlan for adding recurring expense reminder API + UI flow."
- "Plan a backend-only feature for household invitation token validation."
- "Plan a frontend-only budget form refactor with accessibility and i18n updates."
