# Mono-Repo Architecture Audit

Scope: workspace layout, shared-code surface, tooling config, CI, conventions, security nits. Each finding lists location, evidence, impact, fix options. Last audit: 2026-06-12.

## 0. Topology (current)

```
household-finance-system/
├── apps/
│   ├── web/        Next.js 15 + React 19 (axios client)
│   ├── tma/        Vite SPA + React 19 (fetch client)
│   └── worker/     Cloudflare Workers + Hono + D1 (zod contracts)
├── pnpm-workspace.yaml   →   'apps/*'   (no 'packages/*')
├── package.json         root scripts fan-out per app
├── init.sh              custom orchestrator (install + parallel lint/tc/test)
├── docs/references/{backend,frontend,shared}/...
├── harness/             feature_index.json + features/*.json + progress.md
└── .github/workflows/   verify-code.yml, harness-size-check.yml
```

Three apps, three independent toolchains (Next.js, Vite, Wrangler), one custom bash orchestrator. No shared package, no Turborepo/Nx, no Changesets.

---

## A. Findings — Severity High (correctness, contract, security)

### A1. DTO contracts are 3-way duplicated and not in sync

Worker là single source of truth cho API contract (zod schemas + DTO interfaces in `apps/worker/src/contracts/`), nhưng web/tma đều **re-type** lại thủ công. Khi worker đổi field, 2 client drift mà không ai hay.

Evidence:

| Contract | Worker (truth) | Web (copy) | TMA (copy) |
|---|---|---|---|
| `AuthenticatedUser` | `apps/worker/src/contracts/auth.ts:44-50` (`AuthenticatedUserDTO`, provider: `'firebase' \| 'telegram'`) | `apps/web/src/features/auth/types/auth.ts:3-9` (`AuthenticatedUserDTO`, provider: `'firebase'` — **HẸP hơn truth**) | `apps/tma/src/lib/auth/api.ts:3-9` (`AuthenticatedUser`, provider: `'firebase' \| 'telegram'`) |
| `ExchangeProviderRequest` | `apps/worker/src/contracts/auth.ts:17-32` (zod discriminated union) | `apps/web/src/features/auth/types/auth.ts:11-14` (interface, **không phải union**) | `apps/tma/src/lib/auth/api.ts:11-13` (union, gần đúng) |
| `ExchangeProviderResponse` | `apps/worker/src/contracts/auth.ts:52-59` | `apps/web/src/features/auth/types/auth.ts:16-23` | `apps/tma/src/lib/auth/api.ts:15-22` |
| `RefreshSessionResponse` | `apps/worker/src/contracts/auth.ts:61-67` | (web tự dùng token store, không có file riêng) | `apps/tma/src/lib/auth/api.ts:24-30` |
| `LogoutSessionResponse` | `apps/worker/src/contracts/auth.ts:69-71` | `apps/web/src/features/auth/types/auth.ts:25-27` | `apps/tma/src/lib/auth/api.ts:32-34` |
| `REFERENCE_CATEGORY_KEYS` (24 keys) | `apps/worker/src/contracts/reference-data.ts:9-34` (zod enum) | `apps/web/src/types/reference-data.ts:9-34` (`CATEGORY_KEYS`, **thủ công 100%**) | (TMA consume từ API runtime) |
| `REFERENCE_SOURCE_KEYS` (7 keys) | `apps/worker/src/contracts/reference-data.ts:36-44` | `apps/web/src/types/reference-data.ts:38-46` (`SOURCE_KEYS`) | (TMA consume từ API) |
| `ApiEnvelope<T>` | `apps/worker/src/lib/response.ts:30-37` | `apps/web/src/types/api.ts:24-38` | `apps/tma/src/lib/api/client.ts:8-24` (inline) |
| `ApiErrorCode` | `apps/worker/src/lib/errors.ts:8-18` (`ERROR_CODES`) | `apps/web/src/types/api.ts:1-9` (`API_ERROR_CODES` — **trùng nội dung, tên khác**) | (TMA dùng `string` — mất type safety) |

