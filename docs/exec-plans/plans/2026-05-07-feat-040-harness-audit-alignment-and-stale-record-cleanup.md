# feat-040 — Harness audit alignment & stale feature record cleanup

## Title

Realign harness records with the implemented product state and standardize feature-status semantics.

## Purpose / Big Picture

Implement a tooling/docs-only harness cleanup pass so engineers and coding agents can trust the repository state before continuing deeper product-gap work. Users will not see new product UI, but maintainers will observe that stale feature records no longer describe placeholder behavior that has already been implemented, status vocabulary is consistent across `harness/feature_index.json` and `harness/features/*.json`, and evidence fields better describe what was actually delivered.

This plan exists because the repo audit found harness drift after a broad implementation wave: some feature files still describe older partial states, some evidence is too vague to act as operational truth, and `feat-029` still uses `completed` while the feature index largely uses `done`. The result should be a trustworthy harness baseline for future execution plans and multi-session work.

## Scope

- Planned tooling/docs areas:
  - `harness/feature_index.json`
  - `harness/features/feat-011.json`
  - `harness/features/feat-029.json`
  - `harness/features/feat-037.json`
  - `harness/features/feat-040.json`
  - Additional `harness/features/*.json` only if implementation confirms they have the same stale-description or status-vocabulary issue discovered in the audit.
  - `harness/progress.md`
  - `docs/exec-plans/index.md`
  - `docs/exec-plans/plans/2026-05-07-feat-040-harness-audit-alignment-and-stale-record-cleanup.md`
- Continuity and reference inputs:
  - `AGENTS.md`
  - `ARCHITECTURE.md`
  - `docs/PLANS.md`
  - `docs/knowledge/harness-engineering.md`
  - `docs/knowledge/codex-exec-plan.md`
  - `docs/references/index.md`
  - Existing completed ExecPlans and progress entries that describe the implemented features now considered canonical evidence.

Out of scope for this plan:

- Any new frontend or backend product behavior.
- Rewriting historical progress entries to match a new style unless they are required as evidence sources for touched features.
- Broad renumbering or reordering of existing feature IDs.
- Creating new harness subsystems or replacing the current harness structure.
- Changing completed feature scope beyond aligning wording with already-implemented behavior.
- Retroactively adding tests or product code changes purely to justify harness wording.

## Non-negotiable Requirements

- The plan must stay self-contained and executable by a human or coding agent without hidden assumptions.
- `feat-040` must remain tooling/docs scoped: no product behavior changes are allowed in this execution.
- Status vocabulary must be normalized intentionally. If `done` is the canonical completed state in `harness/feature_index.json`, touched per-feature files must match it unless a documented exception is introduced.
- Updated feature descriptions must describe the implemented product state as of today, not only the moment an older feature first landed.
- Evidence fields for touched features must point to concrete proof already in-repo: files, tests, verification commands, progress entries, or completed ExecPlan outcomes.
- The cleanup must be surgical: touch only stale or inconsistent harness records discovered by audit evidence.
- Plan and harness continuity artifacts must be updated together: `docs/exec-plans/index.md`, `harness/progress.md`, and the relevant feature records.

## Progress

- [x] 2026-05-07 00:00 UTC — Reviewed audit findings, planning docs, harness state, and related feature records (`feat-011`, `feat-029`, `feat-030`, `feat-037`, `feat-040`). Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Locked scope as `tooling/docs` only with no frontend/backend implementation work. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Register active ExecPlan and leave implementation-ready current step for `feat-040`. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Audit candidate stale harness records affected by the repository review and confirm that `feat-011`, `feat-029`, and `feat-037` need wording/evidence/status normalization updates. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Update selected harness feature files and `harness/feature_index.json` so descriptions, statuses, and evidence reflect current implemented reality. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Run harness verification plus full repo verification, then record evidence and mark plan/index status complete. Owner: Orchestrator.

## Surprises & Discoveries

