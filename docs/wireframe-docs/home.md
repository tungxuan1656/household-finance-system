# Home Screen UI Specification

> **Deprecated**: This wireframe describes the old `/home` dashboard which has been replaced by the Expense surface as the default protected entry point after sign-in. The Lens→View migration is complete. The 5-tab nav (Home, Expenses, Budgets, Insights, Profile) is replaced by 4 tabs (Expense, Analysis, Household, Settings). Keep for historical reference only — do not use as the basis for new work.



> Screen: Home / Dashboard
> Platform: Responsive Web App
> Design System: shadcn/ui + Maia Mist preset
> Style Direction: Calm fintech, minimal, content-first, mobile-first
> Purpose: Give users an immediate understanding of their financial state with low cognitive load.

## 1. Overall UX Goals

The Home screen is the primary landing screen after login, defaulting to **Personal lens**.

This screen should answer these questions at a glance:

- How much did I spend this month?
- Am I within budget?
- Which category is spending the most?
- What are my latest expenses?
- Is anything on track to exceed budget?

The UI should feel: calm, trustworthy, lightweight, readable, fast to scan.

The UI should avoid: overly saturated colors, crypto/trading dashboard feeling, dense admin-panel layouts, too many nested cards.

---

## 2. Core Architecture: Lens + Group Model

### 2.1 The Lens Selector

The **lens selector** is the top-level scope switch and **always visible** on the Home screen. It determines whose data appears in every section below.

> **Lens = data scope.** Personal shows the user's own data. Household X shows that household's shared data.

**Lens tabs** (mobile: below MobileHeader; desktop: pill selector at top of content):

```
[ Personal ] [ Gia đình ] [ Chung cư ] ...
   ^active     ^inactive    ^inactive
```

**Rules:**
- Personal is always the first tab and always present.
- Each household the user belongs to gets its own tab.
- Only one lens is active at a time.
- When the user has no households yet, only `[ Personal ]` appears, with an optional badge/hint suggesting household creation.
- Desktop: pill-style ToggleGroup with short labels. If many households, truncate with `...` or a dropdown for overflow.

### 2.2 The Group Filter Bar

Groups are **NOT a lens**. Groups are cross-cutting tags. An expense in Personal or Household lens can be tagged to one or more groups.

> **Group = cross-cutting filter.** Applying a group filter narrows results within the current lens. It does not change the data scope.

**Group filter bar** (separate row below lens selector):

```
🏷️ Vacation 2025  ✕     |     [+ Filter]
```

**Behavior:**
- Hidden by default (no filter applied).
- When user taps `[+ Filter]`, a dropdown/popover lets them pick one or more groups to filter by.
- Active filters appear as chips with an `✕` close button.
- Filtering by group does **not** change lens — all sections (hero, budgets, expenses, breakdown) show only data tagged to selected groups _within the current lens_.
- Removing all filters hides the filter bar again.

**Combined lens + group logic:**

| Active Lens | Group Filter | Data Shown |
|-------------|-------------|------------|
| Personal | _(none)_ | All personal expenses |
| Personal | Vacation 2025 | Personal expenses tagged Vacation 2025 |
| Gia đình | _(none)_ | All shared household expenses |
| Gia đình | Vacation 2025 | Household expenses tagged Vacation 2025 |

---

## 3. Responsive Layout Structure