**Impact**:
- A1.a (security-leaning bug): Web's `AuthProvider` chỉ là `'firebase'`. Khi user login bằng Telegram, response trả về `provider: 'telegram'` → web typecheck pass vì khởi tạo qua generic, nhưng runtime narrow sẽ fail hoặc loại bỏ provider trong state.
- A1.b (drift): 24 category keys ở web phải sync thủ công với worker. Một PR thêm `'subscription'` ở worker mà quên web → web sẽ 500 khi render category lạ.
- A1.c (loose typing): TMA `AuthApiError.code: string` thay vì union → caller không exhaust được error cases.

**Fix options**:
1. **Move to `packages/contracts`** (Recommended). Tạo workspace package, copy `apps/worker/src/contracts/*` + `lib/errors.ts` (ERROR_CODES) + `lib/response.ts` (envelope) + `lib/i18n/locales.ts` (SupportedLocale). Worker consume; web + tma consume. `z.infer<>` cho DTO response thay vì viết interface song song (đã có sẵn pattern trong `expense-types.ts:15-17`).
2. **Symbolic export (lighter)**: Nếu không muốn tạo package, dùng `tsc --build` project reference trỏ từ web/tma vào `apps/worker/src/contracts` (chỉ export file types, không kéo theo hono/zod nặng).
3. **Generate from openapi/zod**: Dùng `zod-to-openapi` ở worker, sinh types client-side bằng `openapi-typescript`. Tốn setup, tốt khi muốn API doc.

### A2. `ApiEnvelope<T>` và error code không có shared test

Mỗi app tự verify cách parse envelope của riêng mình (web có `media.test.ts`, tma có không, worker chỉ test handlers). Nếu worker đổi shape envelope (e.g. thêm `meta.traceId`), 3 app đều vẫn pass test của mình cho đến khi runtime gọi.

**Fix**: Một bộ contract test (e.g. `packages/contracts/__tests__/envelope.test.ts`) kiểm tra:
- response 200 luôn có `{ success: true, data, error: null, meta }`
- response 4xx/5xx luôn có `{ success: false, data: null, error: { code, message, details? }, meta }`
- `code ∈ ErrorCode` exhaustive

### A3. Web `next.config.ts` cho phép mọi remote image host

`apps/web/next.config.ts:5-11`:
```ts
images: {
  remotePatterns: [{ hostname: '**', protocol: 'https' }],
}
```

**Impact**: Bất kỳ URL https nào cũng được Next.js `<Image>` optimize. Đây là SSRF surface kết hợp với user-controlled avatar URLs từ Cloudinary/Firebase. Nên whitelist cụ thể (`res.cloudinary.com`, `firebasestorage.googleapis.com`, …).

**Fix**: Replace `hostname: '**'` bằng danh sách cụ thể; gate qua env `NEXT_PUBLIC_IMAGE_HOSTS` (comma-separated).

### A4. `tsconfig` worker có `jsx: react-jsx` cho backend Hono

`apps/worker/tsconfig.json:5` set `jsx: react-jsx` — worker không render JSX. Setting thừa, dễ nhầm khi refactor; cũng làm TS check chậm hơn một chút.

**Fix**: Bỏ `"jsx"` khỏi `apps/worker/tsconfig.json`.

### A5. CI thiếu scope `apps/tma`

`.github/workflows/verify-code.yml:7-13` paths include `apps/web/**` + `apps/worker/**` — **không có `apps/tma/**`**. `scripts/detect_ci_scope.sh:20-33` cũng không có case `apps/tma/*`. Nghĩa là PR chỉ đổi TMA sẽ chạy CI rỗng, không lint/typecheck/test TMA.

**Fix**: Thêm `apps/tma/**` vào paths filter và vào case statement của `detect_ci_scope.sh`. Hiện tại init.sh đã chạy TMA, chỉ thiếu ở CI.

### A6. `packageManager` mismatch giữa root và worker

Root: `pnpm@10.28.1` (`package.json:31`). Worker: `packageManager: pnpm@10.12.1` (`apps/worker/package.json:5`). pnpm 10.12 thiếu nhiều cải tiến của 10.28 và có thể cảnh báo feature flag mismatch khi chạy `pnpm install` ở root.

**Fix**: Bỏ field `packageManager` khỏi các app `package.json` (root đã đủ). Hoặc pin tất cả về 10.28.1.

---

## B. Findings — Severity Medium (duplication, convention violation)

### B1. 3 ESLint configs gần như identical, copy-paste

