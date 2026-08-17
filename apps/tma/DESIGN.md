# TMA Design

Package-local screen and interaction spec for the next `apps/tma` build.

This file is the canonical visual/page reference for TMA surfaces. It does not replace shared product rules from `docs/product-specs/index.md` or TMA platform rules from `docs/TMA.md`.

## Goal

Build a Telegram Mini App that feels:

- native to Telegram mobile WebView
- calm, premium, and fast to scan
- optimized for very fast expense capture
- light enough to stay smooth on low-end devices

## Locked truths

- TMA is one SPA. No full reload navigation.
- Every main screen has a top header.
- Root tab screens do not render an app-owned back button.
- Detail and flow screens use Telegram `BackButton`, not a fake in-content back chip.
- TMA UI uses shadcn/ui with Base UI and exact preset `b6G3fhkA4` (Lyra, yellow/neutral, Geist Mono, Lucide).
- TMA UI is fixed light-only and does not sync its visual theme to Telegram.
- Every route uses in-page shadcn `Button` CTAs; Telegram `BottomButton` and `MainButton` are not used.
- The locally customized Button triggers Telegram `impact('light')` once for an enabled activation.
- Preserve the tab rail, one scroll root per screen, native-picker/date-picker behavior, and existing haptics.
- Preserve `DataState` behavior and restyle it with shadcn/ui.
- Legacy `--tma-*` UI tokens are transitional only and are removed after all consumers migrate.
- Bottom navigation has 3 positions: `Home`, a centered `+` action, and `Statistics`.
- The centered `+` is a notch-style action button that opens the add-expense flow. It is visually larger than the tabs and overlaps the rail.
- `Settings` is intentionally not in the bottom tabs (temporarily removed). The native `Close` action lives on root screens via an in-page close pill.
- `Expenses` is a secondary page, opened from shortcuts, recent activity, and the floating add/expense entry points.
- `Household`, `Group`, and `Budget` appear as shortcuts first. Their full TMA surfaces can land later.

## Visual direction

Reference mood from the attached screens:

- very bright neutral background
- large white cards with soft shadow
- strong rounded geometry
- crisp black money values
- yellow/neutral preset treatment for active UI state
- green for healthy/category data accents
- yellow for primary highlight and glow moments
- bottom tab rail with liquid-glass feel

The app should feel like a finance tool with iOS-like calmness, not a noisy dashboard.

## Design tokens

### Color

- App background: warm-cool mist, near `#f5f7fb`
- Surface: `rgba(255, 255, 255, 0.88)` for elevated glass, `#ffffff` for normal cards
- Text strong: `#111827`
- Text muted: `#7b8496`
- Separator: `rgba(17, 24, 39, 0.08)`
- Primary accent: preset yellow/neutral treatment
- Positive/chart green: `#5dd36d`
- Highlight yellow: `#ffd84d`
- Danger/spend emphasis: use content hierarchy, not bright red by default

### Radius

- Primary cards: `28px`
- Small cards / cells: `22px`
- Pills / chips / segmented tabs: `18px`
- Floating add bubble: `24px`

### Shadow and blur

- Card shadow: very soft, wide, low alpha
- Glass blur is reserved for:
  - bottom tab rail
  - optional header backdrop when content scrolls underneath
- Do not blur every card. Glass is for chrome only.

### Typography

- Typography follows the locked Geist Mono preset.

## Shell model

### Header

- Present on every page.
- Height includes safe-area top.
- Root tab screens: title or identity block + trailing action only.
- Secondary screens: title + Telegram `BackButton` outside page content.
- Header should feel airy, not boxed-in.

### Bottom tabs

- One floating liquid-glass rail centered above the safe area.
- Rail is compact.
- Three positions: left tab, center action notch, right tab.
- Active tab changes icon and label color only.
- Do not place a full filled background behind the active tab.
- A tiny indicator under the active item is acceptable.
- Keep icon + label stack tight to reduce rail height.
- Center action button is a notch above the rail, larger than the tabs, with a dark high-contrast fill and a white plus icon.

### Top in-page buttons

- Root screens render a labelled `Close` pill in the top bar (calls `miniApp.close()`).
- Detail and flow screens use the Telegram `BackButton` (not an in-page back chip).
- The home page hides the Telegram `BackButton` so the in-page `Close` pill is the only navigation affordance.

