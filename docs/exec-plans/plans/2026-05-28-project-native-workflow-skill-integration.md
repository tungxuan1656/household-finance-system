# Title

Project-native workflow skill integration

## Purpose / Big Picture

Add a project-owned workflow layer that ports the most useful ideas from the external Matt Pocock skills set into this repo's existing harness and doc architecture. The result should make issue intake, pre-plan clarification, vertical slicing, prototyping, handoff, and periodic architecture audits discoverable through `using-skills` instead of living as ad hoc operator knowledge.

## Scope

- Change workflow and skill artifacts under `.agents/skills/` and `.agents/README.md`.
- Update root routing guidance in `AGENTS.md`.
- Add one completed ExecPlan and one harness feature record for this workflow upgrade.
- Update `harness/progress.md` and `harness/feature_index.json`.

Out of scope:
- application runtime code
- issue-tracker automation
- auto-publishing GitHub issues
- sub-agent runtime registration changes

## Non-negotiable Requirements

- Keep all new skills project-owned and portable under `.agents/skills/<skill-name>/SKILL.md`.
- Do not import upstream GitHub-only or `CONTEXT.md` assumptions unchanged.
- Route new skills through `using-skills` and repo guidance so future sessions discover them naturally.
- Preserve harness-compatible verification and handoff behavior.

## Progress

- [x] Inspect current skill-system, harness, and plan conventions.
- [x] Draft project-native versions of `grill-with-docs`, `to-issues`, `triage`, `prototype`, `handoff`, and `improve-codebase-architecture`.
- [x] Wire the new skills into `using-skills`, `writing-plans`, `.agents/README.md`, and `AGENTS.md`.
- [x] Add and complete the harness feature record plus progress evidence.
- [x] Run final verification and record the results.

## Surprises & Discoveries

- The repo already had strong execution and verification skills, so the real gap was workflow routing between issue intake, pre-plan clarification, and unfinished-session continuity.
- The upstream `to-issues` and `triage` flows assume issue-tracker setup details that this repo has not standardized yet, so the project-native versions need a draft-first posture instead of silent publication.

## Decision Log

- Decision: Keep the upstream skill names where they fit the user mental model, but rewrite the bodies for repo-native docs, harness, and verification behavior.
  Rationale: Reusing the recognizable names lowers discovery friction, while project-native bodies avoid stale upstream assumptions.
  Date/Author: 2026-05-28 / Codex

- Decision: Default `to-issues` to in-session slice drafting instead of GitHub issue creation.
  Rationale: The repo has a strong plan/harness workflow already, but no guaranteed issue-label automation contract in current docs.
  Date/Author: 2026-05-28 / Codex

## Outcomes & Retrospective

The workflow stack now has an explicit path for issue intake -> clarification -> planning -> slicing -> implementation -> unfinished-session handoff -> periodic architecture review. The main remaining gap is optional future standardization of real issue-tracker labels and publishing rules if the team wants GitHub issues to become a first-class artifact.

## Context and Orientation

- Entry router: `.agents/skills/using-skills/SKILL.md`
- Plan writer: `.agents/skills/writing-plans/SKILL.md`
- Skill-system overview: `.agents/README.md`
- Root repo contract: `AGENTS.md`
- Harness tracking: `harness/feature_index.json`, `harness/features/feat-074.json`, `harness/progress.md`

## Plan of Work (Narrative)

Add six new workflow-skill folders under `.agents/skills/`, each with a minimal frontmatter block and repo-native sections for when to use, when not to use, required reading, process, output contract, artifact rules, forbidden behavior, verification, and related skills. Then update the entry router and plan writer to mention the new transitions, update the top-level skill readme and AGENTS contract with one concise workflow-routing section, and finish by recording the change in the plan index and harness artifacts.

## Concrete Steps (Commands)

Run from repo root:

```bash
python3 -m json.tool harness/feature_index.json >/dev/null
python3 -m json.tool harness/features/feat-074.json >/dev/null
rg -n "grill-with-docs|to-issues|triage|prototype|handoff|improve-codebase-architecture" .agents/README.md AGENTS.md .agents/skills/using-skills/SKILL.md .agents/skills/writing-plans/SKILL.md
./init.sh
```

Expected short outputs:
- JSON validation prints nothing and exits `0`
- `rg` prints the expected wiring points
- `./init.sh` ends with `Done!`

## Validation and Acceptance

- The six new skill folders exist under `.agents/skills/` with valid `SKILL.md` files.
- `using-skills` names the new routing points.
- `writing-plans` references the new pre-plan and post-plan companions.
- `.agents/README.md` and `AGENTS.md` explain the workflow integration in repo language.
- Harness and plan artifacts record the change and verification evidence.

## Idempotence & Recovery

This change is safe to re-run. It touches docs and skill instructions only. Recovery is a normal git revert or follow-up patch if wording needs refinement.

## Artifacts and Notes

- New skills are docs-only and do not change application runtime behavior.
- The main acceptance artifact is the new skill routing visible in repo-owned workflow docs.

## Interfaces & Dependencies

- Depends on the existing `using-skills`, `writing-plans`, and harness workflow.
- Depends on the repo's doc architecture and `harness/session-handoff.md` contract.
- No external services or runtime libraries are introduced.
