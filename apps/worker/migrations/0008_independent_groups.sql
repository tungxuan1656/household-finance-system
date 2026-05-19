PRAGMA foreign_keys = OFF;

ALTER TABLE expense_groups RENAME TO expense_groups_old;
CREATE TABLE expense_groups (
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
  CHECK (event_budget_minor IS NULL OR event_budget_minor > 0)
);
INSERT INTO expense_groups SELECT * FROM expense_groups_old;
DROP TABLE expense_groups_old;

CREATE INDEX idx_expense_groups_household_status_created
  ON expense_groups(household_id, status, created_at);

CREATE INDEX idx_expense_groups_created_by_user_id
  ON expense_groups(created_by_user_id);

CREATE UNIQUE INDEX idx_expense_groups_household_name_active
  ON expense_groups(household_id, name)
  WHERE household_id IS NOT NULL AND archived_at IS NULL;

ALTER TABLE expense_group_items RENAME TO expense_group_items_old;
CREATE TABLE expense_group_items (
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
INSERT INTO expense_group_items SELECT * FROM expense_group_items_old;
DROP TABLE expense_group_items_old;

CREATE INDEX idx_expense_group_items_expense_id
  ON expense_group_items(expense_id);

CREATE INDEX idx_expense_group_items_group_id
  ON expense_group_items(group_id);

CREATE INDEX idx_expense_group_items_household_id
  ON expense_group_items(household_id);

CREATE UNIQUE INDEX idx_expense_group_items_household_expense_group
  ON expense_group_items(household_id, expense_id, group_id);

UPDATE expenses
   SET source_key = 'momo'
 WHERE source_key = 'e-wallet';

PRAGMA foreign_keys = ON;