- `harness/features/feat-011.json` still says household members are placeholders and real invitation/member APIs do not exist, but current implemented code and later features clearly provide those flows.
- `harness/features/feat-029.json` uses `status: "completed"` while the feature index and most other feature files use `done`.
- `harness/features/feat-037.json` is technically correct at a headline level but its evidence (`profile-settings-page.tsx refactored and uses Cloudinary`) is too thin to serve as strong operational proof.
- `feat-040` itself depends on already-completed features, so its own record should remain the source of truth for why this cleanup exists rather than being rewritten into implementation evidence before the cleanup is executed.

## Decision Log

- Decision: Treat `feat-040` as `tooling/docs` domain work rather than frontend or backend work.
  Rationale: The requested outcome is harness trustworthiness — feature metadata, status semantics, evidence quality, and planning continuity — with no user-facing behavior changes.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Use existing completed progress entries and ExecPlans as canonical evidence sources when refreshing stale feature records.
  Rationale: The harness should reference already-verified implementation history instead of inventing new unverifiable summaries.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Normalize touched completed feature statuses to `done` unless a stronger repo-wide standard emerges during implementation.
  Rationale: `harness/feature_index.json` already uses `done` as the dominant completed-state vocabulary, so aligning touched per-feature files to that convention reduces ambiguity for future agents.
  Date/Author: 2026-05-07 / Orchestrator.

## Outcomes & Retrospective

- Target outcome: the harness once again acts as reliable repository truth for feature status, dependencies, and evidence, especially for areas surfaced as stale during the audit.
- Verification target: touched feature records describe the implemented product accurately, touched statuses are semantically aligned, `docs/exec-plans/index.md` tracks this plan under Completed after execution, and full repository verification still passes.
- Completed result: `feat-011` no longer implies invitation/member APIs are missing, `feat-029` now uses `done` with concrete evidence, `feat-037` evidence now points to recorded verification, `feat-040` and `harness/feature_index.json` are marked done, and `./init.sh` passed after the docs/harness-only cleanup.
- Expected follow-up: once `feat-040` is complete, subsequent roadmap work (`feat-041` onward) can rely on the harness without first re-auditing stale descriptions.

## Context and Orientation

- Harness source of truth:
  - `harness/feature_index.json` — top-level feature inventory and high-level status vocabulary.
  - `harness/features/*.json` — detailed per-feature descriptions, dependencies, evidence, and timestamps.
  - `harness/progress.md` — newest-first session log that often contains richer proof than old per-feature evidence fields.
- Planning source of truth:
  - `docs/PLANS.md` — plan lifecycle rules, required minimum sections, and active/completed index expectations.
  - `docs/exec-plans/__plan-template__.md` — canonical ExecPlan section structure.
  - `docs/exec-plans/index.md` — active/completed plan registry.
- Harness-governance references:
  - `docs/knowledge/harness-engineering.md` — five-subsystem harness model and why repo state must stay trustworthy.
  - `docs/knowledge/codex-exec-plan.md` — living-plan expectations, explicit commands, and evidence standards.
- Feature records directly implicated by audit findings:
  - `harness/features/feat-011.json` — stale household-detail description still claiming placeholder members and missing invitation/member APIs.
  - `harness/features/feat-029.json` — inconsistent completed-status vocabulary.
  - `harness/features/feat-037.json` — weak evidence string for a feature already implemented.
  - `harness/features/feat-040.json` — current roadmap record for this cleanup feature.
- Canonical historical implementation evidence likely to be reused:
  - `docs/exec-plans/plans/2026-04-29-feat-013-household-invitations.md`
  - `docs/exec-plans/plans/2026-04-29-feat-014-household-membership-actions-and-015b-ui-affordances.md`
  - `docs/exec-plans/plans/2026-05-05-feat-029-analytics-comparisons-breakdowns.md`
  - `docs/exec-plans/plans/2026-05-06-feat-030-new-user-onboarding-flow.md`
  - progress entries in `harness/progress.md` describing completed implementation and verification.

## Standards and Implementation Notes

### Required references for implementation

