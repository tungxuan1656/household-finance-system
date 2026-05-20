---
name: executing-plans
description: Use when you have a written implementation plan and will execute it inline, sequentially by default, with review and verification checkpoints.
---

# Executing Plans

Load the plan, review it critically, execute it step by step, and verify results before completion.

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
1. Run needed `./init.sh <param>` commands; use full `./init.sh` only for final verification
2. Use `verification-before-completion` skill to confirm all claims
3. Use `requesting-code-review` skill for final review
4. Update harness artifacts:
   - `harness/features/*.json` — update status and evidence
   - `harness/feature_index.json` — update feature status
   - `harness/progress.md` — add session entry

## Execution Mode Rule

Sequential execution is the default.

If the plan is clearly large, parallelizable, or high-risk, mark it as a candidate for `subagent-driven-development`, but do not switch automatically in this phase.

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
- Update `harness/progress.md` when a meaningful milestone lands, not after every trivial file touch
- Update `harness/session-handoff.md` if stopping mid-plan
- Record evidence in `harness/features/*.json` as tasks complete
- Use `./init.sh <param>` instead of `pnpm <cmd>` for install/lint/typecheck/test/build.
- Run full `./init.sh` only at final verification.

## Remember

- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when the plan says to
- Stop when blocked, don't guess

## Integration

**Required workflow skills:**
- **writing-plans** — Creates the plan this skill executes
- **verification-before-completion** — Verify before claiming done
- **requesting-code-review** — Review before merge

**Alternative workflow:**
- **subagent-driven-development** — Preferred when subagents are available
