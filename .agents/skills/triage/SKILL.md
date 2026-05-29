---
name: triage
description: Intake and classify new issues, decide whether they need more info, grilling, a plan, or direct execution, and keep the result compatible with this repo's harness workflow.
---

# Triage

Use this skill when new work arrives through an issue, report, or feature request and the repo needs a disciplined next step.

## When to Use

- a new GitHub issue or bug report arrives
- the user pastes a request and asks whether it is ready to implement
- an incoming task needs classification before planning or coding

## When Not to Use

- the task is already attached to an approved ExecPlan
- the request is already fully scoped and the user is explicitly asking to implement it now

## Required Reading

Read only what the intake needs:
- issue text, screenshots, logs, links, or user report
- exact product spec or design doc if behavior truth matters
- exact frontend/backend references if feasibility depends on layer rules
- relevant `harness/features/*.json` if the issue is clearly part of an existing feature

For bugs, also inspect the relevant code path before recommending state.

## Triage States

Recommend one state:
- `needs-info` — reporter or stakeholder input is still missing
- `ready-for-grill` — scope exists, but terminology or edge cases still need a guided clarification pass
- `ready-for-plan` — direction is clear enough for `writing-plans`
- `ready-for-agent` — a plan and slice already exist; work can execute
- `ready-for-human` — work needs human access, judgment, or external coordination
- `wontfix` — not worth actioning under current product direction

Use category labels in prose when useful:
- `bug`
- `enhancement`
- `question`

If the real issue tracker labels are unknown, keep the recommendation textual instead of inventing labels.

## Process

1. Summarize the request in repo language.
2. Classify it as `bug`, `enhancement`, or `question`.
3. For bugs, try to reproduce or at least trace the likely code path.
4. Check whether existing specs or design docs already answer the request.
5. Recommend the next state and explain why.
6. Route to the next workflow skill:
   - `needs-info` -> concise follow-up questions
   - `ready-for-grill` -> `grill-with-docs`
   - `ready-for-plan` -> `writing-plans`
   - `ready-for-agent` -> direct execution or `executing-plans`

## Output Contract

Use this structure:

```text
Triage result:
- Category:
- Recommended state:
- What is already clear:
- What is missing:
- Relevant docs/code:
- Next skill:
```

## Artifact Rule

If you persist triage, keep it in the smallest useful home:
- issue comment or tracker note when issue tooling is in play
- ExecPlan discovery or decision log when triage changes planned work
- `harness/session-handoff.md` only when the session stops before the next step begins

## Forbidden Behavior

- Do not mark work `ready-for-agent` if no plan or clear slice exists.
- Do not ask for more info if the repo can answer the question by inspection.
- Do not skip reproduction attempts for meaningful bug reports.
- Do not collapse product, design, and architecture uncertainty into a fake green light.

## Verification Expectations

- Re-read the issue summary or triage note after writing.
- If triage updates docs or plans, verify those artifacts directly and then include them in final repo verification evidence.

## Related Skills

- `grill-with-docs` for scoped clarification
- `writing-plans` for Level 2/3 work
- `systematic-debugging` when the issue is a real bug investigation
