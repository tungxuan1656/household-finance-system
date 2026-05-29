# Product Overview – Personal & Household Finance System

## 1. Vision

Build a product that helps users **record, understand, control, and optimize spending** in everyday life.

The product must work well for:

- one person living alone
- a couple
- a multi-member household

> The core is clear expense tracking. Household is an added collaboration layer, not a prerequisite for using the product.

---

## 2. Positioning

A tool that is:

- As simple as a personal expense tracker
- But able to grow into a household finance dashboard

Core differentiators:

- Works immediately in personal mode
- Lets users attach an expense to a household when it becomes a shared family expense
- Treats Group/Event as a separate classification layer, independent from household
- Does not focus on debt tracking, split bills, or "who owes whom"
- Focuses on:
  - accurate recording
  - cash-flow visibility
  - spending behavior
  - budget control

---

## 3. Target Users

- People who want to record personal spending every day
- Couples who want visibility into shared spending
- Multi-member households that need transparency around family expenses
- Users who want both a personal finance view and a household finance view

---

## 4. Core Value Proposition

The app answers two layers of questions in parallel.

### 4.1 Personal level

- How much did I spend this month?
- Where is most of my money going?
- Am I over my personal budget?
- Is my spending trend going up or down?

### 4.2 Household level

- How much did the household spend this month?
- Where are shared household expenses going?
- Is the household over budget?
- Which member recorded which expense?

---

## 5. Core Features

---

### 5.1 Expense Model

#### What an expense is

- An expense is a record created by the person who spent the money.
- The product model does not split `payer` and `expense recorder` into separate first-class roles.
- In product terms: **the spender records the expense**.

#### Each expense includes

- Amount
- Category (selected from an immutable global catalog)
- Source / payment method (selected from an immutable global catalog)
- Note
- Timestamp
- Optional household
- Optional group / event

#### Reference-data model

- Categories and sources are shared reference data for the whole system.
- End users cannot create, edit, or delete categories or sources.
- UI displays labels through i18n using stable keys rather than display text as source of truth.

---

### 5.2 What Household Means

#### Role of household

- Household is the context used to mark an expense as **a family expense**.
- An expense can:
  - belong to no household
  - or belong to exactly one household

#### Visibility rules

- If an expense has **no household**:
  - it is a personal expense of the user who recorded it
- If an expense **has a household**:
  - it belongs to that household
  - every member of that household can see it

#### Product rules

- The product does not rely on `private/public` as a separate visibility mode.
- There are only two real states:
  - no household attached
  - household attached
- Category does not decide whether an expense is personal or household.

---

### 5.3 What Group / Event Means

#### Role of group

- Group is used to cluster expenses by purpose, event, or context.
- Group is **independent** from household.

#### Example groups

- Wedding attendance
- Travel
- Tet shopping
- Social drinking

#### Rules

- An expense may belong to no group.
- An expense may belong to one or more groups.
- An expense may:
  - belong to a household but not a group
  - belong to a group but not a household
  - belong to both a household and a group at the same time

#### Functionality

- Create / edit / delete groups
- Assign expenses to groups
- View which expenses belong to a group
- View total spending, category breakdown, and budget status for a group

---

### 5.4 Canonical Examples

- `Attend cousin's wedding – 1,000,000`
  - created by the user
  - may be attached to the user's small household
  - may also be tagged to the `Wedding` group

- `Travel`
  - if solo: no household attached
  - if it is a family trip: attach it to the household
  - either way it may still be tagged to the `Travel` group

- `Haircut`
  - a normal personal expense
  - no household
  - no group

---

### 5.5 Household

#### Structure

- A user may belong to multiple households
- Each household is an independent unit

#### Inside a household

- Members can see all expenses attached to that household
- Members can know:
  - who recorded the expense
  - what was spent
  - when it happened
  - which group it belongs to, if any

---

### 5.6 Roles & Permissions

#### Roles

- **Admin**
  - manage members
  - full edit rights
- **Member**
  - add expenses
  - limited edit / delete rights

#### Optional future-ready behavior

- Approval flow for large expenses

---

### 5.7 Budget Management

#### Setup

- Monthly budgets
- Optional category-based budgets using the same global catalog
- Budgets may exist in personal, household, or group context

#### Tracking

- Planned vs Actual
- Warnings when spending exceeds budget

This is a core retention feature.

---

### 5.8 Filtering & Search

- Filter by:
  - date / week / month / custom range
  - category
  - household
  - group
- Search by:
  - note
  - amount
  - group / event name

---

### 5.9 Insights & Analytics

#### Includes

- Total spending over time
- Category breakdown based on stable catalog keys
- This month vs last month comparison
- Group summaries
- Personal dashboard
- Household dashboard

#### Highlights

- Highest-spend category
- Increasing / decreasing trend
- Highest-spend group

No complex AI is required. It only needs to be correct, clear, and easy to understand.

---

## 6. User Experience Principles

- **Fast input first**
  - Add an expense in 2–3 seconds
- **Mobile-friendly**
- **Low cognitive load**
  - Default to no household and no group
  - Users attach extra context only when needed
- **Single-player usable**
  - The app works well even if the user never creates or joins a household
- **Personal + household side by side**
  - The product supports both a personal finance view and a household finance view

---

## 7. Authentication & Identity

### Sign-in

- Firebase (email/password) — MVP; future: Google / Supabase

### Flow

1. User signs up / signs in via Firebase Authentication (email/password) on the frontend.
2. Frontend sends the Firebase ID token to the backend.
3. Backend:
   - Verifies the Firebase ID token (e.g. Firebase Admin SDK) and maps/creates a local user record.
   - Issues an application `access token` (short-lived) and a `refresh token` (longer-lived) for the client.
4. Profile management lives in the application itself.

---

## 8. MVP Scope

Included:

- Auth (Firebase email/password)
- Global static category/source catalogs as reference data
- Expense CRUD with:
  - amount
  - category
  - source
  - note
  - timestamp
  - optional household
  - optional group / event
- Household + roles (admin/member)
- Grouping (events/projects)
- Monthly budgets
- Basic insights:
  - month comparison
  - category breakdown
  - group summary
  - personal dashboard
  - household dashboard
- Filter & search

Not part of the MVP core model:

- payer vs creator
- private/public visibility mode
- split-bill / debt tracking

---

## 9. Out of Scope for MVP

- Split-bill / debt tracking
- Advanced AI insights
- Nested households
- Complex automation
- Bank integrations

Keep scope small enough to ship quickly.
