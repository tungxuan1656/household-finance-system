# Home Screen UI Specification

> Screen: Home / Dashboard
> Platform: Responsive Web App
> Design System: shadcn/ui + Maia Mist preset
> Style Direction: Calm fintech, minimal, content-first, mobile-first
> Purpose: Give users a quick understanding of their current financial state with low cognitive load.

---

# 1. Overall UX Goals

The Home screen is the primary landing screen after login.

This screen should help users answer these questions immediately:

* How much did I spend this month?
* Am I within budget?
* Which category is spending the most?
* What are my latest expenses?
* Is there anything that needs attention?

The screen should feel:

* calm
* trustworthy
* lightweight
* readable
* fast to scan

The UI should avoid:

* overly saturated colors
* crypto/trading dashboard feeling
* dense admin-panel layouts
* too many nested cards

---

# 2. Responsive Layout Structure

---

# 2.1 Desktop Layout (md+)

## Structure

```txt
┌────────────────────────────────────────────────────────────┐
│ Sidebar │ Main Content                                    │
│         │                                                  │
│         │  max-w-5xl centered                             │
│         │                                                  │
└────────────────────────────────────────────────────────────┘
```

---

## Desktop Sidebar

### Position

* Fixed/sticky left side
* Full viewport height
* Width: `240px - 280px`

### Style

* `bg-sidebar`
* subtle right border
* no heavy shadow

### Content Order

#### Top

* App logo
* Household switcher

#### Middle Navigation

* Home
* Expenses
* Budgets
* Insights
* Profile

### Navigation Style

* icon + label
* active item:

  * `bg-sidebar-accent`
  * `text-sidebar-primary`
* inactive:

  * `text-muted-foreground`

### Bottom Area

* user avatar
* settings shortcut
* logout

---

## Desktop Main Content

### Container

* `max-w-5xl`
* centered horizontally
* `p-6 lg:p-8`
* vertical spacing via `gap-6`

### Layout Structure

```txt
Header
↓
Hero summary
↓
2-column dashboard grid
```

---

## Desktop Grid

### Left Column (primary content)

Width priority: larger

Contains:

1. Monthly spending hero
2. Recent expenses
3. Budget progress

### Right Column (secondary content)

Contains:

1. Category breakdown
2. Budget alerts
3. Household snapshot
4. Quick actions

---

# 2.2 Mobile Layout (< md)

## Structure

```txt
Mobile Header
↓
Scrollable Content
↓
Bottom Tab Navigation
```

---

## Mobile Header

### Position

* sticky top
* z-index above content
* translucent background

### Height

* `56px`

### Style

* `bg-background/80`
* `backdrop-blur-md`
* subtle bottom border

### Content

#### Left

* Page title: “Home”

#### Right

* notification button
* profile avatar

---

## Mobile Content Area

### Layout

* single column
* `p-4`
* `gap-4`
* `pb-24` for bottom tab spacing

### Philosophy

The mobile layout must prioritize:

* glanceability
* thumb reach
* fast scanning

The screen should not feel crowded.

---

## Mobile Bottom Tabs

### Position

* fixed bottom
* safe-area aware

### Height

* `64px + pb-safe`

### Style

* `bg-background/70`
* `backdrop-blur-lg`
* top border
* subtle shadow

---

## Tabs

### Total: 5 tabs

1. Home
2. Expenses
3. Budgets
4. Insights
5. Profile

---

## Tab Behavior

### Active Tab

* highlighted icon
* visible label
* `text-primary`

### Inactive Tab

* muted icon
* optional hidden label on very small widths

---

## Tab Icon Style

* Lucide icons only
* 24px visual size
* large tap targets

---

# 3. Home Screen Sections

---

# 3.1 Greeting/Header Section

## Purpose

Provide contextual identity and emotional warmth.

---

## Desktop

### Layout

```txt
Welcome back, Linh
Here is your financial overview this month.
```

### Right Side

* current month selector
* household selector

---

## Mobile

### Layout

Compact horizontal row.

```txt
Home                      [Bell] [Avatar]
```

---

# 3.2 Monthly Spending Hero Card

## Importance

This is the primary visual focus of the page.

The hero should emphasize:

* monthly spending
* budget usage
* remaining budget

NOT total account balance.

---

## Style

### Surface

* `bg-card`
* `rounded-2xl`
* subtle border
* `shadow-sm`

### Padding

* `p-5 md:p-6`

---

## Content Hierarchy

### Top Label

```txt
This month spending
```

* muted text
* small typography

---

## Main Number

```txt
18.500.000 VND
```

### Typography

* `text-3xl`
* `font-bold`

This should be the largest text on the screen.

---

## Budget Progress

### Includes

* progress bar
* percentage used
* remaining budget

Example:

```txt
68% of monthly budget used
Remaining: 6.5M VND
```

---

## Progress Colors

### Normal

* primary/slate

### Warning (>= 80%)

* warning token

### Exceeded

* destructive token

---

## Footer Insight

Example:

```txt
Safe daily spending:
650k/day for the rest of the month
```

Style:

* small muted text
* informational
* non-alarming

---

# 3.3 Quick Financial Summary

