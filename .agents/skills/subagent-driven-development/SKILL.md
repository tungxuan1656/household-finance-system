---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagents per task or per lane, with two-stage review after each implemented unit: spec compliance review first, then code quality review.

## Scope Note

This skill documents when subagents are appropriate.

Actual subagent registry or model-routing refactor is deferred in this phase.

**Why subagents:** You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task. They should never inherit your session's context or history — you construct exactly what they need. This also preserves your own context for coordination work.

**Core principle:** Fresh subagent per task/lane + safe phase-based parallelism + two-stage review (spec then quality) = high quality, fast iteration

**Continuous execution:** Do not pause to check in with your human partner between tasks. Execute all tasks from the plan without stopping. The only reasons to stop are: BLOCKED status you cannot resolve, ambiguity that genuinely prevents progress, or all tasks complete. "Should I continue?" prompts and progress summaries waste their time — they asked you to execute the plan, so execute it.

## Additional Reading

AGENTS.md is read at session start. For plan execution, also read:
- The plan file (read completely, extract all tasks)
- Scope-specific reference docs only when the plan references them

## When to Use

Default threshold: Level 3 work or explicit user request.

Use this skill when:
- a written plan exists
- tasks can be bounded clearly
- independent lanes can be justified safely
- the coordination overhead is worth it

Do not use this skill by default for small inline plan execution. Use `executing-plans` first.

```
Have implementation plan?
    |
    YES
    v
Tasks mostly independent?
    |
    YES ──> Stay in this session? ──YES──> subagent-driven-development
    |                                      |
    |                                      NO ──> executing-plans
    |
    NO ──> Manual execution or brainstorm first
```

**vs. Executing Plans (parallel session):**
- Same session (no context switch)
- Fresh subagent per task (no context pollution)
- Two-stage review after each task: spec compliance first, then code quality
- Faster iteration (no human-in-loop between tasks)

Sequential execution remains the default even inside this skill.

## Parallelism Default

**Default mode is still sequential.** Do **not** parallelize implementation by reflex.

Parallel implementation is allowed only when it is **provably safer and faster** than sequential execution.

Use parallel lanes only when all of these are true:
- Shared contract or architecture boundary is already defined and stable enough for implementers to target
- File overlap is none or very low
- Tasks do not modify the same active integration point or shared mutable core at the same time
- Orchestrator owns the reintegration step and final acceptance decisions
- Each lane can still be reviewed independently before merge into the main line of work

If any of those are false, stay sequential.

## Safe Parallelization Model

Think in **phases**, not "everything at once."

### Phase types

**Usually sequential:**
- Preflight discovery, impact analysis, and risk checks
- Architecture choices and shared contract definition
- Core/shared module changes that every lane depends on
- Final integration, dead-code cleanup, and final verification

**Sometimes parallel:**
- Independent implementation lanes with stable contracts
- Isolated tests/helpers for one bounded area
- Consumer rewires after shared core is stable
- Docs or harness updates that do not change code behavior (only if they truly do not depend on final verification state)

### Good parallel examples

- Helper/test lane + presentational UI extraction lane
- Two consumers rewired to the same already-stable shared module
- Separate folders with separate ownership boundaries and no shared core edits

### Bad parallel examples

- Two subagents both editing the same shared hook/class/module
- Contract still changing while consumers are being updated
- Deleting old code before all consumers are migrated
- Broad refactors where each lane would need architectural judgment independently

## The Process

```
Read plan, extract all tasks with full text, note context, create TodoWrite
    |
    v
Classify tasks: sequential core vs parallel-safe lanes
    |
    v
Complete sequential preflight/contract/core tasks first
    |
    v
Any parallel-safe lanes ready? ──NO──> Dispatch next implementer sequentially
    |
    YES
    v
Dispatch implementer subagents for one batch of independent lanes
    |
    v
Implementers ask questions? ──YES──> Answer, provide context, re-dispatch affected lane
    |
    v
Implementers implement, test, and self-review in their lane
    |
    v
Dispatch spec reviewer subagent per completed task/lane (or per tightly bounded batch)
    |
    v
Spec reviewer confirms code matches spec? ──NO──> Implementer fixes, re-review
    |
    YES
    v
Dispatch code quality reviewer subagent per completed task/lane (or per tightly bounded batch)
    |
    v
Code quality reviewer approves? ──NO──> Implementer fixes, re-review
    |
    YES
    v
Orchestrator reintegrates approved lanes, resolves conflicts, and updates TodoWrite
    |
    v
More tasks? ──YES──> Next sequential task or next safe parallel batch
    |
    NO
    v
Dispatch final code reviewer subagent for entire implementation
    |
    v
Use verification-before-completion skill
    |
    v
Use requesting-code-review skill
    |
    v
Update harness artifacts and commit
```

