-- 0005_incomes.sql
-- Personal income tracking (MVP).
-- Incomes are personal only: no household/group support.
-- Server always sets category_key = 'money-in'.
-- Mirrors expense schema conventions: spent_by_user_id, source_key, kind, deleted_at.

CREATE TABLE IF NOT EXISTS incomes (
  id TEXT PRIMARY KEY,
  spent_by_user_id TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'VND',
  occurred_at INTEGER NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  category_key TEXT NOT NULL DEFAULT 'money-in',
  source_key TEXT NOT NULL DEFAULT 'other',
  kind TEXT NOT NULL DEFAULT 'income' CHECK (kind IN ('income')),
  deleted_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (amount_minor > 0),
  CHECK (currency_code = 'VND'),
  FOREIGN KEY (spent_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_incomes_user_id_occurred_at
  ON incomes(spent_by_user_id, occurred_at DESC);
