# Telegram Bot Settings

## Purpose / Big Picture

Add `/settings` so linked users can control bot notification preferences from chat. This is separate from delivery; it only stores and displays preferences.

## Scope

In scope:

- `/settings` command.
- Toggle budget alerts, household activity, and weekly digest.
- Defaults: budget alerts on, household activity off, weekly digest off.

Out of scope:

- Quiet hours.
- Mute all.
- Daily/monthly digest.
- TMA settings page.
- Sending notifications.

## Required Standards / References

- `docs/product-specs/tma/telegram-bot-companion.md`
- `docs/product-specs/shared/notification-system.md`
- `docs/references/backend/architecture-and-boundaries.md`

## Non-negotiable Requirements

- Unlinked users cannot change settings; show open-app guidance.
- Preferences are scoped to current Telegram chat/user mapping.
- Defaults match product spec.

## Progress

- [ ] Add settings command renderer.
- [ ] Add preference toggle callback handling.
- [ ] Extend repository tests for defaults and updates.
- [ ] Add integration tests and update harness evidence.

## Context and Orientation

- Bot chat preferences live in `telegram_bot_chats` from foundation plan.
- Bot command dispatcher lives under `apps/worker/src/bot/service.ts`.

## Plan of Work

1. Add `apps/worker/src/bot/commands/settings.ts`.
2. Reuse `telegram-bot-chat-repository.ts` to read/update preferences.
3. Add buttons for:
   - budget alerts on/off.
   - household activity on/off.
   - weekly digest on/off.
4. Update `/help` command text if needed.
5. Add tests for defaults, toggles, user scoping, and unlinked behavior.

## Concrete Steps (Commands)

```bash
./init.sh typecheck
./init.sh test
```

## Validation and Acceptance

- `/settings` shows all three preferences.
- Budget alerts default on.
- Household activity default off.
- Weekly digest default off.
- Toggle updates persist for the linked chat.
- `./init.sh typecheck` and `./init.sh test` pass.

## Idempotence & Recovery

- Repeated toggle callbacks settle to intended state without corrupting other prefs.

## Risks / Blockers

- TMA settings page is not implemented; bot must not link to a missing full settings screen unless added later.
