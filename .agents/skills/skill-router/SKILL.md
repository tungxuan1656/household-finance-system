---
name: skill-router
description: 'Use when routing a task to the right existing skill, especially for plan creation, code review, debugging, frontend/backend/database/security work, or requests that should skip other skills via do simple task.'
argument-hint: 'Describe the task or ask which skill to use.'
---

# Skill Router

Use this skill to pick the smallest skill set that matches the request. It only routes; it does not do the work itself.

## Rules

- Always use `caveman` for normal responses.
- If the user says `do simple task`, skip all other skills and do the work directly. Keep it fast, short, and minimal.
- If the user asks to create a harness plan, follow `writing-plans`.
- If the user asks to review code or a PR, use `requesting-code-review`.
- If the task also touches frontend, TypeScript, database, backend, or security, add the matching review skill(s): `frontend-patterns`, `typescript-reviewer`, `database-reviewer`, `backend-patterns`, or `security-reviewer`, or any skills matching the task.
- When a task matches a skill from the `superpowers` set, load that specific skill and follow its workflow exactly.

## Quick Pick

1. Simple, one-shot request -> do it directly.
2. Plan or implementation -> `brainstorming`, `writing-plans`, or `executing-plans`.
3. Bug or failure -> `systematic-debugging`.
4. Review -> `requesting-code-review`, plus the matching domain review skill if needed.
5. Skill or instruction editing -> `writing-skills`.
6. Frontend/UI -> `frontend-patterns`, `ui-ux-pro-max`, `shadcn`, `tailwind-patterns`, `design-system`, `browser-qa`, `react-component-performance`, or `i18n-localization`, etc.
7. Backend/data/security -> `backend-patterns`, `database-migrations`, `database-reviewer`, `security-reviewer`, `api-connector-builder`, `nodejs-keccak256`, or `typescript-reviewer`, etc.

## Defaults

- Prefer the narrowest skill that solves the request.
- Combine one workflow skill with one domain skill when the request crosses domains.
- If unclear, ask the smallest possible clarifying question.
