-- Migration 0004: Add indexes for expense feed queries

-- Optimizes personal feed: user sees own private expenses + household expenses they created
CREATE INDEX IF NOT EXISTS idx_expenses_user_visibility_occurred_at
  ON expenses(created_by_user_id, visibility, occurred_at DESC);

-- Optimizes soft-delete filter: WHERE deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_expenses_deleted_at
  ON expenses(deleted_at);