### 3.1 Desktop Layout (md+)

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar │ Main Content (max-w-5xl, centered)                    │
│         │                                                         │
│         │  Lens Selector (pill group)                             │
│         │  Group Filter Bar (conditional)                         │
│         │                                                         │
│         │  ┌─ Hero Stats Card ─────────────────────────────────┐ │
│         │  │                                                    │ │
│         │  └────────────────────────────────────────────────────┘ │
│         │                                                         │
│         │  Budget Cards (horizontal scroll within card area)       │
│         │                                                         │
│         │  ┌─ Recent Expenses ──┐ ┌─ Category Breakdown ───────┐ │
│         │  │                    │ │                             │ │
│         │  └────────────────────┘ └─────────────────────────────┘ │
│         │                                                         │
│         │  Household Cards (conditional, when household lens)      │
│         │                                                         │
│         │                                              [ + ] FAB  │
└─────────────────────────────────────────────────────────────────┘
```

**Desktop specifics:**
- Sidebar: 240px-280px, fixed left, `bg-sidebar`, subtle right border
- Content: `max-w-5xl`, centered, `p-6 lg:p-8`
- Lens selector: Pill-style ToggleGroup at top of content area
- Group filter bar: single row with chips, below lens selector
- 2-column grid: Recent Expenses (wider, left) + Category Breakdown (right)
- FAB: sticky bottom-right inside content area, `size-14`, circular

### 3.2 Mobile Layout (< md)

```
┌───────────────────────────┐
│ MobileHeader "Home"        │  ← sticky, h-14, bg-background/80, backdrop-blur-md
├───────────────────────────┤
│ [Personal] [Gia đình] [..]│  ← Lens tabs, horizontal scroll
│ 🏷️ Vacation 2025 ✕  [+..] │  ← Group filter (conditional)
├───────────────────────────┤
│                            │
│  ┌─ Hero Stats Card ────┐ │
│  │                       │ │
│  └───────────────────────┘ │
│                            │
│  Budget Cards (h-scroll)   │
│                            │
│  Recent Expenses           │
│                            │
│  Category Breakdown        │
│                            │
│  Household Cards (cond.)   │
│                            │
│                   [ + ]    │  ← FAB, bottom-right
│                            │
├───────────────────────────┤
│ Bottom Tab Navigation      │  ← fixed, 64px + pb-safe
└───────────────────────────┘
```

**Mobile specifics:**
- MobileHeader: sticky top, 56px, translucent, subtle border-bottom
- Lens tabs: below header, horizontal scroll, full-width
- Group filter bar: below lens tabs, same horizontal scroll behavior
- Single-column vertical stack, `p-4`, `gap-4`, `pb-24` for bottom tab
- Bottom tabs: 5 tabs (Home, Expenses, Budgets, Insights, Profile)

---

## 4. Home Screen Sections

### 4.1 Lens Selector

**Purpose:** Let the user choose their data scope. Always visible.

**Mobile:**
- Full-width horizontal tabs directly below MobileHeader
- `[ Personal ] [ Gia đình ] [ Chung cư ]` with horizontal scroll if many
- Active tab: `text-primary`, bottom border indicator
- Inactive tabs: `text-muted-foreground`

**Desktop:**
- Pill-style ToggleGroup at top of content area
- Compact labels: "Personal", "Gia đình", "Chung cư"
- If more than 4-5 households: first 3-4 visible + `[ +2 ]` overflow dropdown

### 4.2 Group Filter Bar

**Purpose:** Apply cross-cutting group filter within the active lens.

**Position:** Immediately below lens selector. Same width as content area.

**Mobile and desktop:**
- Hidden when no filter is active
- Shows active filter chips + `[+ Filter]` button
- Chip style: `rounded-full`, `border`, `text-sm`, `px-3 py-1`
- Close button: small `✕` or `X` icon at end of chip
- `[+ Filter]` button: ghost style, `text-muted-foreground`, opens popover/dropdown
- Multiple groups can be active simultaneously (all AND logic)

**Group selection popover:**
- List of all user's groups (from all households)
- Checkboxes or multi-select
- Groups scoped to current lens are shown at top; groups from other lenses below with faint indicator

### 4.3 Hero Stats Card

**Importance:** Primary visual focus of the page.

**Content hierarchy (top to bottom):**

```
This month spending          [ Tháng 5/2026 ▼ ]
────────────────────────────────────────────────
        12,450,000 ₫                ← text-3xl font-bold
────────────────────────────────────────────────
████████████░░░░░░░░░░  65% of budget
Còn 6,550,000 ₫                     ← text-sm muted

