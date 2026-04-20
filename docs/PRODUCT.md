# Product Overview – Household Finance Web App

## 1. Vision

Build a platform that helps families understand, control, and optimize their shared cash flow by recording expenses transparently, tracking budgets, and delivering clear, actionable insights.

> Not for "splitting bills," but for managing family finances together.

---

## 2. Positioning

A tool that is:

- As simple as an expense notebook
- Yet powerful as a family finance dashboard

Core differentiators:

- Family-first (household-centric), not individual-first
- Not focused on “who owes whom”
- Focused on:
  - cash flow
  - spending behavior
  - budget control

---

## 3. Target Users

- Couples managing shared finances
- Multi-generation households
- People who want to control household spending rather than only personal expenses

---

## 4. Core Value Proposition

The app helps answer key family finance questions:

- How much is the household spending each month?
- Where is the money going?
- Are we over budget?
- Is spending trending up or down?
- Who is contributing most financially?

---

## 5. Core Features

### 5.1. Expense Tracking

Each expense includes:

- Amount
- Category (food, utilities, education, etc.)
- Source (cash, account, etc.)
- Note
- Timestamp

Ownership model:

- Creator: the person who enters the expense
- Payer: the person who actually paid (may differ from creator)

---

### 5.2. Personal vs. Household Visibility

Each expense can be:

- Private → visible only to the creator
- Household → shared with the household group

Ensure:

- Transparency when needed
- Privacy when desired

---

### 5.3. Households

Structure:

- A user can belong to multiple households
- Each household is an independent unit

Within a household:

- See all shared expenses
- Know who paid, what, and when

---

### 5.4. Roles & Permissions

Roles:

- Admin
  - Manage members
  - Full edit rights
- Member
  - Add expenses
  - Limited edit/delete rights

Optional (future-ready):

- Approval flow for large expenses

---

### 5.5. Budget Management (Core retention feature)

Setup:

- Monthly budgets
- Optional per-category budgets

Tracking:

- Planned vs Actual
- Alerts when approaching or exceeding budgets

---

### 5.6. Filtering & Search

Filter by:

- Date (day / week / month / range)
- Category
- Payer

Search by:

- Note text
- Amount
- Group (Event / Project)

---

### 5.7. Grouping / Events

Concept:

- Group expenses by events (vacation, wedding, holiday shopping, etc.)
- Track a separate budget per group

Functionality:

- Create / edit / delete groups
- Assign an expense to one or more groups
- View group-level summaries and reports

---

### 5.8. Insights & Analytics (Simple, focused)

Includes:

- Total spending over time
- Category breakdowns
- Comparisons (this month vs last month)

Highlights:

- Top spending categories
- Increasing / decreasing trends

No complex AI required—just accurate, clear, and easy-to-understand insights.

---

## 6. User Experience Principles

- Fast input first: Add an expense in 2–3 seconds
- Mobile-friendly (even though it’s a web app)
- Low cognitive load: few choices and sensible defaults
- Single-player usable: works well even before inviting family members

---

## 7. Authentication & Identity

Sign-in (MVP):

- Firebase (email/password) — future: Google / Supabase

Flow:

1. User signs up / signs in via Firebase Authentication (email/password) on the frontend.
2. Frontend sends the Firebase ID token to the backend.
3. Backend:
   - Verifies the Firebase ID token (e.g., Firebase Admin SDK) and maps/creates a local user record.
   - Issues an application `access token` (short-lived) and a `refresh token` (longer-lived) for the client.
4. Profile management is maintained in the application.

---

## 8. MVP Scope (Lean but usable)

Includes:

- Auth (Firebase email/password; Google later)
- CRUD for expenses (amount, category, source, group, payer, creator, visibility)
- Personal vs household visibility
- Household model + roles (admin / member)
- Payer vs creator
- Monthly budgets
- Grouping (events / projects)
- Basic insights (month comparisons, category breakdowns, group summaries)
- Filtering & search

---

## 9. What’s Out of Scope for MVP

- Split-bill / debt tracking
- Advanced AI-driven insights
- Nested households
- Complex automation
- Bank integrations

Keep scope small to ship quickly.

---

## 10. Roadmap (Post-MVP)

Phase 2:

- Recurring expenses
- Smart category suggestions
- Budget-exceeded notifications

Phase 3:

- Advanced insights
- Financial health score
- Multi-device optimization

---

## 11. Differentiator (USP)

Not just a personal expense tracker and not just a bill-splitting app.

It aims to be:

> The single source of truth for household finances.

---

## 12. Conclusion

This product avoids chasing complex fintech features and instead focuses on real behaviors and everyday needs.

If done right:

- Extremely simple UX
- Clear budgets and insights
- A practical family-first model

→ Becomes a daily household finance management tool.
