export const insertHouseholdFixture = async (db: D1Database): Promise<void> => {
  await db
    .prepare(
      `INSERT INTO users (id, display_name, primary_email)
       VALUES
       ('u1', 'Owner', 'owner@example.com'),
       ('u2', 'Member', 'member@example.com'),
       ('u3', 'Other Owner', 'other-owner@example.com')`,
    )
    .run()

  await db
    .prepare(
      `INSERT INTO households (
        id,
        name,
        slug,
        default_currency_code,
        timezone,
        created_by_user_id
      )
      VALUES
      ('h1', 'Home Base', 'home-base', 'USD', 'UTC', 'u1'),
      ('h2', 'Second Home', 'second-home', 'USD', 'UTC', 'u3')`,
    )
    .run()

  await db
    .prepare(
      `INSERT INTO household_memberships (
        id,
        household_id,
        user_id,
        role,
        state
      )
      VALUES
      ('hm1', 'h1', 'u1', 'admin', 'active'),
      ('hm2', 'h1', 'u2', 'member', 'active'),
      ('hm3', 'h2', 'u3', 'admin', 'active')`,
    )
    .run()

  await db
    .prepare(
      `INSERT INTO expense_categories (
        id,
        household_id,
        name,
        kind,
        color_token,
        created_by_user_id
      )
      VALUES
      ('cat1', 'h1', 'Groceries', 'expense', 'green', 'u1'),
      ('cat2', 'h2', 'Travel', 'expense', 'blue', 'u3')`,
    )
    .run()

  await db
    .prepare(
      `INSERT INTO expense_groups (
        id,
        household_id,
        name,
        status,
        created_by_user_id
      )
      VALUES
      ('grp1', 'h1', 'Vacation', 'active', 'u1'),
      ('grp2', 'h2', 'Renovation', 'active', 'u3')`,
    )
    .run()

  await db
    .prepare(
      `INSERT INTO expenses (
        id,
        household_id,
        created_by_user_id,
        payer_user_id,
        category_id,
        amount_minor,
        currency_code,
        occurred_at,
        visibility,
        title
      )
      VALUES
      ('exp1', 'h1', 'u1', 'u2', 'cat1', 4250, 'USD', 1713744000000, 'household', 'Groceries run'),
      ('exp2', 'h2', 'u3', 'u3', 'cat2', 9900, 'USD', 1713830400000, 'household', 'Paint supplies')`,
    )
    .run()

  await db
    .prepare(
      `INSERT INTO budgets (
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
      VALUES
      ('bud1', 'h1', 'household', '2026-04', '2026-04-01', '2026-04-30', 'USD', 500000, 'u1')`,
    )
    .run()
}
