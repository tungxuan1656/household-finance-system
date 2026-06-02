# TWA development and hardening pattern

Canonical dev-loop and QA rules for Telegram Mini App runtime work.

## Scope

Use this doc for:

- local development setup
- Telegram test environment usage
- debugging on device
- performance and compatibility hardening

## Local development rules

- Production Mini App entry points should use HTTPS.
- Local development may use either:
  - Telegram test environment with direct HTTP/IP access
  - a tunnel that gives the local Vite app an HTTPS URL
- Pick one per task. Do not keep both half-configured.

## Environment rules

- Keep dev, test, and production bot/app URLs explicit.
- Do not overwrite production bot settings for throwaway local experiments without recording it.
- If a task depends on version-specific Telegram APIs, record the minimum client version in the feature evidence.

## Debugging rules

- Verify in real Telegram WebView surfaces, not only Safari/Chrome mobile emulation.
- Use lightweight in-app debug tooling only behind dev flags.
- Prefer platform inspectors when available: Android WebView inspect, iOS Web Inspector, Telegram desktop/dev tools.
- Remove temporary debug overlays and logs in the same task that added them.

## Performance rules

- Optimize startup first: small bootstrap, deferred heavy routes, no unnecessary auth-time waterfalls.
- Degrade gracefully on weak devices and older Telegram versions.
- Treat WebView jank as a release blocker for primary flows such as launch, add expense, and invite accept.

## Compatibility rules

- Gate advanced capabilities behind explicit support checks.
- Newer APIs such as `SecureStorage`, `DeviceStorage`, or keyboard helpers need fallback behavior.
- Keep fallback ownership in adapters or shells, not duplicated across feature pages.

## QA matrix

Check at least:

- iOS Telegram
- Android Telegram
- light and dark theme
- supported and unsupported storage capability paths
- launch with and without supported deep-link intent
- keyboard overlap on the main form flows
- low-end or reduced-performance device behavior

## Release checklist

- No full-page reloads between TWA routes.
- `BackButton` and `BottomButton` behave correctly across key flows.
- Theme and safe-area handling work across iOS and Android.
- Auth failure, invite failure, and storage-fallback states are actionable.
- Performance evidence exists for first open and expense-capture flow.

## Evidence rules

- Record which Telegram client/platform/version was checked.
- Record whether the run used tunnel HTTPS or Telegram test environment.
- Record unsupported-capability fallback behavior, not only happy path screenshots.
