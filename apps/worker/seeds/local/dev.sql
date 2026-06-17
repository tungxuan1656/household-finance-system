PRAGMA foreign_keys = ON;

DELETE FROM expense_group_items
WHERE id LIKE 'seed-group-item-%';

INSERT INTO users (id, display_name, primary_email, avatar_url)
VALUES
  ('seed-user-admin', 'Alex Admin', 'alex.admin@example.com', 'https://cdn.example.com/alex-admin.png'),
  ('seed-user-member', 'Morgan Member', 'morgan.member@example.com', 'https://cdn.example.com/morgan-member.png'),
  ('seed-user-partner', 'Riley Partner', 'riley.partner@example.com', 'https://cdn.example.com/riley-partner.png'),
  ('seed-user-guest', 'Jamie Guest', 'jamie.guest@example.com', 'https://cdn.example.com/jamie-guest.png')
ON CONFLICT(id) DO UPDATE SET
  display_name = excluded.display_name,
  primary_email = excluded.primary_email,
  avatar_url = excluded.avatar_url;

INSERT OR IGNORE INTO users (id, display_name, primary_email, avatar_url)
VALUES (
  '01KT3YMJ8GHFQD6K0RM4FJEJT4',
  'Telegram Local Tester',
  'telegram.local@example.com',
  NULL
);

INSERT INTO households (
  id,
  name,
  slug,
  description,
  avatar_url,
  default_currency_code,
  timezone,
  created_by_user_id
)
VALUES
  (
    'seed-household-main',
    'Demo Household',
    'demo-household',
    'Main seeded household with shared spending, groups, and monthly budgets.',
    'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_giadinh_immyso.png',
    'USD',
    'UTC',
    'seed-user-admin'
  ),
  (
    'seed-household-city',
    'City Loft',
    'city-loft',
    'Second seeded household used to exercise multi-household reads for the Telegram test user.',
    'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_dulich_frrimr.png',
    'USD',
    'UTC',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4'
  )
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  avatar_url = excluded.avatar_url,
  default_currency_code = excluded.default_currency_code,
  timezone = excluded.timezone,
  created_by_user_id = excluded.created_by_user_id;

INSERT INTO household_memberships (
  id,
  household_id,
  user_id,
  role,
  state,
  invited_by_user_id,
  joined_at
)
VALUES
  (
    'seed-membership-admin',
    'seed-household-main',
    'seed-user-admin',
    'admin',
    'active',
    NULL,
    1714521600000
  ),
  (
    'seed-membership-member',
    'seed-household-main',
    'seed-user-member',
    'member',
    'active',
    'seed-user-admin',
    1714521600000
  ),
  (
    'seed-membership-partner',
    'seed-household-main',
    'seed-user-partner',
    'member',
    'active',
    'seed-user-admin',
    1714521600000
  ),
  (
    'seed-membership-telegram',
    'seed-household-main',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4',
    'member',
    'active',
    'seed-user-admin',
    1714521600000
  ),
  (
    'seed-membership-telegram-city',
    'seed-household-city',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4',
    'admin',
    'active',
    NULL,
    1717113600000
  ),
  (
    'seed-membership-guest-city',
    'seed-household-city',
    'seed-user-guest',
    'member',
    'active',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4',
    1717200000000
  )
ON CONFLICT(id) DO UPDATE SET
  household_id = excluded.household_id,
  user_id = excluded.user_id,
  role = excluded.role,
  state = excluded.state,
  invited_by_user_id = excluded.invited_by_user_id,
  joined_at = excluded.joined_at,
  archived_at = NULL;

