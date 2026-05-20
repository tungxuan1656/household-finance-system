---
name: using-skills
description: Entry point skill. Use first to classify ceremony level, choose the minimum necessary workflow skills, and enforce verification evidence before completion.
---

# Using Skills

Use this skill first.

Its job is to choose the minimum sufficient process for the current task.

## Core Rules

- Always check whether a skill applies.
- Use the minimum sufficient ceremony level.
- Do not force Level 0 work through unnecessary workflow ceremony.
- Do not skip verification evidence before claiming completion.
- Escalate to a higher ceremony level if scope or risk grows.

## Shared Inputs

`AGENTS.md` is already read at session start.

Read more only when scope requires it:
- `ceremony-levels` for Level 0/1/2/3 classification
- `skill-maintenance` when changing `.agents/skills/**`
- `docs/PLANS.md`, `docs/exec-plans/__plan-template__.md`, `docs/exec-plans/index.md` when a plan is required
- exact `docs/references/frontend/*` or `docs/references/backend/*` leaf docs for the touched area
- exact product or design doc only when behavior or UX decisions depend on it

Avoid broad-folder reading by default.

## Decision Flow

1. Classify the task using `ceremony-levels`.
2. Identify whether a workflow skill is needed.
3. Identify whether a domain skill is needed.
4. Read only the minimum exact docs needed for this level.
5. Decide required verification depth.
6. Re-check level if scope expands.

## Workflow Selection

- Level 0: usually act directly; use a domain skill only if it clearly helps.
- Level 1: short inline plan; optionally use `test-driven-development`, `systematic-debugging`, or one domain skill.
- Level 2: usually use `writing-plans`; use `brainstorming` only if requirements or direction are still ambiguous.
- Level 3: require plan, stronger review, stronger verification, and relevant domain skills.

Use these workflow skills when they match:
- `brainstorming`: ambiguity, tradeoffs, or design choice
- `writing-plans`: Level 2/3 work or unclear sequencing
- `executing-plans`: executing an existing plan inline
- `subagent-driven-development`: large or high-risk planned work when subagents are appropriate
- `systematic-debugging`: bug, failure, or unexpected behavior
- `test-driven-development`: feature or bugfix where a failing test should lead
- `requesting-code-review`: review checkpoint for Level 2/3 or risky Level 1 work
- `receiving-code-review`: implement or challenge review feedback correctly
- `verification-before-completion`: always before completion claims

Use domain skills only when the domain actually matters.

## Decision Output

When useful, express the choice in this format:

```text
Skill decision:
- Ceremony level:
- Skills used:
- Skills intentionally skipped:
- Docs/files read:
- Reason:
- Verification expected:
```

## Artifact Expectations

- Level 0: usually no plan artifact; update docs or harness only if touched by the task.
- Level 1: short inline plan is enough unless scope expands.
- Level 2/3: update required harness artifacts and progress records.

## Forbidden Behavior

- Do not say a skill is required just because it exists.
- Do not read whole doc trees when one exact leaf doc is enough.
- Do not claim completion without fresh verification evidence.
