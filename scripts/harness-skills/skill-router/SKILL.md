---
name: skill-router
description: 'Route requests to the right existing skill. Use when choosing, combining, or overriding skills for a task, especially caveman, simple-task overrides, harness plans, or the superpowers workflow.'
argument-hint: 'Describe the task or ask which skill to use.'
---

# Skill Router

Use this skill to decide which other skill(s) to load for a request. It is a routing layer, not a replacement for the skill that actually performs the work.

## Mandatory Rules

- Always use `caveman` for normal responses.
- If the user says `do simple task`, skip all other skills and do the work directly. Keep it fast, short, and minimal.
- If the user asks to create a harness plan, follow `create-plan-for-implement`.
- When a task matches a skill from the `superpowers` set, load that specific skill and follow its workflow exactly.
- Do not create new directories like `worktrees` or `superpowers`. Use the repository's existing directories, especially the harness structure, docs, and current workspace layout.

## Decision Flow

1. Check for the exact override phrases first.
2. If the task is trivial and one-shot, treat it as `do simple task` behavior even if the phrase is missing.
3. If the task needs planning, debugging, review, or verification, choose the narrowest matching workflow skill.
4. If the task crosses domains, combine one workflow skill with one domain skill.
5. If the task still feels unclear, ask the smallest possible clarifying question.

## Skill Catalog

### Always-on style

- `caveman`: Mandatory voice mode for normal replies. Use it unless a higher-priority instruction requires a safety-first clarification.

### Fast path

- `do simple task`: No skill selection. Use plain execution only. Best for tiny edits, quick lookups, or single-step actions.

### Planning and implementation

- `brainstorming`: Turn an idea into constraints, options, and a concrete direction before coding.
- `writing-plans`: Build a plan for a multi-step task before implementation.
- `create-plan-for-implement`: Create a harness-aligned ExecPlan for repository work.
- `executing-plans`: Carry out an existing plan step by step.
- `subagent-driven-development`: Split implementation into independent subagent tasks.
- `dispatching-parallel-agents`: Run independent tasks in parallel when they do not share state.
- `using-superpowers`: Choose, load, and coordinate the superpowers workflow skills.

### Debugging and validation

- `systematic-debugging`: Trace a bug or failure from symptom to root cause.
- `test-driven-development`: Write or update tests before implementation when behavior must be proven.
- `verification-before-completion`: Run checks before claiming work is done.

### Review and handoff

- `receiving-code-review`: Process review feedback critically before changing code.
- `requesting-code-review`: Ask for review before merge or release.
- `finishing-a-development-branch`: Decide how to close out completed work.

### Writing and customization

- `writing-skills`: Create or update a skill, prompt, instruction, or other agent customization file.
- `writing-plans`: Also use for clear implementation plans and execution notes.
- `using-superpowers`: Also use when the user asks for the best skill to apply.

### Frontend and UI

- `frontend-patterns`: React and Next.js component structure, state, and UI architecture.
- `ui-ux-pro-max`: High-quality interface design, layout, and interaction direction.
- `shadcn`: shadcn/ui component composition and conventions.
- `tailwind-patterns`: Tailwind CSS v4 patterns and token-driven styling.
- `design-system`: Visual consistency and component system decisions.
- `browser-qa`: Browser-based UI verification, screenshots, and interaction checks.
- `react-component-performance`: Diagnose and fix slow React components.
- `i18n-localization`: Translation, locale, and text-coverage work.

### Backend, data, and security

- `backend-patterns`: API routes, handlers, service boundaries, and backend conventions.
- `database-migrations`: Schema changes, data migrations, and rollout-safe database work.
- `database-reviewer`: Query design, schema correctness, and database performance review.
- `security-reviewer`: Any task involving auth, input validation, secrets, or attack surface.
- `api-connector-builder`: Build a new external API integration using the existing connector pattern.
- `nodejs-keccak256`: Ethereum hashing work in JavaScript or TypeScript.
- `typescript-reviewer`: TypeScript correctness, async behavior, and type-safety review.

## Superpowers Priority Map

If the task mentions or clearly fits the superpowers workflow, use this mapping:

- Idea unclear or broad: `brainstorming`
- Need a plan first: `writing-plans` or `create-plan-for-implement`
- Implement from plan: `executing-plans`
- Bug cause unknown: `systematic-debugging`
- New behavior needs proof: `test-driven-development`
- Need parallel work: `dispatching-parallel-agents`
- Can split into independent sub-tasks: `subagent-driven-development`
- Want feedback before merge: `requesting-code-review`
- Received feedback to apply: `receiving-code-review`
- Work is functionally done: `verification-before-completion` then `finishing-a-development-branch`

## Practical Combination Rules

- Use one workflow skill for process and one domain skill for context when needed.
- Prefer the narrowest skill that solves the current step.
- Do not stack skills that overlap unless they add different value.
- If a skill conflict appears, keep caveman style and explain the decision in the shortest clear way.

## Completion Check

Before acting, verify:

- The request is not a `do simple task` case.
- The mandatory caveman rule still holds.
- The right workflow skill is selected.
- The repository layout stays within existing harness and project directories.