`apps/web/eslint.config.mjs` (178 dòng), `apps/tma/eslint.config.mjs` (145 dòng), `apps/worker/eslint.config.mjs` (179 dòng) — **~80% rules giống nhau**, chỉ khác:
- web: thêm `@next/eslint-plugin-next` + `core-web-vitals`
- tma: bỏ next plugin
- worker: thêm `react-refresh` (dù Hono worker không cần react-refresh — bug khác: thừa dep)

Khi sửa rule chung (e.g. `padding-line-between-statements` ở L131-145 của cả 3 file), phải sync 3 chỗ.

**Fix**: Tạo `packages/eslint-config` (workspace package) với:
- `base.mjs` — shared plugins + rules (Prettier, simple-import-sort, unused-imports, unicorn, react, react-hooks, typescript-eslint, react-compiler)
- `next.mjs` — extends base + @next/next
- `react-vite.mjs` — extends base (TMA + worker nếu giữ react-refresh)

Mỗi app's `eslint.config.mjs` chỉ còn ~20 dòng: `import base from '@household/eslint-config/base'` + spread.

### B2. 3 Prettier configs, 2 identical, 1 khác

`apps/web/.prettierrc` (24 dòng) === `apps/tma/.prettierrc` (24 dòng). `apps/worker/.prettierrc` (22 dòng) — thiếu `tailwindStylesheet` + `tailwindFunctions` (đúng — worker không dùng Tailwind).

**Fix**: Move `.prettierrc` ra root (Prettier tự tìm `.prettierrc` walking up). Worker có thể dùng `prettier.config.cjs` ở root với override local nếu cần, hoặc dùng `prettier.config.mjs` chỉ định `tailwindStylesheet: undefined` cho worker qua env.

### B3. Không có root `tsconfig.base.json`

3 app `tsconfig.json` lặp `target`, `strict`, `esModuleInterop`, `isolatedModules`, `paths: { "@/*": ... }` — chỉ khác target/lib/jsx. Khi muốn bật `noUncheckedIndexedAccess` hay đổi `target`, phải sửa 3 file.

