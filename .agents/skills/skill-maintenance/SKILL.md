---
name: skill-maintenance
description: Create, edit, audit, or port project-owned skills while preserving portable folder structure, minimal metadata, and harness-compatible workflow rules.
---

# Skill Maintenance

Use this skill when changing files under `.agents/skills/` or documenting `.agents/` skill conventions.

## When to Use

- adding a new skill
- rewriting an existing skill
- auditing skills for stale references
- porting skill content from another system
- aligning skills with project harness rules

## When Not to Use

- normal product code changes
- app frontend/backend implementation unrelated to agent skills

## Required Structure

Skills must live here:

```text
.agents/skills/<skill-name>/SKILL.md
```

Do not place loose markdown files directly inside `.agents/skills/`.

Shared guidance that should be discoverable by agents should become a skill folder.
Top-level agent docs may live under `.agents/`.

## Metadata Rule

Keep frontmatter minimal.

Default shape:

```yaml
---
name: skill-name
description: Short trigger-oriented description.
---
```

Do not add extra metadata unless the skill already needs it for a concrete runtime reason.

## Skill Contract

Each skill should make these sections clear in the body:
- when to use
- when not to use
- required reading
- forbidden behavior
- required output or decision format
- verification expectations
- related skills when useful

Workflow skills should also state:
- which ceremony levels they apply to
- whether harness artifacts need updates
- what to do on blockers or handoff

Domain skills should also state:
- domain scope
- exact leaf docs to read when needed
- review or validation checklist when relevant

## Porting Policy

These skills are project-owned.

Upstream skill systems may inspire wording or workflow, but upstream changes are advisory only. Port improvements manually only when they improve verification discipline, planning quality, context minimization, review quality, or maintainability in this repo.

## Stale Reference Cleanup

When auditing skills:
- replace removed entrypoint references with `using-skills`
- replace stale generic skill names with real current skills or leaf docs
- remove references to deleted folders or old upstream doc trees
- avoid leaving references to non-existent skills

## Current Project Rules

- `using-skills` is the only entrypoint skill.
- `ceremony-levels` defines Level 0/1/2/3 process depth.
- Level 0 tasks must not be forced through unnecessary planning ceremony.
- completion claims always require `verification-before-completion` discipline.
- subagent registry/model refactor is deferred in this phase.
