---
name: improve-codebase-architecture
description: Run a lightweight architecture audit on hot spots, then propose deepening opportunities and next steps without forcing blind refactors.
---

# Improve Codebase Architecture

Use this skill as a periodic audit, especially after churn-heavy weeks or when one area keeps fighting maintainability.

## When to Use

- a module or feature area feels harder to change every week
- files or flows keep attracting follow-up fixes
- the team wants a weekly architecture pass on hot spots
- a refactor idea needs evidence before becoming a plan

## When Not to Use

- a simple local change with no architecture question
- a feature already has a stable approved plan and no broader design concern

## Required Reading

Read only the exact materials needed for the hotspot:
- `ARCHITECTURE.md`
- exact `docs/references/frontend/*` or `docs/references/backend/*` leaves for the touched area
- exact product spec or design doc when domain seams depend on product truth
- recent `harness/progress.md` entries around the hotspot
- related `harness/features/*.json` records when repeated work is feature-linked

Use GitNexus exploration or impact tooling when available to confirm callers, clusters, and churn surface.

## Audit Focus

Look for:
- shallow modules with thin wrappers and lots of coordination leakage
- orchestration code that knows too many details
- repeated transform or validation logic across layers
- long files or hot paths with repeated follow-up fixes
- places where tests are hard because seams are weak or missing

## Output Contract

Use this structure:

```text
Architecture audit:
- Hotspot:
- Evidence:
- Friction:
- Candidate seam or module:
- Expected leverage:
- Risk:
- Recommended next step:
```

Rank the findings. Prefer a few sharp opportunities over a long generic list.

## Artifact Rule

This skill is usually diagnostic first.

If the recommendation should drive work:
- durable architecture decision -> design doc
- execution work -> `writing-plans`
- weekly watch item -> progress log or issue tracker note if the user asks

Do not refactor production code from this skill alone unless the user explicitly asks to continue into implementation.

## Forbidden Behavior

- Do not produce architecture advice detached from repo evidence.
- Do not recommend broad rewrites when a smaller seam would buy more leverage.
- Do not duplicate existing architecture docs without adding a concrete repo-specific finding.

## Verification Expectations

- Re-read any design doc, plan, or progress artifact updated from the audit.
- If the audit changes only docs, include doc verification and final repo verification evidence before claiming completion.

## Related Skills

- `using-skills` for entry triage
- `grill-with-docs` when architecture and product language are entangled
- `writing-plans` when an audit finding becomes real implementation work
