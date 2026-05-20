---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
---

# Verification Before Completion

No completion claim without fresh verification evidence.

## Policy

Before claiming a task is complete, fixed, passing, or ready:

1. Identify the command that proves the claim.
2. Run it fresh.
3. Read the actual result.
4. Report the verified status, not the hoped-for status.

If verification cannot run, say so explicitly and mark the result as unverified.

## Verification Is Always Required for Completion Claims

Every task, including Level 0 direct tasks, requires evidence before claiming completion.

The amount of verification depends on ceremony level and risk:
- Level 0: targeted check when possible
- Level 1: targeted lint, test, or typecheck relevant to the changed area
- Level 2: planned verification from the ExecPlan
- Level 3: broader verification and relevant domain checks

If verification cannot be run, report:
- what was not run
- why it was not run
- what risk remains

Use wording like:

```text
Implemented, but not fully verified because...
```

Do not say the task is complete without verification evidence.

## Verification Format

Use this structure when reporting final status:

```text
Verification:
- Command:
- Result:
- Evidence:
- Not run:
- Reason if not run:
- Risk if unverified:
```

## Expected Depth

- Level 0/1: prefer targeted verification.
- Level 2/3: run broader verification appropriate to the scope.
- Final repo-ready handoff should include the repo-standard final verification path when required by `AGENTS.md`.

## Required Language

- If checks passed, say what passed and cite the command.
- If checks failed, say what failed and cite the command.
- If checks did not run, say `implemented but unverified`.

## Forbidden Behavior

- Do not say `done` when required verification did not run.
- Do not infer build success from lint success.
- Do not infer behavioral correctness from code inspection alone.
- Do not rely on old command output when making a fresh completion claim.

## Harness Integration

Use `./init.sh <param>` instead of `pnpm <cmd>` for install, lint, typecheck, test, and build. Run full `./init.sh` only at final verification when the repo rules require it.

Before a commit-ready or done claim, update required harness evidence and progress records.
