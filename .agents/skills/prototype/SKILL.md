---
name: prototype
description: Build a clearly throwaway UI or logic spike when UX flow, state shape, or domain logic is too uncertain to lock directly into production code.
---

# Prototype

Use this skill when the fastest way to answer the question is to build a small disposable thing.

## When to Use

- the user wants to try several UI directions
- a state machine or finance rule is easier to judge by interaction than by prose
- `grill-with-docs` or `brainstorming` narrowed the question, but not enough to commit to production code
- the team needs evidence before writing a durable ExecPlan or implementation patch

## When Not to Use

- the implementation path is already clear
- the code being written is intended to ship directly
- a design decision can be settled by reading existing docs and code alone

## Required Reading

Read only what anchors the prototype:
- exact product spec or design doc for the touched flow
- exact frontend/backend leaf references for the touched layer
- existing nearby component/module code so the spike sits close to the real target

## Branches

Choose one branch:
- `UI prototype` — several clearly different visual or interaction directions
- `Logic prototype` — a tiny runnable state or business-logic spike

If the question is ambiguous, pick the branch that best matches the surrounding code and state the assumption.

## Rules

1. Mark the prototype as throwaway in name or heading.
2. Keep it close to the real code area instead of inventing a distant sandbox tree.
3. Use one obvious command to run it.
4. Keep state local and disposable by default.
5. Surface the important state or decision output clearly.
6. Skip production polish, reusable abstractions, and full TDD unless the prototype itself is answering a testability question.
7. Capture the answer after learning, then delete or absorb the prototype.

## Output Contract

Use this structure when reporting:

```text
Prototype result:
- Question answered:
- Branch:
- Files or route:
- How to run:
- What we learned:
- Promote, revise, or delete:
```

## Artifact Rule

The durable artifact is the answer, not the prototype.

Capture the result in one of:
- current ExecPlan
- exact design doc
- exact product spec
- `harness/session-handoff.md` if the spike pauses unfinished

## Forbidden Behavior

- Do not let a prototype silently become production code.
- Do not leave vague "we'll clean this later" notes.
- Do not add persistence or infrastructure unless the question explicitly requires it.
- Do not skip marking the prototype as disposable.

## Verification Expectations

- Run the prototype once through the exact scenario it was meant to answer.
- Re-read any artifact where you record the result.

## Related Skills

- `grill-with-docs` before prototyping
- `frontend-design` for high-variance UI exploration
- `writing-plans` after the prototype closes the open question
