# Tech Debt Tracker

Use this file for debt that is real, acknowledged, and intentionally deferred.

| Date | Area | Debt | Why Deferred | Risk | Next Trigger |
|------|------|------|--------------|------|--------------|
| YYYY-MM-DD | `[area]` | `[debt]` | `[reason]` | `[risk]` | `[when to revisit]` |
| 2026-04-20 | `worker/auth` | Implement Firebase ID token verification in Cloudflare Worker using `jose` + JWKS (avoid Firebase Admin SDK) | Deferred for later — prefer lightweight JWKS verification in Worker when ready | Medium — server-side tokens not verified until implemented; potential spoofing risk | When starting auth integration / before shipping auth-dependent features |
