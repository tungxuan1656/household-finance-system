PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO users (id, display_name, primary_email, avatar_url)
VALUES
  ('seed-user-admin', 'Alex Admin', 'alex.admin@example.com', 'https://cdn.example.com/alex-admin.png'),
  ('seed-user-member', 'Morgan Member', 'morgan.member@example.com', 'https://cdn.example.com/morgan-member.png');

INSERT OR IGNORE INTO households (
  id,
  name,
  slug,
  description,
  default_currency_code,
  timezone,
  default_visibility,
  created_by_user_id
)
VALUES (
  'seed-household-main',
  'Demo Household',
  'demo-household',
  'Local development household for expense, budget, and audit flows.',
  'USD',
  'UTC',
  'household',
  'seed-user-admin'
);

INSERT OR IGNORE INTO household_memberships (
  id,
  household_id,
  user_id,
  role,
  state,
  joined_at
)
VALUES
  ('seed-membership-admin', 'seed-household-main', 'seed-user-admin', 'admin', 'active', 1714521600000),
  ('seed-membership-member', 'seed-household-main', 'seed-user-member', 'member', 'active', 1714521600000);

INSERT OR IGNORE INTO expense_categories (
  id,
  household_id,
  name,
  kind,
  color_token,
  icon_name,
  created_by_user_id
)
VALUES
  ('seed-category-groceries', 'seed-household-main', 'Groceries', 'expense', 'green', 'shopping-cart', 'seed-user-admin'),
  ('seed-category-transport', 'seed-household-main', 'Transport', 'expense', 'blue', 'car', 'seed-user-admin');

INSERT OR IGNORE INTO expense_groups (
  id,
  household_id,
  name,
  description,
  status,
  start_date,
  end_date,
  event_budget_minor,
  created_by_user_id
)
VALUES (
  'seed-group-vacation',
  'seed-household-main',
  'Summer Trip',
  'Seeded event group for manual local testing.',
  'active',
  '2026-06-01',
  '2026-06-10',
  250000,
  'seed-user-admin'
);

INSERT OR IGNORE INTO expenses (
  id,
  household_id,
  created_by_user_id,
  payer_user_id,
  category_id,
  amount_minor,
  currency_code,
  occurred_at,
  visibility,
  title,
  note
)
VALUES
  (
    'seed-expense-groceries',
    'seed-household-main',
    'seed-user-admin',
    'seed-user-admin',
    'seed-category-groceries',
    8450,
    'USD',
    1714608000000,
    'household',
    'Weekly groceries',
    'Seeded pantry and produce expense.'
  ),
  (
    'seed-expense-gas',
    'seed-household-main',
    'seed-user-member',
    'seed-user-member',
    'seed-category-transport',
    3200,
    'USD',
    1714694400000,
    'household',
    'Fuel stop',
    'Seeded commute expense.'
  );

INSERT OR IGNORE INTO expense_group_items (
  id,
  household_id,
  expense_id,
  group_id,
  assigned_by_user_id
)
VALUES (
  'seed-group-item-1',
  'seed-household-main',
  'seed-expense-gas',
  'seed-group-vacation',
  'seed-user-admin'
);

INSERT OR IGNORE INTO budgets (
  id,
  household_id,
  scope,
  budget_month,
  start_date,
  end_date,
  currency_code,
  total_limit_minor,
  created_by_user_id
)
VALUES (
  'seed-budget-household-2026-05',
  'seed-household-main',
  'household',
  '2026-05',
  '2026-05-01',
  '2026-05-31',
  'USD',
  150000,
  'seed-user-admin'
);

INSERT OR IGNORE INTO budget_limits (
  id,
  budget_id,
  household_id,
  category_id,
  limit_minor
)
VALUES
  (
    'seed-budget-limit-groceries',
    'seed-budget-household-2026-05',
    'seed-household-main',
    'seed-category-groceries',
    50000
  ),
  (
    'seed-budget-limit-transport',
    'seed-budget-household-2026-05',
    'seed-household-main',
    'seed-category-transport',
    20000
  );

INSERT OR IGNORE INTO audit_logs (
  id,
  household_id,
  actor_user_id,
  action_type,
  target_type,
  target_id,
  payload_json
)
VALUES
  (
    'seed-audit-membership',
    'seed-household-main',
    'seed-user-admin',
    'household.member.added',
    'household_membership',
    'seed-membership-member',
    '{"after":{"role":"member","state":"active"}}'
  ),
  (
    'seed-audit-expense',
    'seed-household-main',
    'seed-user-member',
    'expense.created',
    'expense',
    'seed-expense-gas',
    '{"after":{"amountMinor":3200,"visibility":"household"}}'
  );