- Planning and harness governance docs:
  - `docs/PLANS.md`
  - `docs/exec-plans/__plan-template__.md`
  - `docs/exec-plans/index.md`
  - `docs/knowledge/harness-engineering.md`
  - `docs/knowledge/codex-exec-plan.md`
  - `docs/references/index.md`

### Concrete coding constraints derived from standards matrix

- Keep the change within the harness/tooling surface only; do not touch `apps/web`, `apps/worker`, migrations, or runtime code.
- Preserve existing JSON schema shape for harness feature files: `id`, `name`, `description`, `dependencies`, `status`, `evidence`, `updated_at`.
- Use concrete, auditable wording in `description` and `evidence`; avoid placeholders like “refactored” or “improved” without naming observable outcomes.
- Prefer references to already-completed verification commands and plan/progress evidence over freeform claims.
- Keep `harness/progress.md` newest-first and document this session as plan creation for `feat-040`.
- Keep `docs/exec-plans/index.md` as the single source of plan status; add this plan under `Active` without moving other plan files.

### Implementation Notes

- Mandatory patterns for this scope:
  - Treat the harness as repo truth, not a marketing summary. If a description is historically accurate but operationally stale, update it to reflect current implemented reality.
  - Prefer minimal touched surface: only records proven stale or semantically inconsistent should change.
  - Use prior completed ExecPlans and progress log entries as evidence anchors for rewritten descriptions and evidence fields.
- Companion skills for implementation:
  - `test-driven-development` for disciplined change sequencing even in docs-focused work.
  - `verification-before-completion` for explicit command execution and evidence capture.
  - `requesting-code-review` for final quality review of touched harness artifacts.
  - `typescript-reviewer` is not required because no TypeScript/JavaScript code should change in this feature.
- Common pitfalls to avoid:
  - Do not silently broaden the cleanup into unrelated feature rewrites.
  - Do not normalize every historical style difference if it was not part of the audit finding.
  - Do not leave `feat-040` marked complete without strong evidence and full verification.

## Interfaces & Dependencies

- Internal dependencies:
  - `harness/feature_index.json` defines the canonical high-level status list consumed by future sessions.
  - `harness/features/*.json` provide detailed per-feature operational context and evidence.
  - `harness/progress.md` provides session continuity and often the strongest concrete evidence for completed features.
  - `docs/exec-plans/index.md` is the plan-lifecycle registry required by `docs/PLANS.md`.
- No external library or service dependencies are expected for implementation.
- Layer impact check using `Types -> Config -> Repo -> Service -> Runtime -> UI` from `ARCHITECTURE.md`:
  - `Types`: unchanged; no shared runtime type design changes.
  - `Config`: harness metadata files only.
  - `Repo`: unchanged; no data-access modifications.
  - `Service`: unchanged.
  - `Runtime`: unchanged.
  - `UI`: unchanged.
- Hard dependency rule checks:
  - Lower layers remain untouched.
  - UI/runtime/service boundaries remain untouched because this feature does not modify product code.
  - No new dependencies should be introduced for a docs/harness cleanup.

## Plan of Work (Narrative)

1. **Confirm candidate stale records from audit evidence.** Re-read the specific feature files called out during the audit and compare them against their corresponding completed ExecPlans and progress entries. The goal is to prove which descriptions are operationally stale, which evidence strings are too weak, and whether any status values diverge from the repository’s prevailing convention.

2. **Normalize status semantics with the smallest possible surface.** Update `harness/features/feat-029.json` and any other touched completed feature files that still use a non-canonical completed-state vocabulary so they match the status semantics already used by `harness/feature_index.json`. If implementation discovers a stronger repo-wide standard than `done`, stop and record the decision before broadening changes.

3. **Refresh stale descriptions to match current implemented reality.** Rewrite `harness/features/feat-011.json` and any similarly proven stale records so the description reflects what the product actually supports now — for example real household invitations and member-management flows — while still naming the original feature boundary and any intentionally deferred scope.

