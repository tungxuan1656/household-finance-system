-- 0003_personal_budgets.sql
-- Add personal scope to budgets and budget_limits tables.
-- Personal budgets belong to a single user (owner_user_id) and have no household.
-- Household budgets keep their existing scope and shape.

-- 1. Recreate budget_limits with nullable household_id (personal budgets have no household).
CREATE TABLE budget_limits_new (
  id TEXT PRIMARY KEY,
  budget_id TEXT NOT NULL,
  household_id TEXT,
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
  id, budget_id, household_id, category_id, category_key, limit_minor, created_at, updated_at
) SELECT
  id, budget_id, household_id, category_id, category_key, limit_minor, created_at, updated_at
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

-- 2. Recreate budgets with owner_user_id and widened scope CHECK constraint.
--    Scope rules:
--      household: household_id NOT NULL, owner_user_id NULL
--      personal:  owner_user_id NOT NULL, household_id NULL
--      category:  legacy (no constraints enforced here, not exposed in API yet)
CREATE TABLE budgets_new (
  id TEXT PRIMARY KEY,
  household_id TEXT,
  owner_user_id TEXT,
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
  CHECK (scope IN ('household', 'category', 'personal')),
  CHECK (total_limit_minor > 0),
  CHECK (
    (scope = 'household' AND household_id IS NOT NULL AND owner_user_id IS NULL)
    OR (scope = 'personal' AND owner_user_id IS NOT NULL AND household_id IS NULL)
    OR (scope = 'category')
  ),
  UNIQUE(household_id, id),
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_owner_scope_month
  ON budgets(owner_user_id, budget_month)
  WHERE scope = 'personal' AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_budgets_created_by_user_id
  ON budgets(created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_household_category
  ON budgets(household_id, category_id);

CREATE INDEX IF NOT EXISTS idx_budgets_owner_user_id
  ON budgets(owner_user_id);
