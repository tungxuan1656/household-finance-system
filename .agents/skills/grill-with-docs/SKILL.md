---
name: grill-with-docs
description: Stress-test a proposed feature, fix, or plan against this repo's product/docs/code vocabulary before writing an ExecPlan or editing code.
---

# Grill With Docs

Use this skill before `writing-plans` when the work is real but the exact framing, terminology, or decision edges still need pressure.

## When to Use

- a feature idea sounds right but the boundaries are still fuzzy
- a bug report or request uses overloaded product language
- a plan needs one more design pass before becoming an ExecPlan
- the user wants options explored, but in the context of this repo's actual docs and code
- a future plan would be weak unless terminology, scope, or assumptions are clarified first

## When Not to Use

- one-shot mechanical edits
- straightforward Level 1 fixes with clear acceptance criteria
- tasks already covered by an approved ExecPlan with no open decisions
- generic brainstorming with no repo context or implementation intent

## Required Reading

`AGENTS.md` is already loaded.

Read only the exact leaves the decision needs:
- `docs/product-specs/index.md` -> exact feature spec when behavior is involved
- `docs/design-docs/index.md` -> exact design doc when durable UX or architecture language matters
- `docs/FRONTEND.md` or `docs/BACKEND.md` -> exact leaf refs for touched layers
- `docs/references/shared/type-naming-pattern.md` when shared naming or API shapes are in play
- `harness/feature_index.json` and the exact `harness/features/*.json` record if the work continues an existing feature
- current ExecPlan file if a draft already exists

Do not read broad folders when one leaf doc will do.

## Process

1. Name the open decision.
2. Read the minimum product/design/reference docs that define the current truth.
3. Explore the codebase when a question can be answered by evidence instead of asking the user.
4. Ask one concise question at a time only for choices the repo cannot answer.
5. For each question, provide a recommended answer and why.
6. Call out terminology drift immediately when user language conflicts with specs, design docs, or code.
7. Pressure-test edge cases with concrete scenarios, especially around finance behavior, permissions, and household/group boundaries.
8. End with a compact recommendation and the next artifact:
   - `writing-plans` if the direction is now clear
   - `prototype` if UX or state shape still needs playtesting
   - design doc update if the decision is durable
   - product spec update if behavior truth changed

## Output Contract

Use this compact structure:

```text
Grill result:
- Open decision:
- Docs/code checked:
- Terminology corrections:
- Key scenarios:
- Recommendation:
- Next artifact:
```

## Artifact Rule

Record resolved decisions in the smallest durable home:
- product behavior -> exact `docs/product-specs/*` leaf
- durable UX or architecture direction -> exact `docs/design-docs/*` leaf
- implementation sequencing or scope lock -> ExecPlan via `writing-plans`
- unfinished work pause -> `harness/session-handoff.md` via `handoff`

Do not create a parallel scratch doc tree for grilling notes.

## Forbidden Behavior

- Do not ask a batch of broad questions when repo evidence can answer first.
- Do not duplicate spec or design-doc bodies into the skill output.
- Do not let vague product terms survive if the repo already has a clearer canonical term.
- Do not convert a still-ambiguous discussion straight into code.

## Verification Expectations

- Re-read every doc you update.
- If this skill changes only docs or plans, verify those artifacts directly and then follow repo-level final verification when the session is claiming completion.

## Related Skills

- `using-skills` for entry triage
- `brainstorming` when ambiguity is broader than one scoped grilling pass
- `writing-plans` after direction is clear
- `prototype` when the answer must be tested through a throwaway UI or logic spike
