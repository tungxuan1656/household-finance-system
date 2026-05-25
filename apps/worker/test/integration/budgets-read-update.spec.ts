import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import { insertHouseholdFixture } from '../helpers/household-fixtures'
import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

type BudgetDTO = {
  id: string
  householdId: string
  period: string
  totalLimitMinor: number
  currencyCode: string
  categoryLimits: Array<{
    categoryKey: string
    limitMinor: number
  }>
  createdByUserId: string
  createdAt: number
  updatedAt: number
}

type DeleteBudgetResponse = {
  deleted: true
}

describe('Worker integration: budgets read and update', () => {
  it('gets a budget by id', async () => {
    await insertHouseholdFixture(env.DB)
    const owner = await exchangeAccessToken(
      'test:firebase-user-budget-get:budget-get@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'admin', 'active')`,
    )
      .bind('hm-budget-get', owner.user.id)
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        headers: { authorization: `Bearer ${owner.accessToken}` },
      },
    )
    const payload = await parseJson<ApiEnvelope<BudgetDTO>>(response)

    expect(response.status).toBe(200)
    expect(payload.data).toMatchObject({
      id: 'bud1',
      householdId: 'h1',
      period: '2026-04',
      totalLimitMinor: 500000,
      currencyCode: 'USD',
    })
  })

  it('updates budget totalLimit', async () => {
    await insertHouseholdFixture(env.DB)
    const owner = await exchangeAccessToken(
      'test:firebase-user-budget-update-total:budget-update-total@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'admin', 'active')`,
    )
      .bind('hm-budget-update-total', owner.user.id)
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ totalLimit: 650000 }),
      },
    )
    const payload = await parseJson<ApiEnvelope<BudgetDTO>>(response)

    expect(response.status).toBe(200)
    expect(payload.data.totalLimitMinor).toBe(650000)
  })

  it('updates budget categoryLimits and replaces all', async () => {
    await insertHouseholdFixture(env.DB)
    const owner = await exchangeAccessToken(
      'test:firebase-user-budget-update-categories:budget-update-categories@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'admin', 'active')`,
    )
      .bind('hm-budget-update-cats', owner.user.id)
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          categoryLimits: [
            { categoryKey: 'food', limitMinor: 100000 },
            { categoryKey: 'transport', limitMinor: 50000 },
          ],
        }),
      },
    )
    const payload = await parseJson<ApiEnvelope<BudgetDTO>>(response)

    expect(response.status).toBe(200)
    expect(payload.data.categoryLimits).toEqual([
      { categoryKey: 'food', limitMinor: 100000 },
      { categoryKey: 'transport', limitMinor: 50000 },
    ])
  })

  it('updates budget totalLimit and categoryLimits together', async () => {
    await insertHouseholdFixture(env.DB)
    const owner = await exchangeAccessToken(
      'test:firebase-user-budget-update-both:budget-update-both@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'admin', 'active')`,
    )
      .bind('hm-budget-update-both', owner.user.id)
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          totalLimit: 700000,
          categoryLimits: [{ categoryKey: 'living-costs', limitMinor: 300000 }],
        }),
      },
    )
    const payload = await parseJson<ApiEnvelope<BudgetDTO>>(response)

    expect(response.status).toBe(200)
    expect(payload.data).toMatchObject({
      totalLimitMinor: 700000,
      categoryLimits: [{ categoryKey: 'living-costs', limitMinor: 300000 }],
    })
  })

  it('deletes a budget for admin and hides it from future reads', async () => {
    await insertHouseholdFixture(env.DB)
    const owner = await exchangeAccessToken(
      'test:firebase-user-budget-delete:budget-delete@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'admin', 'active')`,
    )
      .bind('hm-budget-delete', owner.user.id)
      .run()

    const deleteResponse = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${owner.accessToken}` },
      },
    )
    const deletePayload =
      await parseJson<ApiEnvelope<DeleteBudgetResponse>>(deleteResponse)

    expect(deleteResponse.status).toBe(200)
    expect(deletePayload.data).toEqual({ deleted: true })

    const getResponse = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        headers: { authorization: `Bearer ${owner.accessToken}` },
      },
    )
    const getPayload = await parseJson<ApiErrorEnvelope>(getResponse)

    expect(getResponse.status).toBe(404)
    expect(getPayload.error.code).toBe('NOT_FOUND')
  })

  it('rejects update budget with empty body', async () => {
    await insertHouseholdFixture(env.DB)
    const owner = await exchangeAccessToken(
      'test:firebase-user-budget-update-empty:budget-update-empty@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'admin', 'active')`,
    )
      .bind('hm-budget-update-empty', owner.user.id)
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects unauthenticated budget request', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/budgets/bud1')
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects non-admin member create budget', async () => {
    await insertHouseholdFixture(env.DB)
    const member = await exchangeAccessToken(
      'test:firebase-user-budget-member-create:budget-member-create@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'member', 'active')`,
    )
      .bind('hm-budget-member-create', member.user.id)
      .run()

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${member.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        householdId: 'h1',
        period: '2026-05',
        totalLimit: 100000,
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('rejects non-admin member update budget', async () => {
    await insertHouseholdFixture(env.DB)
    const member = await exchangeAccessToken(
      'test:firebase-user-budget-member-update:budget-member-update@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'member', 'active')`,
    )
      .bind('hm-budget-member-update', member.user.id)
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ totalLimit: 600000 }),
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('rejects non-admin member delete budget', async () => {
    await insertHouseholdFixture(env.DB)
    const member = await exchangeAccessToken(
      'test:firebase-user-budget-member-delete:budget-member-delete@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'member', 'active')`,
    )
      .bind('hm-budget-member-delete', member.user.id)
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${member.accessToken}` },
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('returns not found for a non-member budget get', async () => {
    await insertHouseholdFixture(env.DB)
    const outsider = await exchangeAccessToken(
      'test:firebase-user-budget-outsider-get:budget-outsider-get@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/bud1',
      {
        headers: { authorization: `Bearer ${outsider.accessToken}` },
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('returns not found for missing budget id', async () => {
    await insertHouseholdFixture(env.DB)
    const owner = await exchangeAccessToken(
      'test:firebase-user-budget-missing-get:budget-missing-get@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'admin', 'active')`,
    )
      .bind('hm-budget-missing-get', owner.user.id)
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/non-existent',
      {
        headers: { authorization: `Bearer ${owner.accessToken}` },
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('returns not found when deleting a missing budget id', async () => {
    await insertHouseholdFixture(env.DB)
    const owner = await exchangeAccessToken(
      'test:firebase-user-budget-missing-delete:budget-missing-delete@example.com',
    )

    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state)
       VALUES (?, 'h1', ?, 'admin', 'active')`,
    )
      .bind('hm-budget-missing-delete', owner.user.id)
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets/non-existent',
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${owner.accessToken}` },
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe('NOT_FOUND')
  })
})
