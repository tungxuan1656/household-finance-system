CREATE TABLE IF NOT EXISTS household_invitations (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  invited_role TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  used_by_user_id TEXT,
  created_by_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (invited_role IN ('admin', 'member')),
  UNIQUE(household_id, id),
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(used_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_household_invitations_token_hash
  ON household_invitations(token_hash);

CREATE INDEX IF NOT EXISTS idx_household_invitations_household_id_expires_at
  ON household_invitations(household_id, expires_at);
