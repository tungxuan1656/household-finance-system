-- 0004_telegram_bot_notification_deliveries.sql
-- Delivery log for bot notifications with deduplication support.

CREATE TABLE IF NOT EXISTS telegram_bot_notification_deliveries (
  id TEXT PRIMARY KEY,
  telegram_user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at INTEGER NOT NULL,
  error_message TEXT,
  payload_json TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_dedupe
  ON telegram_bot_notification_deliveries(telegram_user_id, notification_type, dedupe_key);

CREATE INDEX IF NOT EXISTS idx_notif_user
  ON telegram_bot_notification_deliveries(telegram_user_id);
