---
name: to-issues
description: Break an approved plan or spec into thin vertical slices for execution, issue creation, or batch sequencing without forcing a GitHub-only workflow.
---

# To Issues

Use this skill after a plan exists and the next problem is execution granularity.

## When to Use

- an approved ExecPlan is still too large to execute safely in one pass
- the user wants a feature broken into issue-ready or session-ready slices
- a plan needs AFK versus HITL separation
- a large feature needs visible dependency order before implementation starts

## When Not to Use

- there is no plan, spec, or scoped feature yet
- the work already fits one narrow session
- the "slices" would just be horizontal layers like UI first, backend later

## Required Reading

Read the source artifact first:
- current ExecPlan in `docs/exec-plans/plans/*.md`
- exact product spec or design doc if that is the source of truth
- related `harness/features/*.json` when continuing an existing feature

Read code only when you need to verify feasibility or dependency order.

## Core Rule

Slices must be vertical.

Each slice should cut through whatever layers are needed to produce a demoable, verifiable outcome. Do not split the work into backend-only, UI-only, or test-only tickets unless the source task is genuinely layer-local.

## Process

1. Identify the source plan or spec.
2. List the user-visible outcomes that the source artifact promises.
3. Break those outcomes into the thinnest practical AFK or HITL slices.
4. Note dependency order and blockers.
5. Check whether each slice can fit one session or one tightly scoped implementation batch.
6. Present the proposed breakdown for approval before publishing or persisting it.

## Output Contract

Use this structure:

```text
Slice breakdown:
1. Title:
   Type: AFK | HITL
   Outcome:
   Blocked by:
   Verification:
```

Keep the list numbered and dependency-aware.

## Publishing Rule

Default behavior in this repo:
- draft the slice list in-session first
- only publish to a real issue tracker if the user explicitly asks and tooling is available
- otherwise treat the approved slice list as execution guidance for the current ExecPlan, `harness/session-handoff.md`, or the next focused session

Do not silently invent a GitHub-only workflow if the user did not ask for issue creation.

## Forbidden Behavior

- Do not produce horizontal slices.
- Do not make slices so large that they hide risk.
- Do not publish issues without user approval.
- Do not duplicate full plan prose into every slice.

## Verification Expectations

- Re-read the source plan after slicing and confirm every promised behavior is covered by at least one slice.
- If you persist the slices into a plan or handoff artifact, re-read that artifact after writing.

## Related Skills

- `writing-plans` before slicing
- `triage` when the source work begins as an issue instead of a plan
- `handoff` when the slice list becomes restart guidance for a later session