## Route and page map

| Screen ID | Suggested route | Purpose |
|---|---|---|
| `home` | `/home` or `/` | Overview, shortcuts, recent context |
| `statistics` | `/statistics` | Spending analytics and trends |
| `settings` | `/settings` | Preferences and support |
| `expenses` | `/expenses` | Full expense history |
| `add-expense-1` | `/expenses/new/category` | Date + category selection |
| `add-expense-2` | `/expenses/new/details` | Amount + source + note |
| `add-expense-3` | `/expenses/new/context` | Household + group + preview |

## Screen specs

### `home`

Structure, top to bottom:

1. Header with avatar, user name, and a small month context chip.
2. Current-month summary card.
3. Shortcut block for `Chi tiêu`, `Gia đình`, `Nhóm`, `Ngân sách`.
4. Horizontal household carousel.
5. Recent expenses list with `Xem tất cả`.

Rules:

- Header identity is personal: avatar + `Xin chào, <name>` or equivalent concise greeting.
- Summary card shows:
  - total spent this month
  - optional budget remaining or delta vs previous month
  - one strongest number only
- Shortcut block should feel tactile and fast, inspired by the service-card composition in the reference screenshot.
- Use a 2x2 shortcut grid, with icon, title, and one-line hint.
- Household cards scroll horizontally and show:
  - household name
  - member count
  - current-month spend
  - budget status chip if available
- Recent expenses list shows up to 10 newest rows.
- Each row: category icon, title/note, time/date hint, amount, household/group badges when relevant.
- Home must remain readable without charts.

### `statistics`

Structure, top to bottom:

1. Header with page title and period action.
2. Hero total block for selected period.
3. Month switcher with left/right navigation.
4. Segmented range control: `Day`, `Week`, `Month`, `Year`.
5. Main analytics card.
6. Secondary ranked summaries.

Rules:

- Open on `Month` by default even if the control supports `Day/Week/Year`.
- Hero block shows one total and one current label only.
- Main card matches the reference tone:
  - large total for the selected slice
  - one selected category chip
  - simple chart, not a dense dashboard
  - legend chips with direct amounts
- Prefer one dominant chart only.
- Secondary section can show totals by category or recent daily totals.
- Heavier chart code must lazy-load.

### `settings`

Structure, top to bottom:

1. Header with title.
2. Appearance card.
3. Preferences group.
4. Support/donate group.

Rules:

- Visual style should stay close to the reference screen.
- Appearance is fixed light-only. Do not sync the visual theme to Telegram or expose a light/dark switch.
- Preference cells include at least:
  - `Ngôn ngữ`
  - `Tiền tệ`
- Support cell includes `Donate` / `Telegram Stars` style affordance.
- Settings should feel calm and utility-first, not playful.

### `expenses`

Structure, top to bottom:

1. Header with title and trailing filter action.
2. Grouped timeline list.

Rules:

- Composition follows the attached history screen.
- Group rows by year -> month -> day label.
- Timeline sections use large date dividers with generous whitespace.
- Expense rows are large, soft cards.
- Each row shows:
  - category icon
  - label or note
  - time
  - amount aligned right
  - small overflow action trigger
- Root expenses page uses the custom header only; no inline back pill.
- Filters open as a lightweight sheet, not a full heavy page.

### `add-expense-1`

Purpose: pick date and category fast.

Rules:

- Header title: concise, e.g. `Thêm chi tiêu`.
- Date picker summary sits near the top as a pill or compact cell.
- Category area is the main focus.
- Categories show icon + label.
- Use a dense but readable grid/list hybrid. Two columns is preferred if labels still fit.
- Tapping a category:
  - commits the category
  - triggers a light selection haptic
  - immediately routes to `add-expense-2`
- No extra confirm button on this step.

### `add-expense-2`

Purpose: enter amount, source, and note.

Rules:

- Top summary strip shows chosen category and date from step 1.
- Amount is the visual hero.
- Amount entry should support VND-friendly formatting and big tap targets.
- Source selection sits under amount as chips or compact cells.
- Note field is minimal and low-friction.
- An in-page shadcn `Button` owns the transition from step 2 -> step 3.
- Button text should be action-specific, e.g. `Tiếp tục`.
- Step 2 must not use Telegram `BottomButton` or `MainButton`.

