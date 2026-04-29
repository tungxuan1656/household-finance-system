import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import { insertHouseholdFixture } from '../helpers/household-fixtures'
import { registerWorkerIntegrationSetup } from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration: database integrity constraints', () => {
  it('rejects duplicate household membership for the same user and household', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
        `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state
        )
        VALUES ('hm4', 'h1', 'u2', 'member', 'invited')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects invalid membership role and expense visibility values', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
        `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state
        )
        VALUES ('hm4', 'h1', 'u3', 'owner', 'active')`,
      ).run(),
    ).rejects.toThrow()

    await expect(
      env.DB.prepare(
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
        VALUES ('exp3', 'h1', 'u1', 'u2', 'cat1', 1000, 'USD', 1713916800000, 'team', 'Invalid visibility')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects cross-household expense group assignment', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
        `INSERT INTO expense_group_items (
          id,
          household_id,
          expense_id,
          group_id,
          assigned_by_user_id
        )
        VALUES ('egi1', 'h2', 'exp1', 'grp2', 'u3')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects duplicate category names within a household', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
        `INSERT INTO expense_categories (
          id,
          household_id,
          name,
          kind,
          created_by_user_id
        )
        VALUES ('cat3', 'h1', 'Groceries', 'expense', 'u1')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects duplicate expense to group assignment', async () => {
    await insertHouseholdFixture(env.DB)

    await env.DB.prepare(
      `INSERT INTO expense_group_items (
        id,
        household_id,
        expense_id,
        group_id,
        assigned_by_user_id
      )
      VALUES ('egi1', 'h1', 'exp1', 'grp1', 'u1')`,
    ).run()

    await expect(
      env.DB.prepare(
        `INSERT INTO expense_group_items (
          id,
          household_id,
          expense_id,
          group_id,
          assigned_by_user_id
        )
        VALUES ('egi2', 'h1', 'exp1', 'grp1', 'u1')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects duplicate household budget scope for the same month', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
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
        VALUES ('bud2', 'h1', 'household', '2026-04', '2026-04-01', '2026-04-30', 'USD', 600000, 'u1')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('records audit log entries for household actions', async () => {
    await insertHouseholdFixture(env.DB)

    await env.DB.prepare(
      `INSERT INTO audit_logs (
        id,
        household_id,
        actor_user_id,
        action_type,
        target_type,
        target_id,
        payload_json
      )
      VALUES (
        'audit1',
        'h1',
        'u1',
        'household.member.added',
        'household_membership',
        'hm2',
        '{"after":{"role":"member","state":"active"}}'
      )`,
    ).run()

    const auditRows = await env.DB.prepare(
      `SELECT action_type, target_type, target_id
         FROM audit_logs
         WHERE household_id = ?
         ORDER BY created_at DESC`,
    )
      .bind('h1')
      .all<{
        action_type: string
        target_type: string
        target_id: string
      }>()

    expect(auditRows.results).toEqual([
      {
        action_type: 'household.member.added',
        target_type: 'household_membership',
        target_id: 'hm2',
      },
    ])
  })
})
