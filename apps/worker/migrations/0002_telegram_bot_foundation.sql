-- 0002_telegram_bot_foundation.sql
-- Telegram bot chat preferences and linking state.
-- No access or refresh tokens are stored in this table.

CREATE TABLE IF NOT EXISTS telegram_bot_chats (
  id TEXT PRIMARY KEY,
  telegram_user_id TEXT NOT NULL,
  telegram_chat_id TEXT NOT NULL,
  user_id TEXT,
  preferences TEXT NOT NULL DEFAULT '{"budget_alerts":true,"household_activity":false,"weekly_digest":false}',
  locale TEXT NOT NULL DEFAULT 'vi',
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_telegram_bot_chats_telegram_user_id
  ON telegram_bot_chats(telegram_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_telegram_bot_chats_telegram_chat_id
  ON telegram_bot_chats(telegram_chat_id);

CREATE INDEX IF NOT EXISTS idx_telegram_bot_chats_user_id
  ON telegram_bot_chats(user_id);
