# Tech Debt Tracker

Use this file for debt that is real, acknowledged, and intentionally deferred.

| Date | Area | Debt | Why Deferred | Risk | Next Trigger |
|------|------|------|--------------|------|--------------|
| YYYY-MM-DD | `[area]` | `[debt]` | `[reason]` | `[risk]` | `[when to revisit]` |
| 2026-04-28 | `worker/household-permissions` | Add per-household settings flags that allow members to invite others or manage groups without full admin role | `feat-015a` is scoped to reusable role-enforcement infrastructure first; the product docs do not yet define schema/API ownership for configurable member permissions | Medium — future invitation/group routes would otherwise overfit admin-only defaults | When starting `feat-012`, `feat-013`, or `feat-022` implementation |
| 2026-04-20 | `worker/auth` | Implement Firebase ID token verification in Cloudflare Worker using `jose` + JWKS (avoid Firebase Admin SDK) | Deferred for later — prefer lightweight JWKS verification in Worker when ready | Medium — server-side tokens not verified until implemented; potential spoofing risk | When starting auth integration / before shipping auth-dependent features |