## Purpose

Show supporting metrics.

---

## Layout

### Desktop

3-column grid.

### Mobile

2-column grid.

---

## Cards

### Card 1 — Income

```txt
Income
42.000.000
```

### Card 2 — Expenses

```txt
Expenses
18.500.000
```

### Card 3 — Savings

```txt
Savings
23.500.000
```

---

## Card Style

* compact
* medium emphasis
* less visually dominant than hero card

---

## Icons

Use subtle Lucide icons:

* ArrowUpRight
* ArrowDownRight
* Wallet

---

# 3.4 Recent Expenses Section

## Importance

This is one of the most-used sections in the app.

The design must prioritize:

* readability
* scanability
* fast recognition

---

## Section Header

### Left

```txt
Recent Expenses
```

### Right

```txt
View all
```

ghost/link button style.

---

## Expense List Style

### Container

* flat list OR soft card surface
* avoid nested cards

### Spacing

* comfortable vertical rhythm
* each item min-height `56px`

---

## Expense Item Layout

```txt
[Category Icon]

Coffee
Highlands Coffee
Today · 12:30

                     -85.000
```

---

## Item Structure

### Left

* category icon
* title
* metadata

### Right

* amount
* visibility badge (optional)

---

## Metadata Line

Contains:

* date
* payer
* group tag (optional)

Example:

```txt
Today · Linh · Da Nang Trip
```

---

## Amount Colors

### Expense

* default foreground
* not aggressive red

### Income

* success color

---

## Interaction

### Tap Behavior

Opens:

* mobile: Drawer
* desktop: Dialog

Expense details appear without route navigation.

---

# 3.5 Budget Progress Section

## Purpose

Help users monitor category budgets.

---

## Layout

Vertical stacked list.

---

## Section Structure

```txt
Food
8.2M / 18M
[progress bar]
45%
```

---

## Visual Rules

### Progress Track

* muted background

### Progress Fill

* semantic color

---

## Color States

### Safe

primary

### Warning

warning token

### Exceeded

destructive

---

## Important Rule

Avoid overly colorful charts.

The UI should remain calm and neutral.

---

# 3.6 Category Breakdown Section

## Purpose

Provide quick insight into spending distribution.

---

## Layout

Simple vertical ranked list.

Avoid heavy pie charts on mobile.

---

## Example

```txt
Food         45%
Housing      25%
Transport    15%
Shopping     10%
Other         5%
```

Each row contains:

* category label
* amount
* progress indicator

---

# 3.7 Budget Alert Section

## Purpose

Surface actionable information.

---

## Examples

### Warning

```txt
Food budget is at 82%.
```

### Overspending

```txt
Shopping exceeded budget by 1.2M.
```

---

## Style

Use:

* Alert component
* subtle warning/destructive variants

Avoid:

* flashing colors
* strong red backgrounds

---

# 3.8 Household Snapshot (Desktop Priority)

## Purpose

Show lightweight household context.

---

## Content

### Members

* avatars
* names

### Shared spending

### Household monthly total

---

## Style

Secondary information only.

Should not compete visually with spending hero.

---

# 3.9 Floating Add Expense Button

## Importance

Critical interaction point.

---

## Position

### Mobile

* bottom-right floating action button

### Desktop

* sticky bottom-right inside content area

---

## Style

### Shape

* circular
* `size-14`

### Colors

* `bg-primary`
* `text-primary-foreground`

### Shadow

* `shadow-lg`

---

## Icon

* Plus icon

---

## Interaction

### Tap

Opens:

* mobile: Drawer
* desktop: Dialog

---

# 4. Visual Style Guidelines

---

# 4.1 Visual Tone

The UI should feel:

* calm
* premium
* soft
* breathable

Not:

* futuristic
* gaming
* crypto-like

---

# 4.2 Surface Hierarchy

Avoid:

* card inside card inside card

Use:

* spacing
* typography
* subtle borders

to create hierarchy.

---

# 4.3 Color Usage

## Primary Color

Reserved for:

* active states
* key metrics
* CTA buttons

---

## Warning Colors

Used sparingly.

Only for:

* near-limit budgets
* exceeded budgets

---

## Neutral Surfaces

Most surfaces should remain:

* muted
* low contrast
* soft

---

# 4.4 Typography Hierarchy

## Largest Text

Monthly spending number.

---

## Medium Emphasis

Section titles.

---

## Low Emphasis

Descriptions and metadata.

---

# 4.5 Shadows

Use:

* `shadow-sm`
* `shadow-md`

Avoid:

* glow effects
* neon shadows
* heavy elevation

---

# 4.6 Spacing

Use spacing to create clarity.

Preferred rhythm:

* `gap-4`
* `gap-6`

Avoid dense packing.

---

# 5. UX Principles

---

# 5.1 Fast Scanning

The user should understand the screen within 3 seconds.

---

# 5.2 Low Cognitive Load

Avoid:

* too many charts
* too many colors
* too much data at once

---

# 5.3 Mobile First

The mobile layout is the primary experience.

Desktop is an enhanced layout.

---

# 5.4 Content First

Financial data is more important than decoration.

UI polish should support clarity, not distract from it.
