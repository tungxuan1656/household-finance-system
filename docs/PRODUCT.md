# Product Overview – Personal & Household Finance System

## 1. Vision

Build a platform where individuals track expenses with zero friction, then optionally expand into household collaboration — without ever leaving the same product.

> **Start personal. Grow into family. Never lose your own view.**

The app begins as the simplest possible expense tracker for one person. As the user's life gets more complex — joining a household, planning an event, setting family budgets — the product scales naturally by adding lenses, not by forcing a different workflow.

---

## 2. Positioning

A tool that is:

- As simple as a personal expense notebook
- Yet scales into a family finance dashboard when needed

Core differentiators:

- **Individual-first, household-aware** — every user starts with their own financial picture; household is an optional layer, not the foundation
- **Lens-based navigation** — users switch between Personal and Household views to see their data from different scopes, with Groups as a cross-cutting filter within any lens
- Not focused on "who owes whom" (no split-bill mechanics)
- Focused on:
  - personal spending awareness
  - household cash flow visibility
  - budget control across all scopes

---

## 3. Target Users & Growth Path

### Primary user (onboarding)

- **Individuals** who want to understand their own spending: "How much did I spend this month?", "What did I spend on?", "Where can I cut back?"

### Expanded use (voluntary, post-onboarding)

- Couples who want transparency into shared finances while maintaining personal privacy
- Multi-generation households tracking both individual contributions and family-level spending
- Anyone organizing event-based spending (vacation, renovation, wedding) through groups

### Key principle

The product must **deliver value from the very first expense entry** — before any household or group exists. Single-player mode is not a fallback; it is the designed starting point.

---

## 4. Core Value Proposition

The app answers questions in layers, from simple to complex:

### Layer 1 — Personal (always available)
- How much did I spend this month?
- Where did my money go? (by category)
- Am I staying within my personal budget?
- Is my spending trending up or down?

### Layer 2 — Household (when user joins one)
- How much did the household spend this month?
- What did I personally contribute to the household?
- Who in the family paid for what?
- Is the household over budget? Is my portion over budget?

### Layer 3 — Group / Event (when user creates one)
- How much has this group spent so far?
- What was spent on each day of this trip?
- Is the group within its allocated budget?

---

## 5. Core Concepts

### 5.1 The Lens Model

The app operates through **lenses** — the user's current viewing context. Every screen (Home, Expenses, Budgets, Insights) respects the active lens.

| Lens | Scope | Availability |
|------|-------|-------------|
| **Personal** | Only the user's own expenses (both private and those shared to households) | Always |
| **Household** | All household-shared expenses + the user's own contributions to that household | When user belongs to ≥1 household |

**Groups are NOT a lens.** Groups are a cross-cutting filter: expenses in any lens (Personal or Household) can be tagged to one or more groups. Filtering by Group narrows results within the current lens — it does not change the data scope.

**Rules:**
- There is no "global active household" that silently applies everywhere. The user explicitly chooses their lens.
- Quick-add always respects the current lens: creating an expense while on Personal lens defaults it to private; creating one on a Household lens prompts explicit household selection.
- The Home screen shows stats and recent activity **for the selected lens**, with an indicator of which lens is active.
- Group filters can be applied on top of any lens to narrow down to tagged expenses only.

### 5.2 Expense Tracking

Each expense includes:

- Amount
- Category (selected from an immutable global catalog)
- Source / payment method (selected from an immutable global catalog)
- Note
- Timestamp
- Creator: the person who enters the expense
- Payer: the person who actually paid (may differ from creator; defaults to creator)

Reference-data model:

- Categories and sources are shared reference data for all users and households.
- End users cannot create, edit, or delete categories/sources.
- UI displays labels from i18n using stable category/source keys.

### 5.3 Personal vs. Household Visibility

Each expense has a `visibility` field:

| Visibility | Who can see it |
|------------|---------------|
| `private` | Only the creator |
| `household` | All members of the specified household |

**Default behavior:**
- New expenses start as `private` by default.
- Switching an expense to `household` requires **explicit user action** and explicit household selection for that submission.
- Category choice does **not** determine visibility. The two decisions are independent.

**Design intent:** Privacy by default. The user consciously decides what to share, and with which household.

### 5.4 Households

A household is a shared space where members can:
- See all household-scoped expenses
- Know who paid, what, and when
- Track household-level budgets

**Structure:**
- A user can belong to **multiple** households (e.g., nuclear family + extended family)
- Each household is an independent unit with its own members, budgets, and expense feed
- Household is **optional**: the product is fully functional without ever creating or joining one

### 5.5 Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage members (invite, remove), full edit/delete rights on household expenses, manage household budgets |
| **Member** | Add household expenses, limited edit/delete rights on own expenses, view household data |

Optional (future-ready):
- Approval flow for large household expenses
- Custom role definitions

### 5.6 Budget Management

**Personal budgets** (always available):
- Monthly spending limit for the individual
- Optional per-category limits (e.g., max 3tr on dining, max 2tr on shopping)
- Planned vs Actual tracking
- Alerts when approaching or exceeding limits

