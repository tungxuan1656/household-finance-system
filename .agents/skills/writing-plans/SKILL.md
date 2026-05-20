---
name: writing-plans
description: Use for Level 2 or Level 3 work, or when sequencing is unclear. Write or update an ExecPlan that fits the harness and exact task scope.
argument-hint: 'Describe feature goal, scope (frontend/backend/fullstack), constraints, and expected verification artifacts.'
---

# Writing Plans

Create or update an implementation-ready ExecPlan only when the task needs that level of ceremony.

## Relationship to Initial Thinking and Brainstorming

`writing-plans` starts after the task direction is sufficiently clear.

It may follow:
- direct initial triage from `using-skills`
- a formal `brainstorming` pass

Do not require brainstorming before every plan.

Require brainstorming first only when the plan would otherwise encode unresolved ambiguity, unchosen tradeoffs, or unclear acceptance criteria.

This skill governs full ExecPlans, not planning in general.
All tasks still need some planning artifact before execution:
- tiny direct-task note for true one-shot work
- explicit inline plan for normal Level 1 multi-step work
- full ExecPlan for the cases covered by this skill

Normal inline-plan work should stay inline. Do not invoke `writing-plans` just to satisfy the idea that every task needs a plan.

## When to Write a Plan

Use this skill for:
- Level 2 planned feature work
- Level 3 high-risk work
- existing plans that need tightening before execution
- tasks with unclear sequencing, acceptance criteria, or multi-stage verification
- tasks with multiple implementation steps
- tasks spanning multiple files, layers, or domains
- tasks that need progress tracking in harness artifacts

Do not use this skill for:
- Level 0 direct tasks
- most Level 1 small changes
- generic brainstorming with no implementation intent

Do not create a full ExecPlan for Level 0 direct tasks.

For Level 1 tasks, prefer a brief inline plan unless risk or ambiguity is discovered.
Do not treat "small" as permission to skip planning entirely.
Also do not treat "needs a plan" as permission to over-escalate normal Level 1 work into a full ExecPlan.

For Level 1, a short inline plan is enough:

```text
Inline plan:
1. Inspect affected file and relevant reference.
2. Make scoped change.
3. Run targeted verification.
4. Report result.
```

If the task includes several meaningful steps such as reading docs, comparing patterns, extracting a helper, updating a page, and running focused verification, it should usually show an inline plan even if it still does not deserve a full ExecPlan.

## Additional Reading

AGENTS.md is read at session start. For plan writing, also read:
- `docs/PLANS.md` — plan lifecycle and execution policy
- `docs/exec-plans/__plan-template__.md` — canonical ExecPlan template
- `docs/exec-plans/index.md` — current plan status
- `harness/feature_index.json` — current feature status
- Related `harness/features/*.json` — feature dependencies and evidence
- `harness/progress.md` — recent session history
- `harness/session-handoff.md` — if work spans sessions

Read scope-specific reference docs based on what the plan touches:
- Frontend: relevant `docs/references/frontend/*` (see Scope-Driven Standards Matrix below)
- Backend: relevant `docs/references/backend/*` (see Scope-Driven Standards Matrix below)
- Shared: `docs/references/shared/type-naming-pattern.md`

## Mandatory Inputs

Collect or infer the following before drafting:
- User-visible outcome (what behavior changes and how to verify it).
- Scope boundaries (in-scope and out-of-scope).
- Target domain: `frontend`, `backend`, `shared`, `fullstack`, or `tooling/docs`.
- Risks or constraints (security, rollout, data migration, compatibility).

If the scope is unclear, ask concise clarifying questions before writing the plan.

## Plan Lifecycle Requirements

- Save plans to `docs/exec-plans/plans/YYYY-MM-DD-<feature-name>.md`.
- Active and completed plan files stay in `docs/exec-plans/plans/` (no file moves across status folders).
- Plan status must be tracked in `docs/exec-plans/index.md` under `Active` and `Completed` sections.
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

When useful, note companion skills that should be used during implementation:
- `test-driven-development` for behavior changes
- `systematic-debugging` for bugs or failures
- `requesting-code-review` for Level 2 or Level 3 review checkpoints
- `verification-before-completion` before completion claims
- `subagent-driven-development` only when the work is large enough, parallelizable enough, or explicitly requested
- `executing-plans` when execution will stay inline in the current session

Add a dedicated research or domain-review step only when the task actually needs it.

If uncertainty is high, include a dedicated research step in the plan before implementation.

## Plan Authoring Workflow

Follow this sequence strictly.

1. **Define purpose and user-observable behavior.**
2. **Lock scope** — explicitly list in-scope and out-of-scope items.
3. **Build a scope map:**
   - Files and modules expected to change.
   - Layer impact using `Types -> Config -> Repo -> Service -> Runtime -> UI` from `ARCHITECTURE.md`.
   - Hard dependency checks from `ARCHITECTURE.md`:
     - Lower layers do not depend on higher layers.
     - UI does not bypass runtime/service contracts.
     - Data access enters through repository or explicit adapter boundaries.
   - If new dependencies are introduced, include explicit justification in the plan.
4. **Add standards enforcement section:**
   - List required references from the scope-driven matrix.
   - Convert each selected reference into concrete coding constraints.
5. **Write implementation narrative:**
   - File-by-file planned edits.
   - Data flow and interface contracts.
6. **Add concrete commands** with working directory and expected short outputs.
   - Include targeted verification and final broader verification appropriate to the task level.
7. **Add validation matrix:**
   - Happy path.
   - Validation/error paths.
   - Unauthorized/forbidden when relevant.
   - Regression checks for fixed bugs.
8. **Add idempotence and recovery:**
   - Re-run safety.
   - Backup/rollback for risky operations.
9. **Add harness integration:**
   - Required updates for `harness/feature_index.json`, `harness/features/*.json`, and `harness/progress.md`.
10. **Add decision log placeholders and progress checklist** suitable for multi-session execution.
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

## Ambiguity Handling

If any of these are missing, ask before finalizing:
- Exact user-visible behavior.
- Ownership boundary between frontend/backend.
- Data migration or backward-compatibility constraints.
- Security/privacy sensitivity level.

Use minimal, high-signal questions and continue once answered.

## Writing Rules

- Use exact file paths always.
- Do not use placeholders like `TBD`, `TODO`, or `fill in later`.
- If a step changes code, show the actual code or command the engineer should use.
- Keep tasks bite-sized: one action, usually 2-5 minutes.
- Prefer test-first steps for behavior changes.
- Keep every plan self-contained so it can be executed without the original conversation.
- Remove or split any step that covers multiple independent subsystems.

## Self-Review

After writing the complete plan, review it against the spec and the harness rules yourself:

1. **Spec coverage**: can you point to a task for each requirement?
2. **Placeholder scan**: remove any incomplete sections, vague requirements, or missing commands.
3. **Type and name consistency**: do all file paths, function names, and commands match across tasks?
4. **Harness alignment**: does the plan update the required harness artifacts and respect repo layering?
5. **Verification readiness**: is there a concrete acceptance artifact and a clear verification path?

If you find issues, fix them inline. If a requirement has no task, add the task.

## Execution Handoff

After saving the plan, recommend the execution mode that matches the actual work:
- small or moderate plan in current session: `executing-plans`
- large, parallelizable, or high-risk plan: candidate for `subagent-driven-development`

Do not force subagent execution by default in this phase.

## Quick Prompt Examples

- "Create an ExecPlan for adding recurring expense reminder API + UI flow."
- "Plan a backend-only feature for household invitation token validation."
- "Plan a frontend-only budget form refactor with accessibility and i18n updates."
