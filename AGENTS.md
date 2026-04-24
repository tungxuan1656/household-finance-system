# AGENTS.md

Personal & Family Expense Management System — Open Source, Long-term Maintenance

This repository is designed for a small team to build and maintain a reliable, clear, and consistent expense management application. The system tracks income and expenses, supports statistics, grouping, templates, habits, recurring deductions, categorization, and family group expense sharing.

---

## Tech Stack (current)

- Frontend (`apps/web`): React 19, TypeScript, Vite, Tailwind CSS, shadcn UI, sonner, date-fns.
- Backend / Edge (`apps/worker`): Cloudflare Workers, Hono, D1 (SQLite-compatible), Wrangler, `zod` for validation, `jose` for JWT/JWKS handling, `ulid` for ids.
- Tooling & CI: `pnpm` monorepo, ESLint, Prettier, Vitest, TypeScript.


## Startup Workflow

Before writing or changing code:
1. Read this AGENTS.md for agent workflow and rules
2. Read ARCHITECTURE.md for system map and dependency rules
3. Run ./init.sh to verify environment and codebase
4. Review harness/feature_index.json and harness/features/*.json for current feature state
5. (Optional) Read docs/PLANS.md and docs/product-specs/ for active plans/specs

---

## Working Rules

- One feature at a time: Only work on a single feature or plan per session
- Verification required: Run all verification steps before claiming a feature is done
- Update progress: Log work in harness/progress.md after each session
- Use clear, consistent, and maintainable code
- Commit with descriptive messages
- Update harness feature state and harness/progress.md before ending session

---

## Required Artifacts

- `harness/feature_index.json`: Lightweight feature index (id, name, status)
- `harness/features/*.json`: Per-feature detail records (description, dependencies, evidence, ownership)
- `harness/progress.md`: Session progress log (who, what, when, blockers) with newest entries first and archived history under `harness/progress/archive/`
- `init.sh`: Standard initialization and verification script
- `harness/session-handoff.md`: (If needed) handoff artifact for unfinished sessions

---

## Definition of Done

A feature is considered done when:
- [ ] Implementation is complete and committed
- [ ] All verification steps pass (lint, type-check, test, build)
- [ ] Evidence is recorded in `harness/features/*.json` and reflected in `harness/feature_index.json`
- [ ] Progress is logged in `harness/progress.md`
- [ ] The repository can be restarted cleanly from the standard startup path

---

## End of Session

Before ending a session:
1. Update harness/progress.md at the top with work done, blockers, next steps
2. Update harness feature records with status and evidence
3. Record blockers or risks if any
4. Commit with a descriptive message
5. Leave the repository in a clean, restartable state

---

## Verification Commands (pnpm mono-repo)

Run the following in the repo root to verify the entire codebase:

```bash
./init.sh
```

Useful dev & verification commands:

```bash
# Full workspace verification
./init.sh

# Frontend dev (Vite)
pnpm dev:web

# Worker dev (Cloudflare Wrangler)
pnpm dev:worker

# Build frontend
pnpm build:web

# Deploy worker
pnpm deploy:worker
```

This repository uses a pnpm monorepo layout. The root `./init.sh` runs install, harness checks, lint, type-check, tests, and the web build. Each app/package should also expose its own `lint`, `typecheck`, `test`, and `build` scripts so they can be run individually.

---

## Directory Structure (Recommended)
- /apps/worker (Cloudflare Worker, Hono, D1, wrangler)
- /apps/web (React, Vite, Tailwind, shadcn)
- /packages (shared libraries)
- AGENTS.md, ARCHITECTURE.md, PRODUCT.md, harness/, init.sh

---

## Routing Map

- ARCHITECTURE.md: System map, layer model, dependency rules
- docs/design-docs/index.md: Design decisions and core beliefs
- docs/product-specs/index.md: Product behaviors and acceptance targets
- docs/PLANS.md: Plan lifecycle and execution-plan policy
- docs/QUALITY_SCORE.md: Product-domain and layer health
- docs/RELIABILITY.md: Runtime signals, benchmarks, and restart expectations
- docs/SECURITY.md: Secrets, sandbox, data, and external-action rules
- docs/FRONTEND.md: UI constraints, design system rules, accessibility checks

---

## Further Guidance

- Always follow the one-feature-at-a-time policy
- Never claim a feature done without running all verification steps
- Keep documentation and progress up to date
- Use clear, maintainable, and consistent code style

---

For more details, see the Learn Harness Engineering documentation and project docs.

---

## Mandatory Guide for Frontend & Backend Code

**All code related to frontend or backend MUST strictly follow the corresponding guide and rules:**

- For frontend code: see [docs/FRONTEND.md](docs/FRONTEND.md)
- For backend code: see [docs/BACKEND.md](docs/BACKEND.md)
- For web UI design governance: see [docs/design-docs/shadcn-first-ui-web-guide.md](docs/design-docs/shadcn-first-ui-web-guide.md)

Agents and contributors are required to consult and comply with these documents for:
- UI/UX, component, and design system standards (frontend)
- API, data, validation, and security standards (backend)
- mandatory shadcn-first composition and variant/token usage rules (web UI)

Any code that does not follow these guides will be considered non-compliant and must be revised before acceptance.

## Mandatory Pre-Read for UI Work

Before any UI task in `apps/web` (design, implementation, review), agents/contributors MUST read:

1. `.agents/skills/shadcn/SKILL.md`
2. `.agents/skills/shadcn/rules/styling.md`
3. `.agents/skills/shadcn/rules/forms.md`
4. `.agents/skills/shadcn/rules/composition.md`

Skipping this pre-read is non-compliant.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **household-finance-system** (2108 symbols, 3007 relationships, 39 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/household-finance-system/context` | Codebase overview, check index freshness |
| `gitnexus://repo/household-finance-system/clusters` | All functional areas |
| `gitnexus://repo/household-finance-system/processes` | All execution flows |
| `gitnexus://repo/household-finance-system/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.agents/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.agents/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.agents/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.agents/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.agents/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.agents/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
