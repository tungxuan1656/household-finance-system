-- 0001_init.sql
-- Consolidated canonical schema for the Household Finance System.
-- Project is pre-release: this migration is the single source of truth.
-- All earlier additive migrations (avatar_url, personal budgets) are folded in here.

PRAGMA foreign_keys = ON;

-- Users and authentication/session tables.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  primary_email TEXT,
  avatar_url TEXT,
  quick_add_last_source_key TEXT,
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

-- Households (avatar_url is part of the initial shape).
CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  avatar_url TEXT,
  default_currency_code TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL,
  archived_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS household_memberships (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  state TEXT NOT NULL,
  invited_by_user_id TEXT,
  joined_at INTEGER,
  archived_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (role IN ('admin', 'member')),
  CHECK (state IN ('invited', 'active', 'left', 'removed')),
  UNIQUE(household_id, user_id),
  UNIQUE(household_id, id),
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(invited_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

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

CREATE TABLE IF NOT EXISTS expense_categories (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  parent_category_id TEXT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'expense',
  color_token TEXT,
  icon_name TEXT,
  created_by_user_id TEXT NOT NULL,
  archived_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (kind IN ('expense', 'income')),
  UNIQUE(household_id, id),
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(household_id, parent_category_id) REFERENCES expense_categories(household_id, id) ON DELETE SET NULL,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS expense_groups (
  id TEXT PRIMARY KEY,
  household_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TEXT,
  end_date TEXT,
  event_budget_minor INTEGER,
  created_by_user_id TEXT NOT NULL,
  archived_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (status IN ('active', 'archived')),
  CHECK (event_budget_minor IS NULL OR event_budget_minor > 0),
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  household_id TEXT,
  spent_by_user_id TEXT NOT NULL,
  category_id TEXT,
  category_key TEXT,
  amount_minor INTEGER NOT NULL,
  currency_code TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  source_key TEXT NOT NULL DEFAULT 'other',
  deleted_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  updated_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  CHECK (amount_minor > 0),
  CHECK (
    (household_id IS NULL AND category_id IS NULL)
    OR household_id IS NOT NULL
  ),
  UNIQUE(household_id, id),
  FOREIGN KEY(household_id) REFERENCES households(id) ON DELETE CASCADE,
  FOREIGN KEY(spent_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(household_id, category_id) REFERENCES expense_categories(household_id, id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS expense_group_items (
  id TEXT PRIMARY KEY,
  household_id TEXT,
  expense_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  assigned_by_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT ((unixepoch() * 1000)),
  UNIQUE(household_id, id),
  UNIQUE(household_id, expense_id, group_id),
  FOREIGN KEY(expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY(group_id) REFERENCES expense_groups(id) ON DELETE CASCADE,
  FOREIGN KEY(assigned_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Budgets support three scopes:
--   household: household_id NOT NULL, owner_user_id NULL
--   personal:  owner_user_id NOT NULL, household_id NULL
--   category:  legacy (not exposed in API yet)
CREATE TABLE IF NOT EXISTS budgets (
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

-- Budget limits are nullable on household_id (personal budgets have no household).
CREATE TABLE IF NOT EXISTS budget_limits (
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

CREATE TABLE IF NOT EXISTS audit_logs (
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

CREATE INDEX IF NOT EXISTS idx_auth_identities_user_id
  ON auth_identities(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user_id
  ON refresh_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_expires_at
  ON refresh_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_households_created_by
  ON households(created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_household_memberships_user_id
  ON household_memberships(user_id);

CREATE INDEX IF NOT EXISTS idx_household_memberships_household_role_state
  ON household_memberships(household_id, role, state);

CREATE INDEX IF NOT EXISTS idx_household_invitations_token_hash
  ON household_invitations(token_hash);

CREATE INDEX IF NOT EXISTS idx_household_invitations_household_id_expires_at
  ON household_invitations(household_id, expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_expense_categories_household_name_active
  ON expense_categories(household_id, name)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_expense_categories_parent
  ON expense_categories(household_id, parent_category_id);

CREATE INDEX IF NOT EXISTS idx_expense_categories_created_by_user_id
  ON expense_categories(created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_expense_groups_household_status_created
  ON expense_groups(household_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_expense_groups_created_by_user_id
  ON expense_groups(created_by_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_expense_groups_household_name_active
  ON expense_groups(household_id, name)
  WHERE household_id IS NOT NULL AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_household_occurred_at
  ON expenses(household_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_household_category
  ON expenses(household_id, category_id);

CREATE INDEX IF NOT EXISTS idx_expenses_spent_by_user_id
  ON expenses(spent_by_user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_deleted_at
  ON expenses(deleted_at);

CREATE INDEX IF NOT EXISTS idx_expenses_category_key
  ON expenses(category_key);

CREATE INDEX IF NOT EXISTS idx_expenses_source_key
  ON expenses(source_key);

CREATE INDEX IF NOT EXISTS idx_expense_group_items_group_id
  ON expense_group_items(group_id);

CREATE INDEX IF NOT EXISTS idx_expense_group_items_expense_id
  ON expense_group_items(expense_id);

CREATE INDEX IF NOT EXISTS idx_expense_group_items_household_id
  ON expense_group_items(household_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_expense_group_items_household_expense_group
  ON expense_group_items(household_id, expense_id, group_id);

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

CREATE INDEX IF NOT EXISTS idx_budget_limits_budget_id
  ON budget_limits(budget_id);

CREATE INDEX IF NOT EXISTS idx_budget_limits_household_category
  ON budget_limits(household_id, category_id);

CREATE INDEX IF NOT EXISTS idx_budget_limits_category_key
  ON budget_limits(category_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_limits_budget_category_key
  ON budget_limits(budget_id, category_key)
  WHERE category_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_household_created_at
  ON audit_logs(household_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created_at
  ON audit_logs(actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_target
  ON audit_logs(household_id, target_type, target_id, created_at DESC);