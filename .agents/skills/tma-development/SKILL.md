---
name: tma-development
description: Build and maintain this repo's Telegram Mini App (TMA) client. Use when tasks mention `apps/tma`, Telegram Mini Apps/TMA, launch-context auth, `@tma.js/sdk-react`, `BackButton`/`BottomButton`, `startapp`/`startattach` deep links, safe-area or keyboard hardening, or bot companion flows tied to the Mini App.
---

# TMA Development

Use this skill for repo-specific Telegram Mini App work. It keeps terminology, package choice, session model, and doc routing aligned with this repo.

## When to use

- Any task touching `apps/tma`
- Any request mentioning Telegram Mini Apps, TMA, launch context, `BackButton`, `BottomButton`, haptics, `startapp`, `startattach`, safe areas, fullscreen, or keyboard overlap
- TMA auth, session, deep-link, or bot-boundary planning
- TMA docs, scaffold, or hardening work

## When not to use

- `apps/web` work with no TMA impact
- Worker changes unrelated to TMA
- Generic Telegram bot chat automation that does not launch or support the Mini App

## First steps

1. Normalize wording: interpret any old Telegram Mini App terminology as TMA.
2. Read `docs/TMA.md`.
3. Read only the exact leaf docs needed under `docs/references/frontend/tma/*`.
4. If the task is scaffold/bootstrap work, read `docs/exec-plans/plans/2026-06-02-telegram-mini-app-runtime-scaffold.md`.
5. If the task touches auth or worker boundaries, also read `docs/product-specs/shared/authentication-session.md`, `docs/product-specs/tma/launch-and-auth.md`, and `docs/references/frontend/tma/auth-and-bot-pattern.md`.

## Locked defaults

- Use `apps/tma`, never the old app path.
- Use `@tma.js/sdk-react` as the primary React-facing package.
- Do not introduce alternate Telegram Mini App package families into the repo.
- Cold-open auth exchanges Telegram launch context with the worker on each supported open.
- Keep the access token memory-only. Persist the refresh token in `SecureStorage` only when supported; otherwise keep the session memory-only.
- Default bot companion shape is worker-first behind an explicit adapter boundary.

Read `references/locked-defaults.md` when package, session, or bot decisions matter.

## @tma.js/sdk — cách sử dụng đúng

> Đây là kiến thức rút ra từ thực tế trong repo này. Đọc phần này trước khi chạm bất kỳ file nào trong `apps/tma/src/lib/telegram/` hoặc `apps/tma/src/app/bootstrap/`.

### Nguyên tắc bắt buộc

1. **Import trực tiếp từ package, không dùng `window.Telegram.WebApp`**

   ```ts
   // ❌ SAI — không bao giờ dùng
   window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
   window.Telegram?.WebApp?.BackButton?.show()
   window.Telegram?.WebApp?.MainButton?.show()

   // ✅ ĐÚNG
   import { hapticFeedback, backButton, mainButton } from '@tma.js/sdk'
   hapticFeedback.impactOccurred.ifAvailable('light')
   backButton.show.ifAvailable()
   mainButton.setParams({ isVisible: true })
   ```

2. **Gọi `init()` trước tất cả mọi thứ — ở module level, trước `render()`**

   SDK không có side effect khi import. Phải gọi `init()` tường minh. Phải gọi ở `main.tsx` trước `createRoot().render()`, không phải bên trong `useEffect`.

   ```ts
   // main.tsx
   import { initTelegram } from './app/bootstrap/telegram-init'

   // ✅ Gọi trước render — SDK available ngay khi component đầu tiên mount
   const telegramCleanup = initTelegram()

   createRoot(rootElement).render(<App telegramCleanup={telegramCleanup} />)
   ```

   ```ts
   // ❌ SAI — gọi trong useEffect: chạy SAU render đầu tiên → auth bootstrap đọc initData sẽ thấy null
   useEffect(() => {
     cleanup = initTelegram()
   }, [])
   ```

3. **Thứ tự mount bắt buộc trong `initTelegram()`**

   ```ts
   // 1. init() — phải đầu tiên
   const cleanup = init({ acceptCustomStyles: true })

   // 2. themeParams — phải trước miniApp và mainButton
   themeParams.mount()

   // 3. miniApp — phải sau themeParams
   miniApp.mount()

   // 4. bindTheme() — phải SAU khi themeParams và miniApp đã mount
   bindTheme()

   // 5. miniApp.ready — báo Telegram ẩn loading screen
   miniApp.ready.ifAvailable()

   // 6. viewport — async
   viewport.mount().then(() => {
     viewport.expand()
     viewport.requestFullscreen.ifAvailable()
   })

   // 7. swipeBehavior
   swipeBehavior.mount()
   swipeBehavior.disableVertical.ifAvailable()

   // 8. initData — restore từ launch params
   initData.restore()
   ```

4. **Dùng `.ifAvailable()` thay vì gọi trực tiếp**

   Phương thức này tự kiểm tra: TMA environment + SDK initialized + method supported + component mounted. Không cần thêm guard thủ công.

   ```ts
   // ✅ An toàn
   backButton.show.ifAvailable()
   hapticFeedback.impactOccurred.ifAvailable('medium')
   miniApp.ready.ifAvailable()

   // Khi cần biết kết quả quan trọng thì kiểm tra trước
   if (backButton.show.isAvailable()) {
     backButton.show()
   }
   ```

