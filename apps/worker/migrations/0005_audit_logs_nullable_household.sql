-- Make audit_logs.household_id nullable to support private expense audit entries
-- SQLite does not support ALTER COLUMN, so we recreate the table.

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS audit_logs_new (
  id TEXT PRIMARY KEY,
  household_id TEXT,
  actor_user_id TEXT,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  UNIQUE(household_id, id),
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO audit_logs_new SELECT * FROM audit_logs;
DROP TABLE audit_logs;
ALTER TABLE audit_logs_new RENAME TO audit_logs;

CREATE INDEX IF NOT EXISTS idx_audit_logs_household_created_at
  ON audit_logs(household_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created_at
  ON audit_logs(actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_target
  ON audit_logs(household_id, target_type, target_id, created_at DESC);

PRAGMA foreign_keys = ON;
