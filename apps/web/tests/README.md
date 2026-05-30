# Web E2E Test Suite

## Overview

Comprehensive Playwright E2E test suite covering all web app use cases.

**Skip Sign-in Tests**: Sign-in tests are intentionally skipped because:
- Requires real Firebase account with verified email
- Firebase UI automation is difficult
- Alternative: seed data via API directly, then test authenticated flows

## Test Account

- Email: `tungxuan101998@gmail.com`
- Password: `10101998`

Credentials stored in `.env.test` (gitignored).

## Setup

```bash
# Install Playwright browsers
npx playwright install

# Install dependencies
cd apps/web
pnpm install
```

## Running Tests

```bash
# Run all tests (headless)
cd apps/web
npx playwright test

# Run with UI
npx playwright test --ui

# Run headed (visual)
npx playwright test --headed

# Run specific suite
npx playwright test tests/specs/expenses

# Debug specific test
npx playwright test tests/specs/expenses/create-expense.spec.ts --debug
```

## Seed Test Data

**IMPORTANT**: Before running tests, seed comprehensive test data:

```bash
# Seed all test data via API
npx tsx tests/scripts/seed-test-data.ts demo

# Options:
#   seed    - basic seed (30 daily expenses, 8 categories)
#   demo    - comprehensive seed (30 daily + 30 monthly + 24 yearly + categories + budgets + groups)
#   cleanup - clean up all created test data
```

### Why Seed Data?

Insights tests require multi-date/month/year data for proper validation:
- **Daily**: 30+ expenses over past 30 days
- **Monthly**: Expenses across 3+ months
- **Yearly**: Expenses across 2+ years
- **Categories**: 8 different categories
- **Budgets**: Current and previous month budgets
- **Groups**: Active expense groups

## Test Structure

```
tests/
├── fixtures/
│   ├── auth.setup.ts      # Test fixtures & auth helpers
│   ├── helpers.ts         # Shared test utilities
│   └── test-data.ts       # Data generators
├── pages/
│   ├── index.ts           # Page object exports
│   ├── base.page.ts       # Base page class
│   ├── account.page.ts
│   ├── budgets.page.ts
│   ├── expense-detail.page.ts
│   ├── expenses.page.ts
│   ├── groups.page.ts
│   ├── home.page.ts
│   ├── households.page.ts
│   ├── insights.page.ts
│   └── sign-in.page.ts
├── specs/
│   ├── auth/
│   │   └── skip-signin-note.spec.ts
│   ├── expenses/
│   │   ├── create-expense.spec.ts
│   │   ├── view-expense.spec.ts
│   │   ├── edit-expense.spec.ts
│   │   ├── delete-expense.spec.ts
│   │   └── expense-filters.spec.ts
│   ├── budgets/
│   │   ├── create-budget.spec.ts
│   │   ├── edit-budget.spec.ts
│   │   ├── delete-budget.spec.ts
│   │   └── budget-status.spec.ts
│   ├── groups/
│   │   ├── create-group.spec.ts
│   │   ├── edit-group.spec.ts
│   │   ├── archive-group.spec.ts
│   │   └── group-expenses.spec.ts
│   ├── households/
│   │   ├── create-household.spec.ts
│   │   ├── household-detail.spec.ts
│   │   ├── invite-member.spec.ts
│   │   └── archive-household.spec.ts
│   ├── insights/
│   │   ├── insights-overview.spec.ts
│   │   ├── insights-period-filter.spec.ts
│   │   ├── insights-charts.spec.ts
│   │   └── insights-export.spec.ts
│   ├── overview/
│   │   ├── home-stats.spec.ts
│   │   ├── recent-expenses.spec.ts
│   │   └── view-toggle.spec.ts
│   └── account/
│       ├── profile.spec.ts
│       ├── password-change.spec.ts
│       └── theme-toggle.spec.ts
└── scripts/
    └── seed-test-data.ts
```

## Test Cases Summary

| Feature | Test Cases |
|---------|------------|
| Expenses | 12 (CRUD + filters) |
| Budgets | 10 (CRUD + status) |
| Groups | 8 (CRUD + archive) |
| Households | 8 (CRUD + members + archive) |
| Insights | 14 (all periods + charts + export) |
| Overview | 6 (stats + views) |
| Account | 7 (profile + password + theme) |
| **Total** | **65+ test cases** |

## Using playwright-cli

For interactive debugging:

```bash
# Open browser
playwright-cli open http://localhost:3000

# Navigate and interact
playwright-cli snapshot

# Fill form
playwright-cli fill [selector] "value"

# Click
playwright-cli click [selector]
```

See `playwright-cli` skill for full command reference.

## CI/CD

In CI, tests run headless with retries:

```bash
npx playwright test --reporter=html --project=chromium
```

Report available at `playwright-report/index.html`.

## Known Limitations

1. **Sign-in tests skipped** - requires real Firebase account
2. **Some UI elements** may have different `data-testid` attributes than expected
3. **Download tests** may timeout in slow environments
4. **Theme tests** may conflict with system preferences

## Debugging

```bash
# Show trace for failed test
npx playwright show-trace trace.zip

# Run single test
npx playwright test TC-EXP-001 --trace on

# Debug with breakpoint
npx playwright test TC-EXP-001 --debug
```
