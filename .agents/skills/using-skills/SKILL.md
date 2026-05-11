---
name: using-skills
description: 'Entry point skill. Load at the start of every conversation to determine which workflow skill to use. Routes tasks to the correct skill based on task type and specifies minimal reading requirements.'
---

# Using Skills

Entry point for every conversation. Determines which workflow skill applies and what to read.

## First: Read AGENTS.md

Every session starts by reading `AGENTS.md`. It contains the project context, session rules, required artifacts, definition of done, and verification commands.

Follow its Quick Start section. Do NOT re-read documents that AGENTS.md already summarizes.

## Reading Requirements

Not every document needs to be read every session. Follow this matrix — read only what the current task requires:

| When | Read |
|------|------|
| Every session | `AGENTS.md` |
| Starting feature work | `ARCHITECTURE.md`, `harness/feature_index.json`, relevant `harness/features/*.json` |
| Creating a plan | `docs/PLANS.md`, `docs/exec-plans/__plan-template__.md`, `docs/exec-plans/index.md` |
| Frontend implementation | `docs/FRONTEND.md`, relevant `docs/references/frontend/*` |
| Backend implementation | `docs/BACKEND.md`, relevant `docs/references/backend/*` |
| Fullstack implementation | Both frontend and backend references |
| Debugging | `harness/progress.md` (recent changes) |
| Before claiming done | Run `./init.sh` |

**Do NOT read unless specifically needed:**

- `docs/knowledge/*` — only for project init/setup, not daily work
- `docs/QUALITY_SCORE.md` — only for quality audits
- `docs/RELIABILITY.md` — only for reliability work
- `docs/SECURITY.md` — only for security-sensitive changes
- `docs/DESIGN.md` and `docs/design-docs/*` — only when making design decisions

## Skill Routing

Match your task to the correct skill:

| Task Type | Skill | When |
|-----------|-------|------|
| New feature, creative work, modifying behavior | `brainstorming` | Before any implementation |
| Have a spec or requirements for multi-step task | `writing-plans` | Before touching code |
| Have a written plan, executing with subagents | `subagent-driven-development` | Plan exists, same session |
| Have a written plan, executing in separate session | `executing-plans` | Plan exists, separate session |
| Bug, test failure, unexpected behavior | `systematic-debugging` | Before proposing fixes |
| Implementing feature, bugfix, refactoring | `test-driven-development` | Before writing production code |
| About to claim work is complete | `verification-before-completion` | Before ANY completion claim |
| After completing task or before merge | `requesting-code-review` | After implementation |
| Received code review feedback | `receiving-code-review` | When review arrives |
| 2+ independent tasks or failures | `dispatching-parallel-agents` | Multiple independent problems |
| Building or improving agent harness | `harness-creator` | Harness setup/improvement |

## Decision Flow

```
User message received
    |
    v
Simple, one-shot task? ──YES──> Do directly, no skill needed
    |
    NO
    v
Creative/new feature work? ──YES──> brainstorming → writing-plans → execute
    |
    NO
    v
Bug/failure/unexpected? ──YES──> systematic-debugging → TDD for fix
    |
    NO
    v
Plan already exists? ──YES──> subagent-driven-development OR executing-plans
    |
    NO
    v
About to claim done? ──YES──> verification-before-completion
    |
    NO
    v
Need code review? ──YES──> requesting-code-review
    |
    NO
    v
Received review feedback? ──YES──> receiving-code-review
    |
    NO
    v
Multiple independent problems? ──YES──> dispatching-parallel-agents
    |
    NO
    v
Any skill applies with even 1% chance? ──YES──> Load that skill
    |
    NO
    v
Do directly
```

## Skill Priority

When multiple skills could apply:

1. **Process skills first** (brainstorming, debugging) — these determine HOW to approach the task
2. **Implementation skills second** (TDD, verification) — these guide execution

Example: "Let's build X" → brainstorming first, then implementation skills.
Example: "Fix this bug" → systematic-debugging first, then TDD.

## Skill Types

**Rigid** (TDD, debugging, verification): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns, brainstorming): Adapt principles to context.

The skill itself tells you which type it is.

## Rules

- If a skill applies, you MUST use it. No exceptions.
- User instructions always override skills.
- If unsure, ask a targeted question before proceeding.
- Do not skip skills because the task seems "too simple."

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is too simple for a skill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "I remember this skill" | Skills evolve. Read current version. |
| "The skill is overkill" | Discipline prevents mistakes. Use it. |
| "I can skip verification this time" | No exceptions. Run the command. |