4. **Strengthen evidence fields using existing proof.** Replace weak evidence strings in touched feature files with concise but concrete proof that points to completed plan outcomes, tests, or verification commands already recorded in `harness/progress.md` and prior ExecPlans. Do not fabricate new proof.

5. **Close the loop in planning and harness continuity.** Update `harness/features/feat-040.json`, `harness/feature_index.json` if status changes are needed during execution, `harness/progress.md`, and `docs/exec-plans/index.md` so the plan lifecycle and harness state stay synchronized.

6. **Verify the harness remains restartable.** Run targeted harness checks and the standard `./init.sh` path so this docs/governance cleanup still satisfies the repository’s definition of done.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline verification before touching harness records
./init.sh

# Review current plan and harness diffs during implementation
git diff -- docs/exec-plans/index.md docs/exec-plans/plans/2026-05-07-feat-040-harness-audit-alignment-and-stale-record-cleanup.md harness/feature_index.json harness/features/feat-011.json harness/features/feat-029.json harness/features/feat-037.json harness/features/feat-040.json harness/progress.md

# Final full verification required by AGENTS.md
./init.sh
```

Expected short outputs to compare against:

- `./init.sh` completes with install/harness checks/lint/type-check/tests/build succeeding.
- `git diff -- ...` shows only docs/harness file changes for this feature.

## Validation and Acceptance

- Happy path — harness trust restored:
  - `harness/features/feat-011.json` no longer claims member/invitation APIs are missing if they are already implemented.
  - `harness/features/feat-029.json` uses the normalized completed status vocabulary adopted by the feature index.
  - `harness/features/feat-037.json` and other touched records include stronger concrete evidence text.
  - `docs/exec-plans/index.md` lists this plan under `Active` while work is still ongoing.
- Validation/error path:
  - If audit evidence cannot justify changing a record, leave it untouched and record the ambiguity in `Surprises & Discoveries` or `Decision Log` instead of guessing.
  - If a touched record depends on a disputed status vocabulary, document the chosen canonical term before applying it.
- Unauthorized/forbidden:
  - Not applicable; this feature does not expose runtime auth surfaces.
- Regression checks:
  - `./init.sh` still passes, proving the harness/doc cleanup did not destabilize repository verification.
- Acceptance artifact:
  - Final `git diff` limited to the expected docs/harness files plus successful `./init.sh` transcript captured in progress/evidence.

## Idempotence & Recovery

- All plan and harness file edits are safe to re-run because they are deterministic text updates.
- If a rewritten feature description proves misleading, recover by checking the prior completed ExecPlan and `harness/progress.md`, then adjusting the wording without changing product code.
- If broader cleanup starts to sprawl, revert to the last committed docs/harness state and re-apply only the records explicitly named in this plan.

## Artifacts and Notes

- Expected artifacts after execution:
  - Updated harness feature records with normalized statuses and stronger evidence.
  - Updated `harness/progress.md` entry describing feat-040 completion and verification.
  - Updated `docs/exec-plans/index.md` status placement.
  - A commit containing only docs/harness changes for this feature.

## Risks and Blockers

- Risk: historical feature descriptions may mix original scoped intent with later follow-up reality, making it easy to accidentally overstate the feature.
  - Mitigation: anchor wording to current implemented behavior while still naming scope boundaries and follow-up ownership where relevant.
- Risk: status normalization could expand into a broad repo-wide style cleanup.
  - Mitigation: normalize only records directly implicated by the audit or touched for evidence refresh.
- Risk: weak or missing historical evidence may tempt guesswork.
  - Mitigation: use completed progress entries and ExecPlans as the only accepted proof sources.
- Blocker threshold: if a touched record cannot be updated confidently from in-repo evidence, pause and ask instead of rewriting by assumption.

## Open Decisions

- Does `done` remain the canonical completed-state vocabulary for all touched per-feature files, or is there a documented reason to preserve mixed `completed`/`done` semantics?
- Should `feat-040` also strengthen weak evidence for additional already-completed features beyond the audit’s named set if they are discovered during implementation, or should that remain a follow-up?
