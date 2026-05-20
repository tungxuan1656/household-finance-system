---
name: ceremony-levels
description: Classify task complexity and choose the minimum sufficient workflow depth. Use when selecting planning, review, and verification rigor.
---

# Ceremony Levels

Use the minimum sufficient process for the task.

## Level 0 - Direct Task

Use for trivial, mechanical, one-shot work.

Examples:
- typo fix
- copy-only change
- one-line config update
- obvious rename
- test snapshot update with no behavior decision

Required:
- use `AGENTS.md` baseline context
- read only directly relevant file or leaf doc
- make the change
- run targeted verification when possible
- report evidence

Not required:
- `brainstorming`
- `writing-plans`
- ExecPlan
- formal review skill

## Level 1 - Small Change

Use for small scoped implementation.

Examples:
- one component update
- one endpoint fix
- one hook or service bug
- small focused test addition

Required:
- read the relevant leaf reference or product rule
- make a short inline plan
- update docs only if behavior changes
- run targeted verification

Optional:
- `test-driven-development`
- one domain skill
- lightweight review

## Level 2 - Planned Feature

Use for normal multi-step feature or contract work.

Examples:
- user-visible behavior change
- multi-file implementation
- API contract update
- state-management change

Required:
- read exact product/spec and reference docs
- use `writing-plans` or update an existing ExecPlan
- define acceptance criteria
- define verification path
- update harness progress and feature evidence

Optional:
- `brainstorming` when requirements are ambiguous
- `requesting-code-review`

## Level 3 - High-Risk Change

Use for architecture, security, data, reliability, or correctness-sensitive work.

Examples:
- auth or security changes
- database migration
- cross-layer refactor
- architecture boundary change
- financial calculation correctness
- large cleanup with high blast radius

Required:
- ExecPlan
- explicit risk assessment
- relevant architecture or domain references
- domain review skill as needed
- `verification-before-completion`
- harness updates with evidence

Optional:
- `subagent-driven-development` when the work is large enough or the user explicitly wants it

## Escalation Rule

If scope or risk grows while working, move up one level and apply the stricter rules from that point forward.
