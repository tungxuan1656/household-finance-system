# Tech Debt Register

Concise register of still-open, actionable debt. Revisit each item at the trigger below; plan history stays in Git.

| Area | Debt | Impact | Owner/source | Next review action |
|------|------|--------|--------------|-------------------|
| `tma/bot-deep-links` | Exact bot-to-TMA deep links for expense, budget, household, group, and bot-settings details remain incomplete. | Medium — users may need extra taps after bot actions. | TMA/bot; carried from feat-121/Telegram bot slices. | Review after `/ai`, `/stats`, `/budget`, `/top`, and `/settings` work end-to-end. |
| `worker/invitations` | Add invite-generation rate limiting per actor and/or household. | Medium — automated traffic could spam invite generation. | Worker invitations; source: household invitation implementation. | Review before production hardening or release of household invitations. |
| `worker/household-permissions` | Add configurable per-household permissions for member invites and group management. | Medium — routes remain limited to admin defaults. | Worker permissions; source: role-permission implementation. | Review when invitation, household settings, or group-management work starts. |
| `worker/expenses-schema` | Replace legacy household-scoped category persistence with key-based storage aligned to the global category catalog. | High — expense, budget, and analytics writes can drift from catalog truth. | Worker data layer; source: category reference-data implementation. | Review before the first worker category write path or category-based budget/analytics endpoint. |
| `worker/auth` | Implement Firebase ID-token verification in the Worker with `jose` and JWKS. | Medium — server-side Firebase tokens are not yet verified by the intended lightweight Worker path. | Worker auth; source: authentication/session implementation. | Review at auth integration and before shipping auth-dependent features. |
