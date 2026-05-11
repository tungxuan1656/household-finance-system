---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Why subagents:** You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task. They should never inherit your session's context or history — you construct exactly what they need. This also preserves your own context for coordination work.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

**Continuous execution:** Do not pause to check in with your human partner between tasks. Execute all tasks from the plan without stopping. The only reasons to stop are: BLOCKED status you cannot resolve, ambiguity that genuinely prevents progress, or all tasks complete. "Should I continue?" prompts and progress summaries waste their time — they asked you to execute the plan, so execute it.

## Required Reading

Before starting:
- The plan file (read completely, extract all tasks)
- `AGENTS.md` — for session rules and verification commands

Read additional docs only when the plan references them.

## When to Use

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

## The Process

```
Read plan, extract all tasks with full text, note context, create TodoWrite
    |
    v
For each task:
    |
    v
Dispatch implementer subagent (./implementer-prompt.md)
    |
    v
Implementer asks questions? ──YES──> Answer, provide context, re-dispatch
    |
    NO
    v
Implementer implements, tests, commits, self-reviews
    |
    v
Dispatch spec reviewer subagent (./spec-reviewer-prompt.md)
    |
    v
Spec reviewer confirms code matches spec? ──NO──> Implementer fixes, re-review
    |
    YES
    v
Dispatch code quality reviewer subagent (./code-quality-reviewer-prompt.md)
    |
    v
Code quality reviewer approves? ──NO──> Implementer fixes, re-review
    |
    YES
    v
Mark task complete in TodoWrite
    |
    v
More tasks? ──YES──> Next task
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
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context (subagent needs to understand where task fits)
- Ignore subagent questions (answer before letting them proceed)
- Accept "close enough" on spec compliance (spec reviewer found issues = not done)
- Skip review loops (reviewer found issues = implementer fixes = review again)
- Let implementer self-review replace actual review (both are needed)
- **Start code quality review before spec compliance is ✅** (wrong order)
- Move to next task while either review has open issues

**If subagent asks questions:**
- Answer clearly and completely
- Provide additional context if needed
- Don't rush them into implementation

**If reviewer finds issues:**
- Implementer (same subagent) fixes them
- Reviewer reviews again
- Repeat until approved
- Don't skip the re-review

**If subagent fails task:**
- Dispatch fix subagent with specific instructions
- Don't try to fix manually (context pollution)

## Harness Integration

After all tasks complete:
1. Run `./init.sh` for full workspace verification
2. Use `verification-before-completion` skill to confirm all claims
3. Use `requesting-code-review` skill for final review
4. Update harness artifacts:
   - `harness/features/*.json` — update status and evidence
   - `harness/feature_index.json` — update feature status
   - `harness/progress.md` — add session entry
5. Commit with descriptive message

During execution:
- Update `harness/progress.md` after each significant task completion
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