INSERT INTO expense_categories (
  id,
  household_id,
  parent_category_id,
  name,
  kind,
  color_token,
  icon_name,
  created_by_user_id
)
VALUES
  (
    'seed-category-groceries',
    'seed-household-main',
    NULL,
    'Groceries',
    'expense',
    'green',
    'shopping-cart',
    'seed-user-admin'
  ),
  (
    'seed-category-transport',
    'seed-household-main',
    NULL,
    'Transport',
    'expense',
    'blue',
    'car',
    'seed-user-admin'
  ),
  (
    'seed-category-utilities',
    'seed-household-main',
    NULL,
    'Utilities',
    'expense',
    'amber',
    'bolt',
    'seed-user-admin'
  ),
  (
    'seed-category-kids',
    'seed-household-main',
    NULL,
    'Kids',
    'expense',
    'yellow',
    'baby',
    'seed-user-admin'
  ),
  (
    'seed-category-health',
    'seed-household-main',
    NULL,
    'Health',
    'expense',
    'red',
    'heart',
    'seed-user-admin'
  ),
  (
    'seed-category-family',
    'seed-household-main',
    NULL,
    'Family Care',
    'expense',
    'violet',
    'home',
    'seed-user-admin'
  ),
  (
    'seed-category-city-supplies',
    'seed-household-city',
    NULL,
    'Supplies',
    'expense',
    'orange',
    'package',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4'
  ),
  (
    'seed-category-city-repairs',
    'seed-household-city',
    NULL,
    'Repairs',
    'expense',
    'slate',
    'wrench',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4'
  ),
  (
    'seed-category-city-commute',
    'seed-household-city',
    NULL,
    'Commute',
    'expense',
    'cyan',
    'train',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4'
  ),
  (
    'seed-category-city-fun',
    'seed-household-city',
    NULL,
    'Weekend Fun',
    'expense',
    'pink',
    'sparkles',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4'
  )
ON CONFLICT(id) DO UPDATE SET
  household_id = excluded.household_id,
  parent_category_id = excluded.parent_category_id,
  name = excluded.name,
  kind = excluded.kind,
  color_token = excluded.color_token,
  icon_name = excluded.icon_name,
  created_by_user_id = excluded.created_by_user_id,
  archived_at = NULL;

INSERT INTO expense_groups (
  id,
  household_id,
  name,
  description,
  status,
  start_date,
  end_date,
  event_budget_minor,
  created_by_user_id,
  archived_at
)
VALUES
  (
    'seed-group-main-monthly-groceries',
    'seed-household-main',
    'Monthly Groceries',
    'Rolling shared grocery bucket for the main household.',
    'active',
    CAST(strftime('%s', 'now', 'start of month', '+08 hours') AS INTEGER) * 1000,
    CAST(strftime('%s', 'now', 'start of month', '+1 month', '-1 day', '+20 hours') AS INTEGER) * 1000,
    60000,
    'seed-user-admin',
    NULL
  ),
  (
    'seed-group-main-school-run',
    'seed-household-main',
    'School Run',
    'Small recurring kid-related purchases and school snacks.',
    'active',
    CAST(strftime('%s', 'now', 'start of month', '+06 hours') AS INTEGER) * 1000,
    CAST(strftime('%s', 'now', 'start of month', '+1 month', '-1 day', '+18 hours') AS INTEGER) * 1000,
    20000,
    'seed-user-admin',
    NULL
  ),
  (
    'seed-group-vacation',
    'seed-household-main',
    'Summer Trip',
    'Trip planning expenses used to exercise group summaries.',
    'active',
    CAST(strftime('%s', 'now', 'start of month', '+5 day', '+08 hours') AS INTEGER) * 1000,
    CAST(strftime('%s', 'now', 'start of month', '+18 day', '+20 hours') AS INTEGER) * 1000,
    250000,
    'seed-user-admin',
    NULL
  ),
  (
    'seed-group-main-shared-meals',
    'seed-household-main',
    'Shared Meals',
    'Meals that the household reviews together in analytics.',
    'active',
    CAST(strftime('%s', 'now', 'start of month', '+08 hours') AS INTEGER) * 1000,
    CAST(strftime('%s', 'now', 'start of month', '+1 month', '-1 day', '+20 hours') AS INTEGER) * 1000,
    35000,
    'seed-user-partner',
    NULL
  ),
  (
    'seed-group-city-repair-weekend',
    'seed-household-city',
    'Repair Weekend',
    'Fixes and supplies for the City Loft weekend work.',
    'active',
    CAST(strftime('%s', 'now', 'start of month', '+6 day', '+09 hours') AS INTEGER) * 1000,
    CAST(strftime('%s', 'now', 'start of month', '+7 day', '+18 hours') AS INTEGER) * 1000,
    180000,
    '01KT3YMJ8GHFQD6K0RM4FJEJT4',
    NULL
  )
