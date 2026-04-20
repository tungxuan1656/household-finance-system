# AI Is Forcing Us To Write Good Code

## When Best Practices Matter

Introduction
- The practices we call "good code"—comprehensive tests, clear documentation, small well-scoped modules, static typing, and reproducible dev environments—were often treated as optional. Time pressure typically meant they were cut.
- With agent-driven development (LLMs/agents), these practices become essential. Without clear guardrails an agent can introduce widespread, hard-to-detect problems; with strong guardrails, agents can be very effective.

## 1. Require 100% Code Coverage
- Purpose: not to claim "no bugs," but to force executable verification for every line the agent touches.
- Rationale: partial coverage leaves ambiguity about which lines are intentionally untested; 100% removes that ambiguity and turns the coverage report into an actionable TODO list.
- Benefits: unreachable or dead code is identified and removed, edge cases are explicitly tested, and code reviews focus on concrete, demonstrable behavior.

## 2. Meaningful Namespaces and File Organization
- Agents navigate code primarily via the filesystem; file and folder names are an important API for them.
- Prefer descriptive paths (e.g., billing/invoices/compute.ts) over generic helpers—this improves discoverability and intent signaling.
- Keep files small and focused so agents can load and reason about whole files without truncation.

## 3. Fast, Ephemeral, Concurrent Dev Environments
- Fast: automated checks (tests, linters, migrations) must run quickly so agents can iterate frequently.
- Ephemeral: make it trivial to create disposable environments (worktrees, isolated configs, ephemeral DBs) with a single command.
- Concurrent: ensure environments are isolation-friendly (configurable ports, database names, caches) so multiple worktrees can run simultaneously without conflict.

## 4. End-to-End Types
- Use a statically typed language (TypeScript recommended) to reduce invalid states and narrow the agent's action space.
- Prefer semantic type names (e.g., UserId, WorkspaceSlug) to convey intent and make search and reasoning easier for agents.
- Use OpenAPI-generated clients and typed DB clients (e.g., Kysely + Postgres constraints) to keep type safety from API to persistence.

## Conclusion
- Agents are powerful but only as effective as the environment and rules you provide.
- Invest in tests, strong organization, fast automation, and types: the upfront cost pays off by enabling safe, reliable agent-driven development.

[AI Is Forcing Us To Write Good Code - by Steve Krenzel](https://bits.logic.inc/p/ai-is-forcing-us-to-write-good-code)