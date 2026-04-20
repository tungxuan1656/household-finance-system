
# AGENTS.md

Personal & Family Expense Management System — Open Source, Long-term Maintenance

This repository is designed for a small team to build and maintain a reliable, clear, and consistent expense management application. The system tracks income and expenses, supports statistics, grouping, templates, habits, recurring deductions, categorization, and family group expense sharing.

---

## Startup Workflow

Before writing or changing code:
1. Read this AGENTS.md for agent workflow and rules
2. Read ARCHITECTURE.md for system map and dependency rules
3. Run ./init.sh to verify environment and codebase
4. Review feature_list.json for current features and status
5. (Optional) Read docs/PLANS.md and docs/product-specs/ for active plans/specs

---

## Working Rules

- One feature at a time: Only work on a single feature or plan per session
- Verification required: Run all verification steps before claiming a feature is done
- Update progress: Log work in progress.md after each session
- Use clear, consistent, and maintainable code
- Commit with descriptive messages
- Update feature_list.json and progress.md before ending session

---

## Required Artifacts

- `feature_list.json`: Feature state tracker (id, name, description, dependencies, status, evidence)
- `progress.md`: Session progress log (who, what, when, blockers)
- `init.sh`: Standard initialization and verification script
- `session-handoff.md`: (If needed) for team handoff

---

## Definition of Done

A feature is considered done when:
- [ ] Implementation is complete and committed
- [ ] All verification steps pass (lint, type-check, test, build)
- [ ] Evidence is recorded in feature_list.json
- [ ] Progress is logged in progress.md
- [ ] The repository can be restarted cleanly from the standard startup path

---

## End of Session

Before ending a session:
1. Update progress.md with work done, blockers, next steps
2. Update feature_list.json with feature status and evidence
3. Record blockers or risks if any
4. Commit with a descriptive message
5. Leave the repository in a clean, restartable state

---

## Verification Commands (pnpm mono-repo)

Run the following in the repo root to verify the entire codebase:

```bash
./init.sh
```

This script will:
- Install dependencies: `pnpm install`
- Lint all packages/apps: `pnpm lint`
- Type-check all code: `pnpm type-check`
- Run all tests: `pnpm test` (Vitest)
- Build all apps: `pnpm build` (Vite for frontend, Node.js for backend)

Each app/package should have its own scripts for lint, type-check, test, and build. The root scripts should run them for the whole workspace.

---

## Directory Structure (Recommended)

- /apps/backend (Cloudflare Worker, Hono, ulid)
- /apps/frontend (React, Vite, Tailwind, shadcn, PWA)
- /packages (shared libraries)
- AGENTS.md, ARCHITECTURE.md, PRODUCT.md, feature_list.json, progress.md, init.sh, session-handoff.md

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