**Household budgets** (when user belongs to a household):
- Monthly spending limit for the household as a whole
- Optional per-category household budgets
- Tracks total household spend + individual contributions
- Budget warnings visible to all members

**Group budgets** (when user creates a group):
- Allocated budget for the group's lifetime or timeframe
- Tracks spending within the group scope

All budgets reference the same global category catalog for per-category limits.

### 5.7 Grouping / Events

A Group (or Event) is a way to cluster related expenses for tracking purposes.

**Examples:** Vacation trip, home renovation, wedding planning, holiday shopping

**Functionality:**
- Create / edit / delete groups
- Assign an expense to one or more groups
- Set a budget per group
- View group-level summaries and reports (timeline, category breakdown)
- Filter by a group to see only tagged expenses within the current lens

**Relationship to households:** A group is independent of households. A personal expense assigned to a group stays personal unless explicitly shared to a household. A household expense can also be assigned to a group.

### 5.8 Filtering & Search

Filter by:
- Date (day / week / month / custom range)
- Category
- Source (payment method)
- Payer
- Visibility (private / household)

Search by:
- Note text
- Amount range
- Group name

### 5.9 Insights & Analytics

Simple, focused insights — no complex AI required.

**Personal lens:**
- Total spending over time
- Category breakdowns (pie/bar)
- Month-over-month comparison
- Top spending categories
- Increasing / decreasing trends

**Household lens:**
- All of the above, aggregated across household members
- Payer attribution (who paid what share)
- Contribution breakdown per member

**Filtering by Group:**
- Timeline view of spending
- Category breakdown within the group
- Budget status (remaining / overspent)

---

## 6. User Experience Principles

- **Single-player first:** Works perfectly for one person from day one. No household or group required.
- **Fast input first:** Add an expense in 2–3 seconds via quick-add accessible everywhere.
- **Default to privacy:** Expenses are private unless explicitly shared. No accidental exposure.
- **Explicit context:** The user always knows which lens they're viewing. No hidden global state.
- **Mobile-friendly:** Optimized for phone use (bottom tab nav, large touch targets) even as a web app.
- **Low cognitive load:** Few choices, sensible defaults, progressive complexity.
- **Transparent extensions:** Household and group features appear as natural additions, not mode switches.

---

## 7. Authentication & Identity

**Sign-in (MVP):**
- Firebase (email/password) — future: Google / Supabase

**Flow:**
1. User signs up / signs in via Firebase Authentication (email/password) on the frontend.
2. Frontend sends the Firebase ID token to the backend.
3. Backend:
   - Verifies the Firebase ID token (e.g., Firebase Admin SDK) and maps/creates a local user record.
   - Issues an application `access token` (short-lived) and a `refresh token` (longer-lived) for the client.
4. Profile management is maintained in the application.

---

## 8. MVP Scope

### Included

| Area | Scope |
|------|-------|
| Auth | Firebase email/password (Google later) |
| Reference data | Global static category/source catalogs |
| Expenses | Full CRUD (amount, category, source, note, date, creator, payer, visibility) |
| Personal tracking | Personal expenses, personal budgets, personal insights — all work with zero setup |
| Households | Create, join, manage members, roles (admin/member) |
| Household visibility | Explicit household sharing per expense |
| Budgets | Monthly total + per-category; personal + household + group |
| Groups | Create, edit, delete; assign expenses; group-level summaries |
| Insights | Period comparisons, category breakdowns, payer attribution — per lens |
| Filtering & search | By date, category, source, payer, visibility, note text, amount, group |

### Out of Scope for MVP

- Split-bill / debt tracking / "who owes whom"
- Advanced AI-driven insights
- Nested households
- Complex automation / recurring expenses
- Bank integrations
- Offline support
- Notification delivery (email/push)

**Keep scope small to ship quickly.**

---

## 9. Roadmap

### Phase 2 (post-MVP)
- Recurring expenses (bills, subscriptions, salary)
- Smart category suggestions based on history
- Budget-exceeded push notifications
- Expense templates (common entries)

### Phase 3
- Advanced insights and trend forecasting
- Financial health score
- Multi-device synchronization optimization
- Export (CSV/PDF) for tax or review purposes

---

## 10. Differentiator (USP)

Not just a personal expense tracker. Not just a bill-splitting app.

It is:

> **A personal expense tracker that grows into a household finance tool — without ever asking the user to switch apps or mindsets.**

The user starts by answering "Where did my money go?" and, only when ready, extends to "Where did our money go?" — all within the same product, same UI, same workflow.

---

## 11. Conclusion

This product deliberately avoids feature-creep and complex fintech ambitions. It stays focused on real human behaviors:

1. **I want to know what I spend.** (Personal)
2. **I want my family to see our shared spending.** (Household)
3. **I want to control budgets for specific events.** (Groups)

Each layer builds on the previous one naturally. No user is forced into a layer they don't need.

If done right:
- Works immediately for a single user without setup
- Expands gracefully when they invite family
- Feels like one cohesive product, not a collection of modes

→ Becomes a daily financial companion, from individual to household.
