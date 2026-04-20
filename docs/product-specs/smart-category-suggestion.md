# Smart Category Suggestion

## Goal

Provide optional ML-assisted suggestions for categorizing expenses to reduce manual work and improve data quality (Phase 2 feature).

## Entry Conditions

- User creates or edits an expense and has enabled suggestions for their household or account.

## User Flow

1. As the user types a note or enters merchant/amount, the system suggests one or more categories ranked by confidence.
2. User can accept a suggestion, reject it, or choose another category manually.
3. Rejected suggestions feed a feedback signal to improve the model.

## Acceptance Criteria

- Suggestions are reasonably accurate (baseline metric to be defined) and optionally shown with confidence scores.
- User feedback (accept/reject) is recorded for model improvement.
- Suggestions do not override user selection automatically; they are only recommendations.

## Failure States

- Suggestion service unavailable: UI falls back to manual category selection.
- Poor suggestion quality: allow household opt-out and provide a way to report issues.

---

Notes:
- Phase 2: start with server-side heuristics (merchant->category mapping) before full ML models.
- Respect privacy: run models on server with aggregated data, or consider on-device models for privacy-sensitive households.