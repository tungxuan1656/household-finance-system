# PLANS.md

This file defines how execution plans are created, updated, completed, and
archived.

## When A Plan Is Required

Create an execution plan when work:

- spans more than one session
- changes more than one subsystem
- has non-trivial verification or rollout risk
- depends on open decisions that should be logged

## Plan Locations

- `docs/exec-plans/plans/`: all execution plans (active + completed) in one folder
- `docs/exec-plans/index.md`: single index with two sections (`Active` and `Completed`)
- `docs/exec-plans/__plan-template__.md`: canonical ExecPlan template
- `docs/exec-plans/tech-debt-tracker.md`: deferred work and follow-ups

## Minimum Plan Sections

- objective
- scope and out-of-scope
- verification path
- risks and blockers
- progress log
- open decisions

## Operating Rules

- One active plan should have one clearly owned current step.
- Update the plan as work progresses; do not treat it as static prose.
- If a decision changes implementation direction, record it in the plan.
- Keep plan files in `docs/exec-plans/plans/` and update status placement in `docs/exec-plans/index.md` instead of moving files between folders.
