# DESIGN.md

Design entrypoint. Keep brief, route into detailed files under `docs/design-docs/`.

## Purpose

Record durable product and system design decisions that survive beyond a single chat, sprint, or reviewer memory.

## Read This When

- You need current design philosophy
- You are about to introduce a new pattern
- You need to know which design decisions are settled vs still open

## Canonical Design Docs

- `docs/design-docs/index.md`: index of accepted, proposed, and deprecated docs
- `docs/design-docs/core-beliefs.md`: project-wide agent-first beliefs
- `docs/design-docs/shadcn-first-ui-web-guide.md`: mandatory shadcn-first UI governance for `apps/web`

## Design Rules

- Keep design docs small and current.
- Prefer one doc per decision area.
- Link design docs from plans and specs when a change depends on them.
- If a design rule becomes operationally critical, promote it into an automated check or update `ARCHITECTURE.md`.