# Agents

Project-owned agent skills live under `.agents/skills/<skill-name>/SKILL.md`.

Project-owned sub-agent prompts live under `.agents/agents/<agent-name>.md`.

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
  agents/
    <agent-name>.md
  skills/
    <skill-name>/
      SKILL.md
```

Do not place loose markdown files directly inside `.agents/skills/`.

## Shared Skills

- `ceremony-levels`: shared Level 0/1/2/3 workflow depth rules.
- `skill-maintenance`: rules for creating, editing, auditing, and porting project-owned skills.

## Workflow Extensions

The repo also carries project-native workflow skills for common handoffs between discovery, planning, execution, and pause states:
- `grill-with-docs`: repo-grounded clarification before `writing-plans`
- `to-issues`: break an approved plan into thin vertical slices
- `triage`: classify incoming issues or requests before planning
- `prototype`: answer uncertain UX or logic questions with throwaway spikes
- `handoff`: write unfinished-session state into `harness/session-handoff.md`
- `improve-codebase-architecture`: periodic hotspot audit and seam scouting

## Workflow Direction

- Level 0 tasks stay tiny and may use only a direct-task note when they are truly one-shot mechanical work.
- Level 1 tasks use an explicit short inline plan in-session; they do not need `writing-plans` or an ExecPlan by default.
- Level 2 tasks usually need `writing-plans`.
- Level 3 tasks require stricter planning, review, and verification.
- Completion claims always require an explicit verification-before-completion pass with fresh evidence.

## Ownership

These skills are project-owned.

Some workflow ideas were adapted from prior skill systems, but this repo owns the current behavior and wording. Do not overwrite project skills blindly from upstream sources.

## Sub-agent Prompts

Sub-agent prompts are reusable runtime personas. They are not skills.

Use them when a task benefits from a fresh, narrow context window, such as independent UI/UX review. Keep prompt files minimal and point to the exact skill or checklist files they require.
