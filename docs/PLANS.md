# PLANS.md

Plan router. Use ExecPlans for multi-step, risky, or multi-session work.

Every task still needs some planning mode before execution:

- tiny direct-task note for one-shot mechanical work
- explicit inline plan for normal small multi-step work
- ExecPlan for broader/riskier work governed by this doc

This file governs when a full ExecPlan is required. It does not replace the lighter planning modes for smaller tasks.
Inline plans live directly in the working session; they do not require `writing-plans` or an ExecPlan file.

## Planning Modes

- Tiny direct-task note: only for truly one-shot work such as create commit, create PR, or one obvious text replacement.
- Inline plan: default for Level 1 work with 2+ meaningful steps such as inspect -> refactor -> test -> report. Keep it in-session; do not escalate it into `writing-plans` or an ExecPlan unless scope/risk grows.
- ExecPlan: use the rules below when work is broad enough, risky enough, or durable enough to need a full plan artifact.

## Create Plan When

- Work spans more than one session.
- Work changes more than one subsystem.
- Verification/rollout risk is non-trivial.
- Open decisions need durable log.
- User asks for plan/spec before implementation.
- Task is no longer well-served by a visible inline plan.

## Plan Files

- Plans live in `docs/exec-plans/plans/`.
- Plan index lives in `docs/exec-plans/index.md`.
- Template lives in `docs/exec-plans/__plan-template__.md`.
- Deferred debt lives in `docs/exec-plans/tech-debt-tracker.md`.
- Active and completed plans stay in same folder. Move status in index only.

## Minimum Sections

- Objective / big picture.
- Scope and out-of-scope.
- Required standards/reference docs.
- Plan of work.
- Verification path.
- Risks/blockers.
- Progress log.
- Open decisions / decision log.

## Operating Rules

- One active plan has one current step.
- Update plan while work changes. Plan is living doc.
- Record direction-changing decisions.
- Keep plan self-contained enough for a fresh agent.
- Do not duplicate child reference docs; link exact docs needed.
- Do not skip explicit inline planning for small multi-step tasks just because a full ExecPlan is not required.
- Verification: use `./init.sh <param>` instead of `pnpm <cmd>` for install/lint/typecheck/test/build. Full `./init.sh` only final.
