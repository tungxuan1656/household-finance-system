# Agents

Project-owned agent skills live under `.agents/skills/<skill-name>/SKILL.md`.

## Entry Point

Use `using-skills` first.

`using-skills` decides:
- ceremony level
- which workflow skills are needed
- which domain skills are needed
- what minimum reading applies
- what verification evidence is required before completion

## Portable Structure

Keep skill files portable across Codex, Claude Code, Copilot/VS Code, and OpenCode:

```text
.agents/
  skills/
    <skill-name>/
      SKILL.md
```

Do not place loose markdown files directly inside `.agents/skills/`.

## Shared Skills

- `ceremony-levels`: shared Level 0/1/2/3 workflow depth rules.
- `skill-maintenance`: rules for creating, editing, auditing, and porting project-owned skills.

## Workflow Direction

- Level 0 tasks stay tiny and may use only a direct-task note when they are truly one-shot mechanical work.
- Level 1 tasks use an explicit short inline plan in-session; they do not need `writing-plans` or an ExecPlan by default.
- Level 2 tasks usually need `writing-plans`.
- Level 3 tasks require stricter planning, review, and verification.
- Completion claims always require an explicit verification-before-completion pass with fresh evidence.

## Ownership

These skills are project-owned.

Some workflow ideas were adapted from prior skill systems, but this repo owns the current behavior and wording. Do not overwrite project skills blindly from upstream sources.

## Scope Note

Subagent registry/model refactor is deferred. `subagent-driven-development` remains available, but this phase only aligns it with ceremony levels and current harness rules.