↓ 12% so với tháng trước           ← trend indicator
Còn 12 ngày — khoảng 545k/ngày     ← safe daily rate
```

**Style:**
- Surface: `bg-card`, `rounded-2xl`, subtle border, `shadow-sm`
- Padding: `p-5 md:p-6`
- Month selector: top-right, compact dropdown or chevron
- Main number: `text-3xl font-bold`, largest text on screen
- Progress bar: `h-2`, `rounded-full`, semantic color:
  - < 80%: primary
  - 80–99%: warning
  - ≥ 100%: destructive
- Trend indicator: small arrow + percentage, green (↓ decrease) or warning (↑ increase)
- Safe daily rate: small muted text, informative, non-alarming

**Loading state:** Skeleton card matching exact shape. Pulse animation.

**Error state:** Card with muted "Could not load summary" text + retry button.

### 4.4 Budget Status Cards

**Purpose:** Surface budget health at a glance — overall + per category with progress bars.

**Layout:**
- **Desktop:** Horizontal row of cards, wrapping if many categories. Each card: min-width ~200px.
- **Mobile:** Horizontal scroll container. Snap scroll, peek-a-boo right edge for affordance.

**Cards:**
```
┌─ Overall Budget ─────┐  ┌─ Ăn uống ────────┐  ┌─ Di lại ──────────┐
│ ████████░░░░░░  65%  │  │ ██████████░░  82%  │  │ ███░░░░░░░░  28% │
│ 12.5M / 19M          │  │ 6.5M / 8M          │  │ 1.4M / 5M         │
│ Còn 6.5M             │  │ Còn 1.5M ⚠️        │  │ Còn 3.6M          │
└───────────────────────┘  └────────────────────┘  └───────────────────┘
```

**Rules:**
- "Overall Budget" card is always first (if a budget exists).
- Per-category cards sorted by % used descending (most-pressured first).
- Warning threshold (≥ 80%): change progress bar to warning color, add subtle `⚠️` indicator.
- Exceeded threshold (≥ 100%): change to destructive color.
- Desktop: fit as many as width allows; overflow wraps.
- Mobile: infinite-like horizontal scroll; max 5-6 cards visible at a time.
- Card style: compact `bg-card`, `rounded-xl`, `p-4`, subtle border.

**Empty state** (no budget set): single card: "Set a monthly budget to track your spending" with CTA.

### 4.5 Recent Expenses

**Layout:**
- Desktop: left column in 2-col grid (wider ~60%)
- Mobile: full-width, single column

**Section header:**
```
Recent Expenses                    [ View all → ]
```
Ghost/link style for "View all".

**Expense list style:**
- Flat list, no nested cards
- Each row: `min-h-[56px]`, `py-3`
- Subtle separator between rows
- Show last 5 items on Home

**Row layout:**
```
[🍽️]  Ăn trưa                          - 85,000 ₫
       Highlands Coffee
       Hôm nay · 12:30 · 🏷️ Vacation 2025
```

- Left: category icon (24px, muted), title (font-medium), metadata line (text-xs, text-muted-foreground)
- Right: amount (tabular-nums, font-medium), negative (expense) in default foreground, positive (income) in success color
- Metadata line includes: relative date, payer name (if household lens), group tag chip (if any)
- Group tag chip: `text-xs`, `rounded-full`, `bg-muted`, `px-2 py-0.5`

**Interaction:** Tap → opens Drawer (mobile) / Dialog (desktop) with expense details.

**Loading state:** 5 skeleton rows matching row height and shape.

**Empty state:** "No expenses yet. Tap + to add your first one."

### 4.6 Category Breakdown

**Layout:**
- Desktop: right column in 2-col grid (narrower ~40%)
- Mobile: full-width, below Recent Expenses

**Content:** Vertical ranked list of top 5 categories by spend.

```
Category Breakdown