**Fix**: Tạo `tsconfig.base.json` ở root:
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "resolveJsonModule": true
  }
}
```
Mỗi app `extends: "../../tsconfig.base.json"` và chỉ override phần riêng.

### B4. API client pattern không thống nhất trong TMA, không thống nhất với web

- Web: `axios.create()` + interceptors (`apps/web/src/api/client.ts:211`) — 218 dòng.
- TMA main: native `fetch` + envelope parser (`apps/tma/src/lib/api/client.ts:116`) — 194 dòng.
- TMA auth: MỘT CLIENT THỨ HAI ở `apps/tma/src/lib/auth/api.ts:125` (`createAuthApiClient`) — 190 dòng, dùng `fetch` riêng, có timeout riêng, `AuthApiError` riêng.

3 implementation cùng làm 1 việc: parse `ApiEnvelope<T>`, throw `ApiClientError`, attach bearer token.

**Fix**: Sau khi có `packages/contracts`, tạo `packages/api-client`:
- `createApiClient({ baseUrl, fetchImpl?, accessTokenProvider? })` → trả `{ get, post, patch, delete }`
- Dùng chung `parseEnvelope` + `ApiClientError`
- Web wrap axios thành adapter cho cùng interface, hoặc bỏ axios hoàn toàn (axios không cần thiết nếu có fetch wrapper tốt — giảm bundle ~13KB).

### B5. TMA vi phạm type-naming-pattern.md

`docs/references/shared/type-naming-pattern.md:1-13` quy định:
- DTO objects: suffix `DTO`
- Request: suffix `Request`
- Response: suffix `Response`

TMA dùng `AuthenticatedUser` (thiếu DTO) ở `apps/tma/src/lib/auth/api.ts:3` và `apps/tma/src/features/auth/store.ts:16`. Worker + web đều dùng `AuthenticatedUserDTO`.

**Fix**: Khi move contracts ra shared package, type theo convention. Sau đó lint rule (custom ESLint check) phạt vi phạm suffix.

### B6. i18n catalogs 3 nơi, không shared

| App | Format | Locales | Keys | Pattern |
|---|---|---|---|---|
| Worker | TS object `messages.vi.ts` | `vi` only | server error messages | `translate(locale, 'errors.foo')` |
| Web | JSON `vi.json` | `vi` only | UI strings | `t('expense.create.title')` |
| TMA | JSON `vi.json`, `en.json` | `vi`, `en` | UI strings | `t('home.title')` |

TMA có 2 locales nhưng web chỉ có 1 — asymmetric. Worker locale type `'vi'` literal không match web `['vi']` hay tma `['vi', 'en']`.

3 file `vi.json` (web, tma, nội dung khác nhau) cho cùng ngôn ngữ, không có key registry. Khi thêm key mới, dev phải copy thủ công vào từng app.

**Fix** (multi-stage):
1. **Stage 1**: Tách `SupportedLocale` + `DEFAULT_LOCALE` ra `packages/contracts` (consumed bởi cả 3).
2. **Stage 2**: Tách UI string catalogs ra `packages/i18n/<locale>.json` (một file JSON per locale per surface — `web/vi.json`, `tma/vi.json`, vì UI khác nhau). Build script copy đúng file vào `apps/<surface>/src/lib/i18n/locales/`.
3. **Stage 3** (nếu muốn): Crowdin/PO file với key registry.

### B7. 2 auth client trong TMA + 2 auth store ở 2 app

- TMA: `lib/auth/api.ts` (client) + `features/auth/store.ts` (zustand)
- Web: `api/client.ts` (axios) + `stores/auth.store.ts` (zustand + persist)
- TMA store duplicate `computeExpiry` + similar `setSession`/`refresh` semantics với web store.

Không bug rõ ràng, nhưng semantics drift (web có `isSessionChecked`, tma có `AuthStatus` enum). Khi thêm field mới phải sync.

**Fix**: Sau khi có shared package, `packages/auth-store` (zustand slice factory) cho `accessToken`, `refreshToken`, `user`, `expiresAt`. Mỗi app extend với surface-specific state (web: `isSessionChecked`; tma: `AuthStatus`).

### B8. `cn()` util + formatter logic duplicated

- `apps/web/src/utils/cn.ts` (6 dòng) ≡ `apps/tma/src/lib/utils.ts` (6 dòng)
- Web: `utils/currency/format.ts` + `utils/datetime/format.ts` + `utils/datetime/helpers.ts`
- TMA: `lib/formatters.ts` (VND, month, date, time, period, amount input/parse)

Cùng pattern (Intl.NumberFormat VND, Intl.DateTimeFormat vi-VN) nhưng tách file khác nhau, test khác nhau.

**Fix**: `packages/format` (pure functions, no DOM):
- `cn.ts` — re-export `cn`
- `currency/vnd.ts` — `formatVnd`, `formatAmountInput`, `parseAmountInput`
- `datetime/index.ts` — `formatDateLabel`, `formatTimeLabel`, `formatMonthLabel`, `formatPeriodLabel`

Web/TMA import từ `@household/format`. Số Intl formatter handle `vi-VN` cố định nên tên trở nên rõ.

### B9. Dependency sprawl: zustand, i18next, react-i18next ở 2 nơi

`zustand@^5.0.12`, `i18next@^26.0.6`, `react-i18next@^17.0.4`, `zod@^4.3.6` đều trùng version ở web + tma. Một số dev dep trùng nữa (eslint plugins, typescript, vitest, jsdom, prettier-plugin-tailwindcss, …). Khi cần bump version phải sửa 2 `package.json`.

**Fix**: Tạo `packages/peer-deps` (naming tuỳ ý) hoặc thêm vào workspace root `package.json` devDependencies cho những tool chung (typescript, vitest, eslint, prettier, @types/react, jsdom, prettier-plugin-tailwindcss). Giảm duplicate dep entries.

### B10. `react-refresh` ESLint plugin trong worker config

`apps/worker/eslint.config.mjs:10` import + extend `react-refresh.configs.vite`. Worker là Hono backend, không có React component. Plugin thừa → tăng lint time vô ích, có thể false positive nếu sau này có file `.tsx` test fixture.

**Fix**: Bỏ `react-refresh` + plugin import khỏi `apps/worker/eslint.config.mjs`.

---

## C. Findings — Severity Low (housekeeping, ergonomics)

### C1. Root `build` script chỉ build web

`package.json:11`:
```json
"build": "pnpm --filter web build"
```
Không target full-stack. `init.sh build` đã làm đúng (chạy 3 build song song) nhưng root script sai.

**Fix**: Đổi thành `pnpm -r run build` (worker không có `build` script → wrangler deploy dry-run, cần tạo).

### C2. Root scripts dùng `&&` thay vì `pnpm -r`

`package.json:23-25`: `lint`, `typecheck`, `test` đều viết tay `pnpm --filter web lint && pnpm --filter worker lint && pnpm --filter tma lint`. Khi thêm app thứ 4 phải sửa root.

**Fix**:
```json
"lint": "pnpm -r --parallel run lint",
"typecheck": "pnpm -r run typecheck",
"test": "pnpm -r run test",
```
Tuy nhiên hiện `init.sh` đã handle song song tốt → có thể giữ root scripts như no-op wrapper chỉ để dev IDE chạy được.

### C3. `Vite` config có `historyApiFallback` vô hiệu

`apps/tma/vite.config.ts:21` set `historyApiFallback: true`. Đây **không phải** Vite config key hợp lệ (Vite tự xử lý SPA fallback qua `appType: 'spa'` mặc định). Vite sẽ warning hoặc bỏ qua.

**Fix**: Bỏ dòng này. Nếu muốn explicit: thêm `appType: 'spa'`.

### C4. `getCategoryLabel` ở web hard-code key `'other'` làm fallback

`apps/web/src/lib/reference-data/category-presentation.ts:18`: `label: getCategoryLabel('other')`. Nếu key `'other'` bị xoá khỏi `REFERENCE_CATEGORY_KEYS` ở worker mà web không update, fallback sẽ throw. Không có exhaustive check.

**Fix**: Dùng exhaustive `Record<CategoryKey, string>` map, compile-time fail khi thêm key mà quên label.

### C5. README chưa cập nhật cho surface mới

`README.md` (chưa scan kỹ) — cần check xem có đề cập TMA + mobile-app sắp tới không. ARCHITECTURE.md đã có, AGENTS.md đã có.

### C6. `.gitignore` không thấy `.turbo`, `.nx`, `dist`, etc.

Chưa kiểm tra. Sau khi có Turborepo (recommend giai đoạn sau) cần ignore `.turbo/`.

### C7. `tsconfig` root references nhưng không có `references` field

Không có root `tsconfig.json` → 3 app độc lập. Nếu muốn dùng `tsc --build` cho project references (để typecheck contracts trước web), cần thêm root `tsconfig.json` với `references`.

---

## D. Phased Remediation Plan

### Phase 1 — Quick wins (1–2 ngày, không breaking)

| # | Action | Effort | Risk |
|---|---|---|---|
| 1 | Bỏ `jsx` khỏi `apps/worker/tsconfig.json` | XS | none |
| 2 | Bỏ `react-refresh` khỏi worker ESLint config | XS | none |
| 3 | Bỏ `historyApiFallback` khỏi TMA Vite config | XS | none |
| 4 | Whitelist `remotePatterns` trong `next.config.ts` | S | low |
| 5 | Thêm `apps/tma/**` vào CI paths + scope script | S | low |
| 6 | Bỏ `packageManager` ở worker package.json | XS | low (pnpm sẽ dùng root) |

### Phase 2 — Shared `packages/contracts` (1 tuần, semi-breaking)

```
packages/
  contracts/
    package.json          name: @household/contracts
    src/
      auth/{schemas,dto,index}.ts
      expense/{schemas,dto,index}.ts
      reference-data.ts
      errors.ts            (ERROR_CODES → ErrorCode union)
      envelope.ts          (ApiEnvelope<T>)
      locale.ts            (SupportedLocale)
      index.ts
    tsconfig.json
    __tests__/             (envelope shape test, error code exhaustiveness)
```

Steps:
1. Tạo package, thêm vào `pnpm-workspace.yaml` (`packages/*`).
2. Move từ `apps/worker/src/contracts/*` + `lib/errors.ts` + `lib/response.ts` (envelope part) + `lib/i18n/locales.ts` → `packages/contracts/src/`.
3. Worker: `import from '@household/contracts'` thay vì `@/contracts`.
4. Web: xoá `apps/web/src/types/api.ts`, `apps/web/src/features/auth/types/auth.ts`, `apps/web/src/types/reference-data.ts`; import từ package.
5. TMA: xoá `apps/tma/src/lib/auth/api.ts:1-50` (types phần), import từ package.
6. CI: thêm `packages/**` vào `verify-code.yml` paths để khi đổi contracts → CI chạy cả 3 app.
7. `init.sh install` tự rebuild workspaces.
8. Thêm shared test ở `packages/contracts/__tests__/envelope.test.ts` kiểm tra shape bất biến.

**Verify**: `./init.sh lint typecheck test` pass; tạo 1 PR thử sửa 1 field trong DTO để xác nhận cả 3 app fail typecheck.

### Phase 3 — `packages/eslint-config` + `packages/format` (3–5 ngày)

- Tách base ESLint config ra `packages/eslint-config` (3 file: base, next, vite).
- Move `cn()` + formatter VND/datetime ra `packages/format` (pure).
- Web + TMA import. Web `utils/` shrinks; TMA `lib/utils.ts` + `lib/formatters.ts` xoá.

### Phase 4 — `packages/api-client` + `packages/i18n` (1 tuần)

- API client: 1 implementation, 3 entry points (web dùng fetch — drop axios, tma dùng fetch, có thể wrap cho node test).
- i18n: Tách `SupportedLocale` ra contracts (xong ở Phase 2). Tách UI catalogs ra `packages/i18n/<surface>/<locale>.json` với build script copy vào apps.

### Phase 5 — Optional, khi > 5 packages

- Thêm **Turborepo** (`turbo.json` ở root) với `pipeline`: `contracts` → `web/worker/tma` (`dependsOn: ["^build"]`).
- Thêm **Changesets** nếu muốn publish `packages/*` ra npm (chưa cần nếu chỉ internal).
- Root `tsconfig.json` project references để typecheck theo thứ tự.

---

## E. Phụ lục — Bảng ánh xạ file → vấn đề

| File / Path | Finding |
|---|---|
| `apps/worker/src/contracts/auth.ts` | A1 (DTO source) |
| `apps/worker/src/contracts/reference-data.ts` | A1, B1 |
| `apps/worker/src/lib/errors.ts` | A1 (`ERROR_CODES`) |
| `apps/worker/src/lib/response.ts` | A1 (envelope), A2 |
| `apps/worker/src/lib/i18n/locales.ts` | B6 (locale) |
| `apps/worker/eslint.config.mjs` | B1, B10 |
| `apps/worker/tsconfig.json` | A4 (jsx), C7 |
| `apps/worker/package.json` | A6 (packageManager) |
| `apps/web/src/types/api.ts` | A1, A2 (envelope duplicate) |
| `apps/web/src/types/reference-data.ts` | A1 (category keys duplicate) |
| `apps/web/src/features/auth/types/auth.ts` | A1, B5 (narrower AuthProvider) |
| `apps/web/src/api/client.ts` | B4 (axios) |
| `apps/web/src/utils/cn.ts` | B8 |
| `apps/web/src/lib/i18n/i18n-init.ts` | B6 |
| `apps/web/src/lib/i18n/locales/vi.json` | B6 |
| `apps/web/src/stores/auth.store.ts` | B7 |
| `apps/web/next.config.ts` | A3 (remotePatterns `**`) |
| `apps/web/eslint.config.mjs` | B1 |
| `apps/web/.prettierrc` | B2 |
| `apps/web/tsconfig.json` | C7 (no base) |
| `apps/tma/src/lib/auth/api.ts` | A1, B4, B5 (separate client) |
| `apps/tma/src/lib/api/client.ts` | A1 (envelope inline), B4 |
| `apps/tma/src/features/auth/store.ts` | B7 |
| `apps/tma/src/lib/i18n/index.ts` | B6 |
| `apps/tma/src/lib/i18n/locales/{en,vi}.json` | B6 |
| `apps/tma/src/lib/utils.ts` | B8 (cn) |
| `apps/tma/src/lib/formatters.ts` | B8 |
| `apps/tma/eslint.config.mjs` | B1 |
| `apps/tma/.prettierrc` | B2 |
| `apps/tma/vite.config.ts` | C3 (historyApiFallback) |
| `pnpm-workspace.yaml` | (no `packages/*`) — Phase 2 |
| `package.json` (root) | C1, C2 (build, scripts) |
| `.github/workflows/verify-code.yml` | A5 (no TMA path) |
| `scripts/detect_ci_scope.sh` | A5 (no TMA case) |
| `tsconfig.*` (root missing) | B3, C7 |
| `eslint.config.mjs` (root missing) | B1 |
| `.prettierrc` (root missing) | B2 |
