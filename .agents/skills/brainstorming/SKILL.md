---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every project goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval.

## Required Reading

Before brainstorming, read:
- `AGENTS.md` — project context, session rules, definition of done
- `ARCHITECTURE.md` — system shape, layer model, dependency rules
- `harness/feature_index.json` — current feature status
- Relevant `docs/product-specs/*.md` — product behavior for the domain you're designing

Read additional docs only when the design scope requires them:
- `docs/FRONTEND.md` — if touching UI
- `docs/BACKEND.md` — if touching API/data
- `docs/references/*` — if implementing specific patterns

## Checklist

You MUST create a task for each of these items and complete them in order:

1. **Explore project context** — check files, docs, recent commits, harness state
2. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
3. **Propose 2-3 approaches** — with trade-offs and your recommendation
4. **Present design** — in sections scaled to their complexity, get user approval after each section
5. **Write design doc** — save to `docs/design-docs/YYYY-MM-DD-<topic>-design.md` for significant design decisions, or incorporate directly into the ExecPlan for smaller features
6. **Spec self-review** — quick inline check for placeholders, contradictions, ambiguity, scope (see below)
7. **User reviews written spec** — ask user to review the spec file before proceeding
8. **Transition to implementation** — invoke `writing-plans` skill to create implementation plan

## Process Flow

```
Explore project context
    |
    v
Ask clarifying questions (one at a time)
    |
    v
Propose 2-3 approaches with trade-offs
    |
    v
Present design sections
    |
    v
User approves design? ──NO──> Revise design sections
    |
    YES
    v
Write design doc (docs/design-docs/ or inline in ExecPlan)
    |
    v
Spec self-review (fix inline)
    |
    v
User reviews spec? ──NO──> Revise spec
    |
    YES
    v
Invoke writing-plans skill
```

**The terminal state is invoking writing-plans.** Do NOT invoke any other implementation skill. The ONLY skill you invoke after brainstorming is writing-plans.

## The Process

**Understanding the idea:**

- Check the current project state first (files, docs, recent commits, harness state)
- Before asking detailed questions, assess scope: if the request describes multiple independent subsystems (e.g., "build a platform with chat, file storage, billing, and analytics"), flag this immediately. Don't spend questions refining details of a project that needs to be decomposed first.
- If the project is too large for a single spec, help the user decompose into sub-projects: what are the independent pieces, how do they relate, what order should they be built? Then brainstorm the first sub-project through the normal design flow. Each sub-project gets its own spec → plan → implementation cycle.
- For appropriately-scoped projects, ask questions one at a time to refine the idea

**Implementation:**

- Invoke the `writing-plans` skill to create a detailed implementation plan
- Do NOT invoke any other skill. writing-plans is the next step.

## Key Principles

- **One question at a time** — Don't overwhelm with multiple questions
- **Multiple choice preferred** — Easier to answer than open-ended when possible
- **YAGNI ruthlessly** — Remove unnecessary features from all designs
- **Explore alternatives** — Always propose 2-3 approaches before settling
- **Incremental validation** — Present design, get approval before moving on
- **Be flexible** — Go back and clarify when something doesn't make sense

## Spec Self-Review

After writing the design doc, check for:

- **Placeholders**: Remove any `TBD`, `TODO`, or `fill in later`. Replace with concrete decisions.
- **Contradictions**: Does section A say one thing while section B says another?
- **Ambiguity**: Can a reasonable person implement this without asking clarifying questions?
- **Scope creep**: Does the design include features nobody asked for?

If you find issues, fix them inline before asking the user to review.

## Harness Integration

After design approval and before transitioning to writing-plans:

- Check `harness/feature_index.json` for related features and dependencies
- Note which feature ID this design will map to (or create a new one)
- Update `harness/progress.md` with a brief entry about the design session