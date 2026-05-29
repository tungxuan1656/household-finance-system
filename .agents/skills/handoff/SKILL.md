---
name: handoff
description: Write a clean unfinished-session handoff into harness/session-handoff.md so the next agent can resume without re-discovery.
---

# Handoff

Use this skill only when a session stops with meaningful unfinished work.

## When to Use

- implementation pauses mid-feature
- an ExecPlan step is incomplete and another session must resume it
- verification or environment blockers prevent completion today

## When Not to Use

- the work is finished and recorded in normal progress/evidence
- there is no meaningful unfinished state to preserve
- the "handoff" would only repeat information already captured completely elsewhere

## Required Reading

Before writing, read the smallest set that defines the current state:
- current ExecPlan if one exists
- touched `harness/features/*.json`
- recent `harness/progress.md` entry if it contains the latest verification or blockers
- the current `harness/session-handoff.md` so you replace stale content intentionally

## Target Artifact

Write to:

`harness/session-handoff.md`

This repo keeps unfinished-session continuity here, not in a temp directory.

## Process

1. Summarize what is finished.
2. Name the exact unfinished work.
3. Record blockers, missing decisions, and environment constraints.
4. List the next actions in execution order.
5. Include the latest concrete verification evidence.
6. Add a short `Suggested skills` section for the next session when useful.

## Output Contract

Use the repo template sections and keep them concise:
- Status
- Completed
- In Progress
- Blockers
- Next Steps
- Evidence
- Suggested skills

## Clearing Rule

If the session finishes the work completely, do not create a fresh handoff.
If an old handoff becomes stale because the work is now done, clear or replace it as part of the finishing session instead of leaving misleading restart instructions behind.

## Forbidden Behavior

- Do not use `harness/session-handoff.md` as a second progress log.
- Do not leave stale blockers from a previous session without checking them.
- Do not duplicate whole plan or diff bodies when a path reference is enough.

## Verification Expectations

- Re-read `harness/session-handoff.md` after writing.
- If the session also claims completion, follow `verification-before-completion` instead of relying on the handoff alone.

## Related Skills

- `executing-plans` when stopping mid-plan
- `verification-before-completion` when deciding whether a handoff is still needed
