# PRODUCT_SENSE.md

This file captures durable product judgment that agents cannot infer reliably
from code alone.

## Product Core

- Primary user: Families/households that jointly manage shared finances (e.g., couples, multi-generation households)
- Job to be done: Help families understand, control, and optimize shared household cash flows.
- Main frustration to remove: Lack of shared visibility and clear ownership of transactions, causing missed budgets, duplicate payments, and confusion about who paid what.
- Quality bar for acceptance: Fast, low-friction expense input; a single-source-of-truth household view that is understandable at a glance; budget alerts and insights that are timely and actionable (qualitative acceptance criteria).

## Product Rules

- Favor user-visible reliability over feature count.
- Treat ambiguous behavior as a spec gap, not as permission to guess.
- If implementation changes what users see or trust, update the matching spec.
- Use product specs for concrete flows, and use this file for cross-cutting
  product priorities.

## No-Go Patterns

- Hidden destructive actions
- Silent failure without user feedback
- Unclear source of truth for visible state
- Features that cannot be explained in one sentence
