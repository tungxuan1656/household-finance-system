# ARCHITECTURE

## Purpose

Provide a concise, high-level map of the codebase that helps contributors quickly answer "where is X implemented?" and "what is the role of module Y?". This document should be short and stable — focus on concepts that rarely change.

## Scope

Keep this file at a coarse-grained level. Explain structure and boundaries, not implementation details. If deeper explanations are needed, link or reference separate design documents or inline code docs.

## What to include

- **Problem summary**: One or two sentences describing the problem the project solves.
- **Codemap**: Names and responsibilities of top-level modules or subsystems and how they relate (a mental map, not a full atlas).
- **Key files/types**: List important file or type names to search for (avoid hard links; prefer names for symbol search).
- **Architectural invariants**: Constraints or rules that should not be violated (for example, layering rules or ownership guidelines).
- **Boundaries**: Clear boundaries between layers or external systems and the expected interactions across those boundaries.
- **Cross-cutting concerns**: How the project handles logging, validation, configuration, authentication, and other global concerns.

## Writing and maintenance guidance

- Keep it brief to reduce the chance of becoming outdated.
- Avoid implementation details; move those to dedicated documents or inline comments.
- Revisit and update a few times per year rather than on every code change.
- Prefer naming important symbols for searchability rather than linking to specific files (links go stale).

## Example reference

See the rust-analyzer architecture document for a good example: https://github.com/rust-analyzer/rust-analyzer/blob/main/docs/dev/architecture.md

---

[ARCHITECTURE.md](https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html)