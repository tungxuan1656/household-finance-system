---
name: using-skills
description: Entry point for the project skill system. Use at the start of every task to perform initial thinking, classify task ceremony level, select applicable skills, and require verification evidence before completion.
---

# Using Skills

Use this skill first.

Its job is to do initial triage, then choose the minimum sufficient process for the current task.

## Think Before Selecting Skills

Every task requires initial thinking before selecting skills.

Before choosing a ceremony level or workflow skill, determine:
- what the user is actually asking for
- whether the requirement is clear or ambiguous
- whether the task changes product behavior, API contract, data shape, UX flow, security, architecture, or verification expectations
- whether there are multiple reasonable implementation approaches
- what evidence is required before claiming completion

This initial thinking is mandatory.

This initial thinking is not the same as the `brainstorming` skill.

Use `brainstorming` only when initial thinking reveals ambiguity, competing approaches, unclear acceptance criteria, or non-trivial product, design, or architecture tradeoffs.

## Role of This Skill

`using-skills` is the entrypoint for the skill system.

It is responsible for:
1. performing initial task triage
2. choosing the minimum sufficient ceremony level
3. selecting applicable workflow and domain skills
4. avoiding unnecessary ceremony for simple tasks
5. escalating to deeper skills when ambiguity or risk is detected
6. requiring verification evidence before any completion claim

This skill is not a replacement for reasoning.

It is also not a replacement for `brainstorming`.

It decides whether formal brainstorming is needed.

## Core Rules

- Always check whether a skill applies.
- Use the minimum sufficient ceremony level.
- Every task needs a visible planning mode: direct-task note, inline plan, or ExecPlan.
- Do not force Level 0 work through unnecessary workflow ceremony.
- Do not skip verification evidence before claiming completion.
- Escalate to a higher ceremony level if scope or risk grows.

## Shared Inputs

`AGENTS.md` is already read at session start.

Read more only when scope requires it:
- `ceremony-levels` for Level 0/1/2/3 classification
- `skill-maintenance` when changing `.agents/skills/**`
- `grill-with-docs` when a real task needs one clarification pass before planning
- `docs/PLANS.md`, `docs/exec-plans/__plan-template__.md`, `docs/exec-plans/index.md` when a plan is required
- exact `docs/references/frontend/*` or `docs/references/backend/*` leaf docs for the touched area
- exact product or design doc only when behavior or UX decisions depend on it

Avoid broad-folder reading by default.

## Decision Flow

1. Perform initial thinking.
2. Classify the task using `ceremony-levels`.
3. Identify whether a workflow skill is needed.
4. Identify whether a domain skill is needed.
5. Read only the minimum exact docs needed for this level.
6. Decide required verification depth.
7. Re-check level if scope expands.

## Minimum Sufficient Process

Use the lightest process that can safely satisfy the request.

Recommended default:
- Level 0: tiny direct task note + verification evidence
- Level 1: explicit inline plan + targeted verification
- Level 2: planned feature with ExecPlan or existing plan update
- Level 3: high-risk change with explicit risk review, relevant domain reviews, and stronger verification

Only truly one-shot mechanical tasks should stay at the direct-task-note level.
If the task has multiple meaningful steps such as inspect -> compare patterns -> edit -> verify, default to an explicit inline plan even when the work still stays Level 1.
That inline plan should be stated directly in-session; do not escalate normal Level 1 work into `writing-plans` or an ExecPlan unless scope or risk expands.

Do not invoke workflow skills just because they exist.

Do invoke them when the initial triage shows they are needed.

## Workflow Selection

- Level 0: usually act directly; use a domain skill only if it clearly helps.
- Level 1: state the inline plan explicitly; optionally use `test-driven-development`, `systematic-debugging`, or one domain skill.
- Level 2: usually use `writing-plans`; use `brainstorming` only if requirements or direction are still ambiguous.
- Level 3: require plan, stronger review, stronger verification, and relevant domain skills.

Use these workflow skills when they match:
- `brainstorming`: ambiguity, tradeoffs, or design choice
- `grill-with-docs`: stress-test a feature, fix, or plan against repo docs/code before writing the plan
- `writing-plans`: Level 2/3 work or unclear sequencing
- `to-issues`: approved plan needs thinner vertical slices or issue-ready breakdown
- `executing-plans`: executing an existing plan inline
- `triage`: new issue or incoming request needs classification before planning or coding
- `subagent-driven-development`: large or high-risk planned work when subagents are appropriate
- `prototype`: UX or logic is too uncertain to lock directly into production code
- `handoff`: meaningful unfinished work must be recorded into `harness/session-handoff.md`
- `improve-codebase-architecture`: periodic hotspot audit or refactor scouting
- `systematic-debugging`: bug, failure, or unexpected behavior
- `test-driven-development`: feature or bugfix where a failing test should lead
- `requesting-code-review`: review checkpoint for Level 2/3 or risky Level 1 work
- `receiving-code-review`: implement or challenge review feedback correctly
- `verification-before-completion`: always before completion claims

Use domain skills only when the domain actually matters.

## When to Escalate

Escalate from direct execution to `brainstorming`, `writing-plans`, or domain review when any of these are true:
- the work arrives as a new issue that is not yet classified
- the user request is ambiguous
- the acceptance criteria are unclear
- the task changes user-visible behavior
- the task changes API contracts
- the task changes data shape, persistence, migration, or financial calculations
- the task crosses architecture boundaries
- the task affects security, reliability, correctness, or permissions
- there are multiple reasonable implementation approaches
- the implementation path is not obvious
- the scope is probably real but still needs one repo-grounded grilling pass
- the task needs a throwaway prototype to answer a UX or logic question
- the change may require docs, specs, or harness state updates

## Decision Output

When useful, express the choice in this format:

```text
Skill decision:
- Initial read:
- Ceremony level:
- Skills used:
- Skills intentionally skipped:
- Reason:
- Verification expected:
```

## Artifact Expectations

- Level 0: tiny direct-task note is enough; update docs or harness only if touched by the task.
- Level 1: short inline plan must be stated explicitly unless the task collapses to a true one-shot action.
- Level 2/3: update required harness artifacts and progress records.

## Forbidden Behavior

- Do not say a skill is required just because it exists.
- Do not read whole doc trees when one exact leaf doc is enough.
- Do not claim completion without fresh verification evidence.
