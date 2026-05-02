-- Migration 0003: Add category_key, source_key, and updated visibility CHECK

-- Create a new table with updated schema including category_key and source_key
CREATE TABLE IF NOT EXISTS expenses_new (
  id TEXT PRIMARY KEY,
  household_id TEXT,
  created_by_user_id TEXT NOT NULL,
  payer_user_id TEXT NOT NULL,
  category_id TEXT,
  category_key TEXT,
  amount_minor INTEGER NOT NULL,
  currency_code TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  visibility TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  source_key TEXT NOT NULL DEFAULT 'other',
  deleted_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (amount_minor > 0),
  CHECK (visibility IN ('private', 'household')),
  CHECK (visibility != 'household' OR household_id IS NOT NULL),
  UNIQUE(household_id, id),
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(payer_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(household_id, category_id) REFERENCES expense_categories(household_id, id) ON DELETE SET NULL
);

-- Migrate data from old table to new table
-- source_key does not exist in the old table; use the column DEFAULT 'other'
-- category_key does not exist in the old table; use NULL
INSERT INTO expenses_new (
  id, household_id, created_by_user_id, payer_user_id, category_id, category_key,
  amount_minor, currency_code, occurred_at, visibility, title, note, source_key,
  deleted_at, created_at, updated_at
)
SELECT
  id, household_id, created_by_user_id, payer_user_id, category_id, NULL AS category_key,
  amount_minor, currency_code, occurred_at, visibility, title, note, 'other' AS source_key,
  deleted_at, created_at, updated_at
FROM expenses;

-- Replace old table with new one
DROP TABLE expenses;
ALTER TABLE expenses_new RENAME TO expenses;

-- Create new indexes for the new catalog keys
CREATE INDEX IF NOT EXISTS idx_expenses_category_key
  ON expenses(category_key);
CREATE INDEX IF NOT EXISTS idx_expenses_source_key
  ON expenses(source_key);