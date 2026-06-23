-- 0003_telegram_bot_expense_create.sql
-- Draft records for bot expense creation flow with duplicate prevention.
-- Expenses table gets created_via_bot marker column.

CREATE TABLE IF NOT EXISTS telegram_bot_expense_drafts (
  id TEXT PRIMARY KEY,
  telegram_user_id TEXT NOT NULL,
  telegram_chat_id TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  preview_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_expense_id TEXT,
  locale TEXT NOT NULL DEFAULT 'vi',
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  UNIQUE(telegram_user_id, dedupe_key)
);

ALTER TABLE expenses ADD COLUMN created_via_bot INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_telegram_bot_expense_drafts_user_status
  ON telegram_bot_expense_drafts(telegram_user_id, status);

CREATE INDEX IF NOT EXISTS idx_telegram_bot_expense_drafts_created_at
  ON telegram_bot_expense_drafts(created_at);
