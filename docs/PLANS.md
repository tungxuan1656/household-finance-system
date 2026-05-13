# PLANS.md

Plan router. Use ExecPlans for multi-step, risky, or multi-session work.

## Create Plan When

- Work spans more than one session.
- Work changes more than one subsystem.
- Verification/rollout risk is non-trivial.
- Open decisions need durable log.
- User asks for plan/spec before implementation.

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
- Verification: use `./init.sh <param>` instead of `pnpm <cmd>` for install/lint/typecheck/test/build. Full `./init.sh` only final.
