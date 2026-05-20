---
name: requesting-code-review
description: Use for review checkpoints on Level 2 or Level 3 work, and on risky Level 1 changes, before claiming the implementation is ready.
---

# Requesting Code Review

Use review with intent. Not every small change needs formal review, but risky work should not skip it.

## When to Request Review

Level guidance:
- Level 0: no formal review skill unless requested
- Level 1: optional lightweight self-review or formal review when risk is higher than the size suggests
- Level 2: review recommended before completion
- Level 3: review required before completion

For Level 3, add domain review as needed:
- `security-reviewer`
- `database-reviewer`
- `architect`
- `typescript-reviewer`
- other exact domain skills relevant to the change

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code reviewer subagent:**

Use Task tool with `general-purpose` type, fill template at `code-reviewer.md`

**Placeholders:**
- `{DESCRIPTION}` - Brief summary of what you built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit

**3. Act on feedback:**
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code reviewer subagent]
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types
  PLAN_OR_REQUIREMENTS: Task 2 from docs/exec-plans/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Review Output

Ask for output in this format:

```text
Review:
- Scope reviewed:
- Issues found:
- Severity:
- Required fixes:
- Suggestions:
- Verdict:
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each task or at natural checkpoints
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

Do not make domain review skills automatic for every change. Tie them to ceremony level and actual risk.

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See template at: requesting-code-review/code-reviewer.md

## Harness Integration

- Reference the feature ID from `harness/feature_index.json` in the review description.
- After review feedback is addressed, update `harness/progress.md`.