ON CONFLICT(id) DO UPDATE SET
  household_id = excluded.household_id,
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  event_budget_minor = excluded.event_budget_minor,
  created_by_user_id = excluded.created_by_user_id,
  archived_at = excluded.archived_at;

INSERT INTO budgets (
  id,
  household_id,
  scope,
  budget_month,
  start_date,
  end_date,
  currency_code,
  total_limit_minor,
  category_id,
  created_by_user_id,
  archived_at
)
VALUES
  (
    'seed-budget-household-current',
    'seed-household-main',
    'household',
    strftime('%Y-%m', 'now'),
    date('now', 'start of month'),
    date('now', 'start of month', '+1 month', '-1 day'),
    'USD',
    190000,
    NULL,
    'seed-user-admin',
    NULL
  ),
  (
    'seed-budget-household-previous',
    'seed-household-main',
    'household',
    strftime('%Y-%m', 'now', '-1 month'),
    date('now', 'start of month', '-1 month'),
    date('now', 'start of month', '-1 day'),
    'USD',
    175000,
    NULL,
    'seed-user-admin',
    NULL
  ),
  (
    'seed-budget-city-current',
    'seed-household-city',
    'household',
    strftime('%Y-%m', 'now'),
    date('now', 'start of month'),
    date('now', 'start of month', '+1 month', '-1 day'),
    'USD',
    95000,
    NULL,
    '01KT3YMJ8GHFQD6K0RM4FJEJT4',
    NULL
  ),
  (
    'seed-budget-city-previous',
    'seed-household-city',
    'household',
    strftime('%Y-%m', 'now', '-1 month'),
    date('now', 'start of month', '-1 month'),
    date('now', 'start of month', '-1 day'),
    'USD',
    82000,
    NULL,
    '01KT3YMJ8GHFQD6K0RM4FJEJT4',
    NULL
  )
ON CONFLICT(id) DO UPDATE SET
  household_id = excluded.household_id,
  scope = excluded.scope,
  budget_month = excluded.budget_month,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  currency_code = excluded.currency_code,
  total_limit_minor = excluded.total_limit_minor,
  category_id = excluded.category_id,
  created_by_user_id = excluded.created_by_user_id,
  archived_at = excluded.archived_at;

INSERT INTO budget_limits (
  id,
  budget_id,
  household_id,
  category_id,
  category_key,
  limit_minor
)
VALUES
  ('seed-budget-limit-main-current-food', 'seed-budget-household-current', 'seed-household-main', 'seed-category-groceries', 'food', 65000),
  ('seed-budget-limit-main-current-transport', 'seed-budget-household-current', 'seed-household-main', 'seed-category-transport', 'transport', 20000),
  ('seed-budget-limit-main-current-utilities', 'seed-budget-household-current', 'seed-household-main', 'seed-category-utilities', 'living-costs', 35000),
  ('seed-budget-limit-main-current-kids', 'seed-budget-household-current', 'seed-household-main', 'seed-category-kids', 'children', 25000),
  ('seed-budget-limit-main-current-health', 'seed-budget-household-current', 'seed-household-main', 'seed-category-health', 'health', 20000),
  ('seed-budget-limit-main-current-family', 'seed-budget-household-current', 'seed-household-main', 'seed-category-family', 'family', 15000),
  ('seed-budget-limit-main-previous-food', 'seed-budget-household-previous', 'seed-household-main', 'seed-category-groceries', 'food', 60000),
  ('seed-budget-limit-main-previous-transport', 'seed-budget-household-previous', 'seed-household-main', 'seed-category-transport', 'transport', 18000),
  ('seed-budget-limit-main-previous-utilities', 'seed-budget-household-previous', 'seed-household-main', 'seed-category-utilities', 'living-costs', 32000),
  ('seed-budget-limit-main-previous-kids', 'seed-budget-household-previous', 'seed-household-main', 'seed-category-kids', 'children', 22000),
  ('seed-budget-limit-main-previous-health', 'seed-budget-household-previous', 'seed-household-main', 'seed-category-health', 'health', 18000),
  ('seed-budget-limit-city-current-supplies', 'seed-budget-city-current', 'seed-household-city', 'seed-category-city-supplies', 'shopping', 28000),
  ('seed-budget-limit-city-current-repairs', 'seed-budget-city-current', 'seed-household-city', 'seed-category-city-repairs', 'repairs', 26000),
  ('seed-budget-limit-city-current-commute', 'seed-budget-city-current', 'seed-household-city', 'seed-category-city-commute', 'transport', 18000),
  ('seed-budget-limit-city-current-fun', 'seed-budget-city-current', 'seed-household-city', 'seed-category-city-fun', 'hobbies', 12000),
  ('seed-budget-limit-city-previous-supplies', 'seed-budget-city-previous', 'seed-household-city', 'seed-category-city-supplies', 'shopping', 25000),
  ('seed-budget-limit-city-previous-repairs', 'seed-budget-city-previous', 'seed-household-city', 'seed-category-city-repairs', 'repairs', 24000),
  ('seed-budget-limit-city-previous-commute', 'seed-budget-city-previous', 'seed-household-city', 'seed-category-city-commute', 'transport', 18000),
  ('seed-budget-limit-city-previous-fun', 'seed-budget-city-previous', 'seed-household-city', 'seed-category-city-fun', 'hobbies', 11000)
