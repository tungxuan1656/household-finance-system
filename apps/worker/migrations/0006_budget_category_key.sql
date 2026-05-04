-- Transition budgets and budget_limits to use category_key for budget limit mappings.
-- 1. Add category_key to budget_limits, replace unique constraint on (budget_id, category_id)
--    with unique on (budget_id, category_key) WHERE category_key IS NOT NULL.
-- 2. Remove the scope/category_id CHECK constraint from budgets (we only use scope='household').
-- 3. Drop idx_budgets_category_scope_month (no longer needed).
-- SQLite does not support dropping CHECK constraints or altering columns in place,
-- so we recreate the affected tables.

PRAGMA foreign_keys = OFF;

-- Recreate budget_limits: add category_key, keep category_id nullable, replace unique constraint
CREATE TABLE IF NOT EXISTS budget_limits_new (
  id TEXT PRIMARY KEY,
  budget_id TEXT NOT NULL,
  household_id TEXT NOT NULL,
  category_id TEXT,
  category_key TEXT,
  limit_minor INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (limit_minor > 0),
  UNIQUE(household_id, id),
  FOREIGN KEY(budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(household_id, category_id) REFERENCES expense_categories(household_id, id) ON DELETE CASCADE
);

INSERT INTO budget_limits_new (
  id, budget_id, household_id, category_id, limit_minor, created_at, updated_at
) SELECT
  id, budget_id, household_id, category_id, limit_minor, created_at, updated_at
FROM budget_limits;

DROP TABLE budget_limits;
ALTER TABLE budget_limits_new RENAME TO budget_limits;

CREATE INDEX IF NOT EXISTS idx_budget_limits_budget_id
  ON budget_limits(budget_id);

CREATE INDEX IF NOT EXISTS idx_budget_limits_household_category
  ON budget_limits(household_id, category_id);

CREATE INDEX IF NOT EXISTS idx_budget_limits_category_key
  ON budget_limits(category_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_limits_budget_category_key
  ON budget_limits(budget_id, category_key)
  WHERE category_key IS NOT NULL;

-- Recreate budgets: remove the scope/category_id CHECK constraint
CREATE TABLE IF NOT EXISTS budgets_new (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  budget_month TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  total_limit_minor INTEGER NOT NULL,
  category_id TEXT,
  created_by_user_id TEXT NOT NULL,
  archived_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (scope IN ('household', 'category')),
  CHECK (total_limit_minor > 0),
  UNIQUE(household_id, id),
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(household_id, category_id) REFERENCES expense_categories(household_id, id) ON DELETE CASCADE,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

INSERT INTO budgets_new (
  id, household_id, scope, budget_month, start_date, end_date,
  currency_code, total_limit_minor, category_id, created_by_user_id,
  archived_at, created_at, updated_at
) SELECT
  id, household_id, scope, budget_month, start_date, end_date,
  currency_code, total_limit_minor, category_id, created_by_user_id,
  archived_at, created_at, updated_at
FROM budgets;

DROP TABLE budgets;
ALTER TABLE budgets_new RENAME TO budgets;

CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_household_scope_month
  ON budgets(household_id, budget_month)
  WHERE scope = 'household' AND archived_at IS NULL;

-- Note: idx_budgets_category_scope_month is intentionally NOT recreated
-- since we no longer use scope='category' for budgets.

CREATE INDEX IF NOT EXISTS idx_budgets_created_by_user_id
  ON budgets(created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_household_category
  ON budgets(household_id, category_id);

PRAGMA foreign_keys = ON;