## Model Selection

Use the least powerful model that can handle each role to conserve cost and increase speed.

**Mechanical implementation tasks** (isolated functions, clear specs, 1-2 files): use a fast, cheap model. Most implementation tasks are mechanical when the plan is well-specified.

**Integration and judgment tasks** (multi-file coordination, pattern matching, debugging): use a standard model.

**Architecture, design, and review tasks**: use the most capable available model.

**Task complexity signals:**
- Touches 1-2 files with a complete spec → cheap model
- Touches multiple files with integration concerns → standard model
- Requires design judgment or broad codebase understanding → most capable model

## Handling Implementer Status

Implementer subagents report one of four statuses. Handle each appropriately:

**DONE:** Proceed to spec compliance review.

**DONE_WITH_CONCERNS:** The implementer completed the work but flagged doubts. Read the concerns before proceeding. If the concerns are about correctness or scope, address them before review. If they're observations (e.g., "this file is getting large"), note them and proceed to review.

**NEEDS_CONTEXT:** The implementer needs information that wasn't provided. Provide the missing context and re-dispatch.

**BLOCKED:** The implementer cannot complete the task. Assess the blocker:
1. If it's a context problem, provide more context and re-dispatch with the same model
2. If the task requires more reasoning, re-dispatch with a more capable model
3. If the task is too large, break it into smaller pieces
4. If the plan itself is wrong, escalate to the human

**Never** ignore an escalation or force the same model to retry without changes. If the implementer said it's stuck, something needs to change.

## Prompt Templates

- `./implementer-prompt.md` — Dispatch implementer subagent
- `./spec-reviewer-prompt.md` — Dispatch spec compliance reviewer subagent
- `./code-quality-reviewer-prompt.md` — Dispatch code quality reviewer subagent

## Red Flags

**Never:**
- Start implementation on main/master branch without explicit user consent
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel **by default**
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context (subagent needs to understand where task fits)
- Ignore subagent questions (answer before letting them proceed)
- Accept "close enough" on spec compliance (spec reviewer found issues = not done)
- Skip review loops (reviewer found issues = implementer fixes = review again)
- Let implementer self-review replace actual review (both are needed)
- **Start code quality review before spec compliance is ✅** (wrong order)
- Move to next task while either review has open issues
- Parallelize lanes that share the same unstable core module or contract
- Let subagents independently decide reintegration strategy for overlapping changes
- Delete old modules while migration lanes are still incomplete

**Parallel only when all safety checks pass:**
- Shared contract stable enough
- Minimal overlap in touched files
- Lane boundaries are explicit
- Reintegration owner is explicit
- Review happens for each completed lane before acceptance

If you cannot explain why the lanes are independent, they are not independent enough.

**If subagent asks questions:**
- Answer clearly and completely
- Provide additional context if needed
- Don't rush them into implementation

**If reviewer finds issues:**
- Implementer (same subagent) fixes them
- Reviewer reviews again
- Repeat until approved
- Don't skip the re-review

**If running parallel lanes:**
- Keep each lane narrowly scoped
- Prefer one parallel batch at a time, not unlimited fan-out
- Re-check whether later lanes are still independent after earlier lanes land
- Collapse back to sequential mode immediately if contract drift or merge tension appears

**If subagent fails task:**
- Dispatch fix subagent with specific instructions
- Don't try to fix manually (context pollution)

## Harness Integration

After all tasks complete:
1. Run needed `./init.sh <param>` commands; use full `./init.sh` only for final verification
2. Use `verification-before-completion` skill to confirm all claims
3. Use `requesting-code-review` skill for final review
4. Update harness artifacts:
   - `harness/features/*.json` — update status and evidence
   - `harness/feature_index.json` — update feature status
   - `harness/progress.md` — add session entry
5. Commit with descriptive message

During execution:
- Update `harness/progress.md` after each significant task completion
- Use `./init.sh <param>` instead of `pnpm <cmd>` for install/lint/typecheck/test/build.
- Run full `./init.sh` only at final verification.
- Update `harness/session-handoff.md` if stopping mid-plan

## Integration

**Required workflow skills:**
- **writing-plans** — Creates the plan this skill executes
- **verification-before-completion** — Verify before claiming done
- **requesting-code-review** — Code review template for reviewer subagents

**Subagents should use:**
- **test-driven-development** — Subagents follow TDD for each task

**Alternative workflow:**
- **executing-plans** — Use for parallel session instead of same-session execution