ON CONFLICT(id) DO UPDATE SET
  budget_id = excluded.budget_id,
  household_id = excluded.household_id,
  category_id = excluded.category_id,
  category_key = excluded.category_key,
  limit_minor = excluded.limit_minor;

INSERT INTO expenses (
  id,
  household_id,
  spent_by_user_id,
  category_key,
  source_key,
  category_id,
  amount_minor,
  currency_code,
  occurred_at,
  title,
  note,
  deleted_at
)
VALUES
  ('seed-expense-groceries', 'seed-household-main', 'seed-user-admin', 'food', 'card', 'seed-category-groceries', 15300, 'USD', CAST(strftime('%s', 'now', 'start of month', '-12 day', '+18 hours') AS INTEGER) * 1000, 'Pantry refill', 'Admin restocked shared pantry staples.', NULL),
  ('seed-expense-gas', 'seed-household-main', 'seed-user-member', 'transport', 'cash', 'seed-category-transport', 3200, 'USD', CAST(strftime('%s', 'now', 'start of month', '+2 day', '+18 hours') AS INTEGER) * 1000, 'Fuel stop', 'Shared trip fuel for the household car.', NULL),
  ('seed-expense-admin-main-cur-rent', 'seed-household-main', 'seed-user-admin', 'living-costs', 'bank-transfer', 'seed-category-utilities', 18200, 'USD', CAST(strftime('%s', 'now', 'start of month', '+1 day', '+20 hours') AS INTEGER) * 1000, 'Electric bill', 'Main household utility transfer.', NULL),
  ('seed-expense-partner-main-cur-family', 'seed-household-main', 'seed-user-partner', 'family', 'card', 'seed-category-family', 4700, 'USD', CAST(strftime('%s', 'now', 'start of month', '+3 day', '+17 hours') AS INTEGER) * 1000, 'Family snacks', 'After-school snacks for everyone.', NULL),
  ('seed-expense-guest-city-cur-commute', 'seed-household-city', 'seed-user-guest', 'transport', 'card', 'seed-category-city-commute', 2600, 'USD', CAST(strftime('%s', 'now', 'start of month', '+2 day', '+09 hours') AS INTEGER) * 1000, 'Train pass', 'Guest commute for City Loft errands.', NULL),
  ('seed-expense-guest-city-prev-fun', 'seed-household-city', 'seed-user-guest', 'hobbies', 'cash', 'seed-category-city-fun', 3600, 'USD', CAST(strftime('%s', 'now', 'start of month', '-6 day', '+20 hours') AS INTEGER) * 1000, 'Board game night', 'Weekend game night snacks and table fee.', NULL),
  ('seed-expense-telegram-main-prev-market-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'food', 'card', 'seed-category-groceries', 12400, 'USD', CAST(strftime('%s', 'now', 'start of month', '-13 day', '+18 hours', '+15 minutes') AS INTEGER) * 1000, 'Market produce', 'Fresh vegetables and fruit for the week.', NULL),
  ('seed-expense-telegram-main-prev-school-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'children', 'cash', 'seed-category-kids', 3400, 'USD', CAST(strftime('%s', 'now', 'start of month', '-11 day', '+07 hours', '+40 minutes') AS INTEGER) * 1000, 'School snacks', 'Snacks for the school pickup line.', NULL),
  ('seed-expense-telegram-main-prev-fuel-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'transport', 'card', 'seed-category-transport', 4600, 'USD', CAST(strftime('%s', 'now', 'start of month', '-9 day', '+19 hours') AS INTEGER) * 1000, 'Motorbike fuel', 'Top-up before the office commute.', NULL),
  ('seed-expense-telegram-main-prev-meds-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'health', 'card', 'seed-category-health', 8900, 'USD', CAST(strftime('%s', 'now', 'start of month', '-7 day', '+13 hours', '+10 minutes') AS INTEGER) * 1000, 'Family pharmacy', 'Cold medicine and vitamins.', NULL),
  ('seed-expense-telegram-main-prev-bill-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'living-costs', 'bank-transfer', 'seed-category-utilities', 7600, 'USD', CAST(strftime('%s', 'now', 'start of month', '-5 day', '+21 hours') AS INTEGER) * 1000, 'Water bill split', 'Shared payment for utilities.', NULL),
  ('seed-expense-telegram-main-prev-ride-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'transport', 'card', 'seed-category-transport', 2100, 'USD', CAST(strftime('%s', 'now', 'start of month', '-3 day', '+08 hours', '+30 minutes') AS INTEGER) * 1000, 'Ride to station', 'Early ride for trip planning errands.', NULL),
  ('seed-expense-telegram-main-prev-market-2', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'food', 'card', 'seed-category-groceries', 6900, 'USD', CAST(strftime('%s', 'now', 'start of month', '-1 day', '+19 hours', '+20 minutes') AS INTEGER) * 1000, 'Late market run', 'Quick top-up for dinner ingredients.', NULL),
  ('seed-expense-telegram-main-cur-breakfast-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'food', 'cash', 'seed-category-groceries', 2600, 'USD', CAST(strftime('%s', 'now', 'start of month', '+6 hours', '+40 minutes') AS INTEGER) * 1000, 'Breakfast supplies', 'Bread, milk, and eggs for the first day of the month.', NULL),
  ('seed-expense-telegram-main-cur-bus-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'transport', 'card', 'seed-category-transport', 1800, 'USD', CAST(strftime('%s', 'now', 'start of month', '+08 hours', '+50 minutes') AS INTEGER) * 1000, 'Bus card top-up', 'Transit card reload for the week.', NULL),
  ('seed-expense-telegram-main-cur-water-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'living-costs', 'bank-transfer', 'seed-category-utilities', 5600, 'USD', CAST(strftime('%s', 'now', 'start of month', '+1 day', '+10 hours') AS INTEGER) * 1000, 'Water refill', 'Household dispenser refill.', NULL),
  ('seed-expense-telegram-main-cur-kids-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'children', 'card', 'seed-category-kids', 3900, 'USD', CAST(strftime('%s', 'now', 'start of month', '+1 day', '+12 hours', '+15 minutes') AS INTEGER) * 1000, 'Kids lunch set', 'Lunch add-on for the school run.', NULL),
  ('seed-expense-telegram-dinner', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'food', 'card', 'seed-category-groceries', 2750, 'USD', CAST(strftime('%s', 'now', 'start of month', '+2 day', '+12 hours') AS INTEGER) * 1000, 'Team lunch', 'Seeded Telegram account expense for TMA home testing.', NULL),
  ('seed-expense-telegram-main-cur-pharmacy-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'health', 'card', 'seed-category-health', 2400, 'USD', CAST(strftime('%s', 'now', 'start of month', '+2 day', '+19 hours', '+10 minutes') AS INTEGER) * 1000, 'Pharmacy refill', 'Household first-aid top-up.', NULL),
  ('seed-expense-telegram-main-cur-market-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'food', 'bank-transfer', 'seed-category-groceries', 8300, 'USD', CAST(strftime('%s', 'now', 'start of month', '+3 day', '+08 hours', '+20 minutes') AS INTEGER) * 1000, 'Market basket', 'Fruit, meat, and herbs for shared meals.', NULL),
  ('seed-expense-telegram-main-cur-ride-1', 'seed-household-main', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'transport', 'card', 'seed-category-transport', 2100, 'USD', CAST(strftime('%s', 'now', 'start of month', '+3 day', '+21 hours', '+10 minutes') AS INTEGER) * 1000, 'Ride home', 'Late ride home after errands.', NULL),
  ('seed-expense-telegram-city-prev-tools-1', 'seed-household-city', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'repairs', 'card', 'seed-category-city-repairs', 5400, 'USD', CAST(strftime('%s', 'now', 'start of month', '-10 day', '+15 hours') AS INTEGER) * 1000, 'Hardware screws', 'Small repair parts for the loft.', NULL),
  ('seed-expense-telegram-city-prev-supplies-1', 'seed-household-city', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'shopping', 'cash', 'seed-category-city-supplies', 3100, 'USD', CAST(strftime('%s', 'now', 'start of month', '-4 day', '+14 hours') AS INTEGER) * 1000, 'Storage bins', 'Closet organizers for the loft.', NULL),
  ('seed-expense-telegram-city-cur-commute-1', 'seed-household-city', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'transport', 'card', 'seed-category-city-commute', 2300, 'USD', CAST(strftime('%s', 'now', 'start of month', '+07 hours', '+25 minutes') AS INTEGER) * 1000, 'Taxi to loft', 'Morning taxi to inspect the second household.', NULL),
  ('seed-expense-telegram-city-cur-cleaning-1', 'seed-household-city', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'shopping', 'momo', 'seed-category-city-supplies', 4400, 'USD', CAST(strftime('%s', 'now', 'start of month', '+1 day', '+18 hours') AS INTEGER) * 1000, 'Cleaning supplies', 'Soap, brushes, and towels for the loft.', NULL),
  ('seed-expense-telegram-city-cur-repair-1', 'seed-household-city', '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'repairs', 'card', 'seed-category-city-repairs', 7200, 'USD', CAST(strftime('%s', 'now', 'start of month', '+3 day', '+16 hours', '+40 minutes') AS INTEGER) * 1000, 'Window latch repair', 'Quick repair before guests arrive.', NULL),
  ('seed-expense-telegram-personal-prev-streaming-1', NULL, '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'hobbies', 'card', NULL, 1299, 'USD', CAST(strftime('%s', 'now', 'start of month', '-14 day', '+22 hours') AS INTEGER) * 1000, 'Streaming subscription', 'Personal monthly entertainment subscription.', NULL),
  ('seed-expense-telegram-personal-prev-gym-1', NULL, '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'sports', 'bank-transfer', NULL, 1800, 'USD', CAST(strftime('%s', 'now', 'start of month', '-8 day', '+06 hours', '+30 minutes') AS INTEGER) * 1000, 'Gym drop-in', 'Single personal training session.', NULL),
  ('seed-expense-telegram-personal-cur-mobile-1', NULL, '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'living-costs', 'momo', NULL, 3200, 'USD', CAST(strftime('%s', 'now', 'start of month', '+08 hours') AS INTEGER) * 1000, 'Mobile plan top-up', 'Personal phone data top-up.', NULL),
  ('seed-expense-telegram-personal-cur-coffee-1', NULL, '01KT3YMJ8GHFQD6K0RM4FJEJT4', 'social', 'cash', NULL, 1650, 'USD', CAST(strftime('%s', 'now', 'start of month', '+3 day', '+09 hours', '+30 minutes') AS INTEGER) * 1000, 'Coffee with friend', 'Personal catch-up outside the households.', NULL)
ON CONFLICT(id) DO UPDATE SET
  household_id = excluded.household_id,
  spent_by_user_id = excluded.spent_by_user_id,
  category_key = excluded.category_key,
  source_key = excluded.source_key,
  category_id = excluded.category_id,
  amount_minor = excluded.amount_minor,
  currency_code = excluded.currency_code,
  occurred_at = excluded.occurred_at,
  title = excluded.title,
  note = excluded.note,
  deleted_at = excluded.deleted_at,
  updated_at = unixepoch() * 1000;

INSERT INTO expense_group_items (
  id,
  household_id,
  expense_id,
  group_id,
  assigned_by_user_id
)
VALUES
  ('seed-group-item-main-grocery-1', 'seed-household-main', 'seed-expense-groceries', 'seed-group-main-monthly-groceries', 'seed-user-admin'),
  ('seed-group-item-main-grocery-2', 'seed-household-main', 'seed-expense-telegram-main-prev-market-1', 'seed-group-main-monthly-groceries', 'seed-user-admin'),
  ('seed-group-item-main-grocery-3', 'seed-household-main', 'seed-expense-telegram-main-prev-market-2', 'seed-group-main-monthly-groceries', 'seed-user-admin'),
  ('seed-group-item-main-grocery-4', 'seed-household-main', 'seed-expense-telegram-main-cur-breakfast-1', 'seed-group-main-monthly-groceries', 'seed-user-admin'),
  ('seed-group-item-main-grocery-5', 'seed-household-main', 'seed-expense-telegram-main-cur-market-1', 'seed-group-main-monthly-groceries', '01KT3YMJ8GHFQD6K0RM4FJEJT4'),
  ('seed-group-item-main-school-1', 'seed-household-main', 'seed-expense-telegram-main-prev-school-1', 'seed-group-main-school-run', 'seed-user-admin'),
  ('seed-group-item-main-school-2', 'seed-household-main', 'seed-expense-telegram-main-cur-kids-1', 'seed-group-main-school-run', 'seed-user-admin'),
  ('seed-group-item-main-trip-1', 'seed-household-main', 'seed-expense-telegram-main-prev-ride-1', 'seed-group-vacation', 'seed-user-admin'),
  ('seed-group-item-main-trip-2', 'seed-household-main', 'seed-expense-gas', 'seed-group-vacation', 'seed-user-admin'),
  ('seed-group-item-main-meal-1', 'seed-household-main', 'seed-expense-telegram-dinner', 'seed-group-main-shared-meals', 'seed-user-partner'),
  ('seed-group-item-city-repair-1', 'seed-household-city', 'seed-expense-telegram-city-prev-tools-1', 'seed-group-city-repair-weekend', '01KT3YMJ8GHFQD6K0RM4FJEJT4'),
  ('seed-group-item-city-repair-2', 'seed-household-city', 'seed-expense-telegram-city-cur-repair-1', 'seed-group-city-repair-weekend', '01KT3YMJ8GHFQD6K0RM4FJEJT4')
ON CONFLICT(id) DO UPDATE SET
  household_id = excluded.household_id,
  expense_id = excluded.expense_id,
  group_id = excluded.group_id,
  assigned_by_user_id = excluded.assigned_by_user_id;

INSERT INTO audit_logs (
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
    'seed-audit-membership-telegram-main',
    'seed-household-main',
    'seed-user-admin',
    'household.member.added',
    'household_membership',
    'seed-membership-telegram',
    '{"after":{"role":"member","state":"active"}}'
  ),
  (
    'seed-audit-membership-telegram-city',
    'seed-household-city',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4',
    'household.member.added',
    'household_membership',
    'seed-membership-guest-city',
    '{"after":{"role":"member","state":"active"}}'
  ),
  (
    'seed-audit-expense-telegram-home',
    'seed-household-main',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4',
    'expense.created',
    'expense',
    'seed-expense-telegram-main-cur-market-1',
    '{"after":{"amountMinor":8300,"categoryKey":"food"}}'
  ),
  (
    'seed-audit-budget-city-current',
    'seed-household-city',
    '01KT3YMJ8GHFQD6K0RM4FJEJT4',
    'budget.updated',
    'budget',
    'seed-budget-city-current',
    '{"after":{"period":"current","totalLimitMinor":95000}}'
  )
ON CONFLICT(id) DO UPDATE SET
  household_id = excluded.household_id,
  actor_user_id = excluded.actor_user_id,
  action_type = excluded.action_type,
  target_type = excluded.target_type,
  target_id = excluded.target_id,
  payload_json = excluded.payload_json;
