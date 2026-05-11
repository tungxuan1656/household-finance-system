---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

# Executing Plans

Load plan, review critically, execute all tasks, report when complete.

**Announce at start:** "Using the executing-plans skill to implement this plan."

**Note:** If subagents are available, `subagent-driven-development` is preferred for faster iteration and two-stage review. Use this skill when executing in a separate session or when subagents are not available.

## Additional Reading

AGENTS.md is read at session start. For plan execution, also read:
- The plan file (read completely)
- Scope-specific reference docs only when the plan references them

## The Process

### Step 1: Load and Review Plan

1. Read the plan file completely
2. Review critically — identify any questions or concerns about the plan
3. If concerns: raise them with your human partner before starting
4. If no concerns: create TodoWrite and proceed

### Step 2: Execute Tasks

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Verify and Complete

After all tasks complete and verified:
1. Run `./init.sh` for full workspace verification
2. Use `verification-before-completion` skill to confirm all claims
3. Use `requesting-code-review` skill for final review
4. Update harness artifacts:
   - `harness/features/*.json` — update status and evidence
   - `harness/feature_index.json` — update feature status
   - `harness/progress.md` — add session entry
5. Commit with descriptive message

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** — stop and ask.

## Harness Integration

- Update `harness/progress.md` after each significant task completion
- Update `harness/session-handoff.md` if stopping mid-plan
- Record evidence in `harness/features/*.json` as tasks complete
- Run `./init.sh` before claiming the plan is done

## Remember

- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when the plan says to
- Stop when blocked, don't guess
- Never start implementation on main/master branch without explicit user consent

## Integration

**Required workflow skills:**
- **writing-plans** — Creates the plan this skill executes
- **verification-before-completion** — Verify before claiming done
- **requesting-code-review** — Review before merge

**Alternative workflow:**
- **subagent-driven-development** — Preferred when subagents are available