5. **Guard `mount()` bằng `isMounted()` để tránh double-mount**

   ```ts
   // ✅ Khi mount trong helper function (không phải initTelegram)
   if (!backButton.isMounted()) backButton.mount()
   if (!themeParams.isMounted()) themeParams.mount()
   if (!mainButton.isMounted()) mainButton.mount()
   ```

6. **`mainButton` cần `themeParams` mount trước**

   ```ts
   // ✅ ĐÚNG — themeParams trước
   themeParams.mount()
   mainButton.mount()
   mainButton.setParams({ text: 'OK', isVisible: true })
   ```

7. **`initData` dùng signal, không phải object thông thường**

   ```ts
   import { initData } from '@tma.js/sdk'

   // Gọi initData.restore() ở module level sau init()
   initData.restore()

   // Đọc user info qua signal (gọi như function)
   const user = initData.user()           // User | undefined
   const lang = initData.user()?.language_code  // chú ý: snake_case
   const raw  = initData.raw()            // string | undefined
   ```

8. **Đọc raw init data cho auth exchange**

   ```ts
   import { retrieveRawInitData } from '@tma.js/sdk'

   // Chỉ hoạt động sau khi init() đã được gọi
   const raw = retrieveRawInitData() // string | undefined
   ```

### Mapping cũ → mới

| `window.Telegram.WebApp.*` (cũ, sai) | `@tma.js/sdk` (mới, đúng) |
|---|---|
| `.HapticFeedback.impactOccurred(s)` | `hapticFeedback.impactOccurred.ifAvailable(s)` |
| `.HapticFeedback.notificationOccurred(t)` | `hapticFeedback.notificationOccurred.ifAvailable(t)` |
| `.HapticFeedback.selectionChanged()` | `hapticFeedback.selectionChanged.ifAvailable()` |
| `.BackButton.show()` / `.hide()` | `backButton.show.ifAvailable()` / `backButton.hide.ifAvailable()` |
| `.BackButton.onClick(fn)` | `backButton.onClick(fn)` → returns `offClick` fn |
| `.MainButton.show()` / `.hide()` | `mainButton.setParams({ isVisible: true/false })` |
| `.MainButton.setText(t)` | `mainButton.setParams({ text: t })` |
| `.MainButton.onClick(fn)` | `mainButton.onClick(fn)` → returns `offClick` fn |
| `.ready()` | `miniApp.ready.ifAvailable()` |
| `.expand()` | `viewport.expand()` (sau `viewport.mount()`) |
| `.requestFullscreen()` | `viewport.requestFullscreen.ifAvailable()` |
| `.disableVerticalSwipes()` | `swipeBehavior.disableVertical.ifAvailable()` |
| `.close()` | `miniApp.close.ifAvailable()` |
| `.safeAreaInset` | `viewport.safeAreaInsets()` |
| `.contentSafeAreaInset` | `viewport.contentSafeAreaInsets()` |
| `.themeParams` | `themeParams.bindCssVars()` hoặc `themeParams.bgColor()` v.v. |
| `.initData` (raw string) | `retrieveRawInitData()` |
| `.initDataUnsafe.user.language_code` | `initData.user()?.language_code` |

### Tham khảo local docs

Repo đã fetch docs của SDK về `docs/library/tma-js-sdk/`. Đọc ở đây trước khi ra ngoài:

- `docs/library/tma-js-sdk/initializing.md` — `init()` options
- `docs/library/tma-js-sdk/usage-tips.md` — mount flow, ifAvailable pattern
- `docs/library/tma-js-sdk/features/back-button.md`
- `docs/library/tma-js-sdk/features/haptic-feedback.md`
- `docs/library/tma-js-sdk/features/main-button.md`
- `docs/library/tma-js-sdk/features/mini-app.md`
- `docs/library/tma-js-sdk/features/swipe-behavior.md`
- `docs/library/tma-js-sdk/features/viewport.md`
- `docs/library/tma-js-sdk/features/init-data.md`
- `docs/library/tma-js-sdk/features/theme-params.md`

## Task map

- Scaffold/bootstrap: read `references/task-map.md` section `feat-079`.
- Auth/session: read `references/task-map.md` section `feat-080`.
- Expense flow, invite flow, read surfaces, hardening, and bot companion: read the matching `feat-08x` section there before planning or coding.

## Repo workflow

- Before editing functions, classes, or methods, run the required GitNexus impact checks from `AGENTS.md`.
- Keep TMA code separate from `apps/web`; do not import web UI or feature code into `apps/tma`.
- Use SPA routing only; `window.location` route changes are a bug for TMA flows.
- Update harness records and `harness/progress.md` when the session changes repo truth.
- Use `verification-before-completion` before any done or ready claim.

## Forbidden behavior

- Do not reintroduce old terminology, old paths, or alternate Telegram Mini App package families.
- Do not persist auth tokens in `DeviceStorage` or `localStorage`.
- Do not bypass the shared worker auth/session lifecycle.
- Do not broaden docs reading to whole trees when `docs/TMA.md` already routes exact leaves.
- Do not treat bot chat as the primary CRUD UI.

## Output format

When useful, summarize TMA work in this compact form:

```text
TMA check:
- Slice:
- Docs read:
- Defaults preserved:
- Open decision:
- Verification:
```

## Verification expectations

- Docs-only: validate touched JSON or harness files, run `./scripts/check_harness_size.sh`, `git diff --check`, and final `gitnexus_detect_changes`.
- Runtime code: use `./init.sh <param>` for scoped checks and full `./init.sh` only when repo rules require it.

## Related skills

- `using-skills`
- `grill-with-docs`
- `writing-plans`
- `skill-maintenance`
- `verification-before-completion`