Food           ████████████░░░░░░░░  45%    6,500,000
Housing        ██████░░░░░░░░░░░░░░  25%    3,600,000
Transport      ████░░░░░░░░░░░░░░░░  15%    2,200,000
Shopping       ███░░░░░░░░░░░░░░░░░  10%    1,400,000
Other          ██░░░░░░░░░░░░░░░░░░   5%      750,000
```

Each row:
- Category name (left)
- Mini progress bar (middle, `h-1.5` or `h-2`, rounded)
- Percentage + absolute amount (right, tabular-nums)

**Style:**
- Card surface (desktop) or flat section (mobile)
- `p-4`
- Compact vertical spacing (`gap-3`)
- Progress bar color: monochromatic blue scale (chart-1 through chart-5)

**Loading state:** 5 skeleton rows.

**Empty state:** "Start adding expenses to see your spending breakdown."

### 4.7 Household Section (Conditional)

**Purpose:** Show household context — only visible when a household lens is active.

**Content:**
- Member avatars (small circles, max 5 shown + `+N` overflow)
- Household monthly total spend
- "Your contribution" line (personal spend within this household)

**Style:** Secondary card, low visual weight. Should not compete with hero.

**Desktop:** Right column, below Category Breakdown.

**Mobile:** Full-width, toward bottom.

**Empty state:** "No members yet. Invite family members to start tracking together."

### 4.8 Empty State (New User — No Expenses)

When user has no expenses at all (fresh account):

```
┌─────────────────────────────────────────────┐
│                                               │
│              [ Wallet illustration ]           │
│                                               │
│         Start tracking your spending          │
│     Add your first expense to see insights    │
│                                               │
│            [ + Add First Expense ]            │
│            (primary button, large)            │
│                                               │
│  No budget yet? Set one up to track limits.   │
│             [ Set Budget → ]                  │
│                                               │
└─────────────────────────────────────────────┘
```

- Hero card replaced by welcome card.
- Budget section replaced by "Set your first budget" prompt.
- Recent Expenses and Category Breakdown hidden (no data).
- Household section hidden.
- FAB still accessible (but welcome card CTA is the primary path).

### 4.9 Floating Add Expense Button (FAB)

**Position:** Bottom-right corner.
- Mobile: fixed, `bottom-20 right-4` (above bottom tabs)
- Desktop: sticky within content area, `bottom-6 right-6`

**Style:** Circular, `size-14`, `bg-primary`, `text-primary-foreground`, `shadow-lg`, `rounded-full`.

**Icon:** `Plus` (Lucide).

**Interaction:** Opens quick-add via Drawer (mobile) / Dialog (desktop).

---

## 5. Visual Style Guidelines

### 5.1 Surface Hierarchy

Avoid card-in-card-in-card. Use spacing, typography, and subtle borders to create hierarchy.

### 5.2 Color Usage

- **Primary:** Active states, key metrics, CTA buttons, progress bars (safe range)
- **Warning:** Budget ≥ 80%, used sparingly
- **Destructive:** Budget exceeded
- **Neutral surfaces:** Most surfaces remain muted, low-contrast, soft

### 5.3 Typography Hierarchy

- **Largest:** Monthly spending number (`text-3xl font-bold`)
- **Medium emphasis:** Section titles (`text-base font-semibold`)
- **Low emphasis:** Descriptions, metadata (`text-sm text-muted-foreground`)

### 5.4 Shadows

Use `shadow-sm` and `shadow-md`. No glow effects, neon shadows, or heavy elevation.

### 5.5 Spacing

Preferred rhythm: `gap-4`, `gap-6`. Avoid dense packing.

---

## 6. UX Principles

### 6.1 Fast Scanning

User should understand the screen within 3 seconds. Hero number is the anchor.

### 6.2 Low Cognitive Load

- No more than 2 chart-like elements on Home
- Category breakdown uses simple bars, not pie charts
- Colors stay monochromatic (blue scale) unless warning

### 6.3 Mobile First

Mobile layout is primary. Desktop is enhanced — same information, more horizontal space.

### 6.4 Content First

Financial data > decoration. UI polish supports clarity, not distracts.

### 6.5 Explicit Context

User always knows which lens is active. Lens selector is permanent, not hidden. Group filters are visible chips, not invisible state.