### `add-expense-3`

Purpose: attach context and review before save.

Rules:

- Top summary strip persists the chosen category, date, and amount.
- Show optional household picker.
- Show optional group picker.
- Show one preview card with:
  - category
  - amount
  - note
  - date
  - household if selected
  - group if selected
- Saving uses an in-page shadcn `Button`.
- Button text should be concrete, e.g. `Lưu chi tiêu`.
- Success should feel immediate and calm, with a small success haptic only once.

## Add-expense flow

The TMA expense flow is:

`date + category -> amount + source + note -> household + group + preview`

This replaces the older amount-first draft wording from earlier TMA docs. Shared expense semantics still stay identical to the worker-backed product rules.

## Motion and performance

Performance is the top design constraint.

Rules:

- Animate `transform` and `opacity` only.
- Default screen transition: short, calm, under `240ms` perceived duration.
- Do not animate chart layout, card height, or heavy blur radii.
- Keep glass effects to the bottom rail and optional header only.
- Avoid nested shadows and multiple translucent layers in scroll lists.
- Home loads first with summary + shortcuts + recent items. No heavy chart bundle in the first path.
- `statistics` route must lazy-load chart-heavy modules.
- `expenses` route can lazy-load advanced filters.
- Add-expense flow keeps state in a tiny local store; never refetch broad app data between steps.
- Preload the next add-expense step after a valid selection when cheap.
- Every enabled shadcn `Button` activation gets one centralized light Telegram impact. Category selection, save confirmation, and important destructive confirmation may add semantic, meaning-specific haptics; preserve existing native picker/date-picker haptics, and do not add indiscriminate feedback to non-button controls.
- Prefer SVG icons and simple chart rendering. No Lottie.

## Implementation notes

- Build the shell so `home` and `statistics` share the same header and tab-rail contract.
- `expenses` and `add-expense-*` should live under a separate flow shell so Telegram `BackButton` wiring and in-page CTA state stay centralized.
- Keep the floating add bubble available on root tabs only.
- If a surface is not implemented yet, ship a truthful placeholder inside the final shell instead of breaking the page map.

## Styling

TMA uses **shadcn/ui with Base UI** using exact preset `b6G3fhkA4` (Lyra, yellow/neutral, Geist Mono, Lucide). Tailwind CSS v4 (`@tailwindcss/vite`) remains the styling substrate. Legacy `--tma-*` UI tokens and their utility aliases are transitional only and are removed after all consumers migrate.

### Tokens available as utility classes

| Domain | Utility prefix | Example |
|---|---|---|
| Colors | legacy `bg-tma-*`, `text-tma-*`, `border-tma-*` | transitional aliases only |
| Shadows | legacy `shadow-tma-*` | transitional aliases only |
| Font | `font-mono` | Geist Mono |
| Animation | legacy `animate-tma-spin` | transitional alias only |

During migration, legacy opacity modifiers such as `bg-tma-primary/12` may remain for selected states.

### Component styling

`src/index.css` is limited to transitional `:root` tokens, `@theme inline`, base reset rules, and shared keyframes. Do not add BEM-style component classes there. Reusable shapes live in `src/components/ui`, while shared/smart components compose shadcn/ui and Tailwind utilities in JSX.

### Class composition helper

Use `cn()` from `@/lib/utils` (clsx + tailwind-merge) for conditional className. Never hand-roll template literals for state modifiers.

```tsx
cn('rounded-[18px] px-3 py-2', isActive && 'bg-muted text-foreground')
```

### Conventions

- ≤ 2 CSS properties per class → prefer utility. Layout / multi-property shapes → keep the component class.
- Dynamic values (chart bar height, runtime safe-area) → keep inline `style={{ ... }}`. Static `style={{ margin: 0 }}` and `style={{ color: 'var(--tma-*)' }}` → convert to utility while migrating away from legacy UI tokens.
- Safe-area runtime vars (`--tma-safe-*`, `--tma-content-safe-*`) are Telegram SDK platform values, not legacy UI tokens. Never hardcode; read them with Tailwind arbitrary values such as `pt-[var(--tma-safe-top)]`.
- Pseudo-classes (`:active`, `:hover`) use Tailwind variants (`active:scale-95`). Add `transition-transform` / `transition-opacity` so the variant actually animates.
