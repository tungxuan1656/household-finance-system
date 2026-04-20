PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  primary_email TEXT,
  avatar_url TEXT,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000))
);

CREATE TABLE IF NOT EXISTS auth_identities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_subject TEXT NOT NULL,
  provider_email TEXT,
  last_login_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  UNIQUE(provider, provider_subject),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  user_agent TEXT,
  ip_address TEXT,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS family_members (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (role IN ('owner', 'adult')),
  CHECK (state IN ('invited', 'active')),
  UNIQUE(family_id, user_id),
  UNIQUE(family_id, id),
  FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS child_profiles (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  managed_by_member_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY(family_id, managed_by_member_id) REFERENCES family_members(family_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  actor_member_id TEXT NOT NULL,
  subject_member_id TEXT NOT NULL,
  point_type TEXT NOT NULL,
  point_value INTEGER NOT NULL,
  state TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (point_type IN ('task', 'love')),
  CHECK (point_value > 0),
  CHECK (state IN ('pending', 'approved', 'rejected')),
  UNIQUE(family_id, id),
  FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY(family_id, actor_member_id) REFERENCES family_members(family_id, id) ON DELETE RESTRICT,
  FOREIGN KEY(family_id, subject_member_id) REFERENCES family_members(family_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS contribution_events (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  contribution_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_member_id TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'all',
  note TEXT,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (event_type IN ('submitted', 'approved', 'rejected')),
  CHECK (visibility IN ('all', 'adults_only')),
  FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY(family_id, contribution_id) REFERENCES contributions(family_id, id) ON DELETE RESTRICT,
  FOREIGN KEY(family_id, actor_member_id) REFERENCES family_members(family_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  title TEXT NOT NULL,
  point_type TEXT NOT NULL,
  point_cost INTEGER NOT NULL,
  decision_owner_member_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (point_type IN ('task', 'love')),
  CHECK (point_cost > 0),
  CHECK (status IN ('active', 'archived')),
  UNIQUE(family_id, id),
  FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY(family_id, decision_owner_member_id) REFERENCES family_members(family_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS reward_requests (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  requester_member_id TEXT NOT NULL,
  point_cost_snapshot INTEGER NOT NULL,
  state TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (point_cost_snapshot > 0),
  CHECK (state IN ('submitted', 'accepted', 'rejected', 'delayed', 'fulfilled')),
  UNIQUE(family_id, id),
  FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY(family_id, reward_id) REFERENCES rewards(family_id, id) ON DELETE RESTRICT,
  FOREIGN KEY(family_id, requester_member_id) REFERENCES family_members(family_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS reward_request_events (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  reward_request_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_member_id TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'all',
  note TEXT,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (event_type IN ('submitted', 'accepted', 'rejected', 'delayed', 'fulfilled')),
  CHECK (visibility IN ('all', 'adults_only')),
  FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY(family_id, reward_request_id) REFERENCES reward_requests(family_id, id) ON DELETE RESTRICT,
  FOREIGN KEY(family_id, actor_member_id) REFERENCES family_members(family_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS points_ledger (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  point_type TEXT NOT NULL,
  delta INTEGER NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (point_type IN ('task', 'love')),
  CHECK (delta <> 0),
  CHECK (source_type IN ('contribution', 'reward_request')),
  FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY(family_id, member_id) REFERENCES family_members(family_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS point_balances (
  family_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  point_type TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  PRIMARY KEY (family_id, member_id, point_type),
  CHECK (point_type IN ('task', 'love')),
  FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY(family_id, member_id) REFERENCES family_members(family_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS user_preferences (
  family_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  preferences TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  PRIMARY KEY (family_id, member_id),
  FOREIGN KEY(family_id, member_id) REFERENCES family_members(family_id, id) ON DELETE CASCADE
);

-- Indexes (avoid duplicate index for UNIQUE(provider, provider_subject)).
CREATE INDEX IF NOT EXISTS idx_auth_identities_user_id
  ON auth_identities(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user_id
  ON refresh_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_expires_at
  ON refresh_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_families_created_by
  ON families(created_by);

CREATE INDEX IF NOT EXISTS idx_family_members_user_id
  ON family_members(user_id);

CREATE INDEX IF NOT EXISTS idx_family_members_user_family
  ON family_members(user_id, family_id);

CREATE INDEX IF NOT EXISTS idx_child_profiles_family_managed_by
  ON child_profiles(family_id, managed_by_member_id);

CREATE INDEX IF NOT EXISTS idx_contributions_family_created
  ON contributions(family_id, created_at);

CREATE INDEX IF NOT EXISTS idx_contributions_family_actor_member
  ON contributions(family_id, actor_member_id);

CREATE INDEX IF NOT EXISTS idx_contributions_family_subject_member
  ON contributions(family_id, subject_member_id);

CREATE INDEX IF NOT EXISTS idx_contribution_events_family_contribution_created
  ON contribution_events(family_id, contribution_id, created_at);

CREATE INDEX IF NOT EXISTS idx_contribution_events_family_created
  ON contribution_events(family_id, created_at);

CREATE INDEX IF NOT EXISTS idx_contribution_events_family_actor_member
  ON contribution_events(family_id, actor_member_id);

CREATE INDEX IF NOT EXISTS idx_rewards_family_status_created
  ON rewards(family_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_rewards_family_decision_owner_member
  ON rewards(family_id, decision_owner_member_id);

CREATE INDEX IF NOT EXISTS idx_reward_requests_family_created
  ON reward_requests(family_id, created_at);

CREATE INDEX IF NOT EXISTS idx_reward_requests_family_state_created
  ON reward_requests(family_id, state, created_at);

CREATE INDEX IF NOT EXISTS idx_reward_requests_family_reward
  ON reward_requests(family_id, reward_id);

CREATE INDEX IF NOT EXISTS idx_reward_requests_family_requester_member
  ON reward_requests(family_id, requester_member_id);

CREATE INDEX IF NOT EXISTS idx_reward_request_events_family_request_created
  ON reward_request_events(family_id, reward_request_id, created_at);

CREATE INDEX IF NOT EXISTS idx_reward_request_events_family_created
  ON reward_request_events(family_id, created_at);

CREATE INDEX IF NOT EXISTS idx_reward_request_events_family_actor_member
  ON reward_request_events(family_id, actor_member_id);

CREATE INDEX IF NOT EXISTS idx_points_ledger_family_member
  ON points_ledger(family_id, member_id, created_at);

CREATE INDEX IF NOT EXISTS idx_points_ledger_family_member_type_created
  ON points_ledger(family_id, member_id, point_type, created_at);

CREATE INDEX IF NOT EXISTS idx_points_ledger_source
  ON points_ledger(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_point_balances_family_point_type
  ON point_balances(family_id, point_type);

-- updated_at automation for mutable tables.
CREATE TRIGGER IF NOT EXISTS trg_users_set_updated_at
AFTER UPDATE ON users
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE users SET updated_at = (unixepoch() * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_auth_identities_set_updated_at
AFTER UPDATE ON auth_identities
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE auth_identities SET updated_at = (unixepoch() * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_refresh_sessions_set_updated_at
AFTER UPDATE ON refresh_sessions
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE refresh_sessions SET updated_at = (unixepoch() * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_families_set_updated_at
AFTER UPDATE ON families
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE families SET updated_at = (unixepoch() * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_family_members_set_updated_at
AFTER UPDATE ON family_members
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE family_members SET updated_at = (unixepoch() * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_child_profiles_set_updated_at
AFTER UPDATE ON child_profiles
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE child_profiles SET updated_at = (unixepoch() * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_contributions_set_updated_at
AFTER UPDATE ON contributions
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE contributions SET updated_at = (unixepoch() * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_rewards_set_updated_at
AFTER UPDATE ON rewards
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE rewards SET updated_at = (unixepoch() * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_reward_requests_set_updated_at
AFTER UPDATE ON reward_requests
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE reward_requests SET updated_at = (unixepoch() * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_point_balances_set_updated_at
AFTER UPDATE ON point_balances
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE point_balances
  SET updated_at = (unixepoch() * 1000)
  WHERE family_id = OLD.family_id
    AND member_id = OLD.member_id
    AND point_type = OLD.point_type;
END;

CREATE TRIGGER IF NOT EXISTS trg_user_preferences_set_updated_at
AFTER UPDATE ON user_preferences
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE user_preferences
  SET updated_at = (unixepoch() * 1000)
  WHERE family_id = OLD.family_id
    AND member_id = OLD.member_id;
END;