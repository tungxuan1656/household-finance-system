---
name: brainstorming
description: Use when requirements, behavior, UX, or architecture direction is still ambiguous and a design decision is needed before implementation.
---

# Brainstorming

Use this skill only when the right implementation direction is not yet clear.

## When to Use

- ambiguous user requirements
- new feature behavior
- product or UX tradeoff
- architecture decision
- unclear acceptance criteria
- multiple plausible approaches
- risky change where wrong direction is expensive

## When Not to Use

- Level 0 direct tasks
- mechanical rename
- copy-only or config-only update
- simple bug with known root cause
- test maintenance with no behavior decision
- implementation already defined by an approved ExecPlan

## Required Reading

`AGENTS.md` is already loaded.

Read only what the design question needs:
- `harness/feature_index.json` for related feature scope
- exact `docs/product-specs/*` leaf docs for behavior
- exact frontend/backend leaf references for the design area
- `docs/design-docs/index.md` only when a durable design note may be needed

## Process

1. Understand the decision that is actually open.
2. Ask concise clarifying questions only when needed.
3. Compare 2-3 viable approaches when tradeoffs matter.
4. Recommend one approach with clear reasons.
5. Record the result in the smallest durable artifact that fits.

## Output

Use a compact structure:

```text
Brainstorm result:
- Open question:
- Options:
- Recommendation:
- Reason:
- Acceptance criteria or next step:
```

## Artifact Rule

- If the decision is durable UI or architecture guidance, write a design doc under `docs/design-docs/`.
- If the result should become executable implementation work, hand off to `writing-plans`.
- If the work is small and already clear after discussion, continue without forcing a design doc.

## Forbidden Behavior

- Do not require brainstorming for every modification.
- Do not create a parallel upstream doc tree for skill-specific notes.
- Do not block obvious low-risk execution with unnecessary design ceremony.
