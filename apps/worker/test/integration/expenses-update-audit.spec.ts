import { describe, expect, it } from 'vitest'

import {
  SELF,
  env,
  type ApiEnvelope,
  authorizedJsonRequest,
  createExpense,
  createHousehold,
  exchangeAccessToken,
  parseJson,
} from './expenses-update.test-setup'

describe('PATCH /api/v1/expenses audit updates', () => {
  it('updates an owned household expense and writes an audit entry', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-update-owner:update-owner@example.com',
    )
    const householdResponse = await createHousehold(
      auth.accessToken,
      'Expense update household',
    )
    expect(householdResponse.status).toBe(201)

    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id
    const createResponse = await createExpense(auth.accessToken, {
      amount: 125000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Original lunch',
      occurredAt: Date.now() - 1_000,
      note: 'before update',
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const updateResponse = await authorizedJsonRequest(auth.accessToken, {
      method: 'PATCH',
      path: `/api/v1/expenses/${created.data.id}`,
      body: {
        amount: 155000,
        categoryKey: 'travel',
        sourceKey: 'bank-transfer',
        visibility: 'household',
        householdId,
        title: 'Updated lunch',
        occurredAt: Date.now(),
        note: 'after update',
      },
    })
    expect(updateResponse.status).toBe(200)

    const updatePayload =
      await parseJson<
        ApiEnvelope<{
          id: string
          title: string
          categoryKey: string
          sourceKey: string
          visibility: string
          note: string | null
          amountMinor: number
          updatedAt: number
          createdAt: number
        }>
      >(updateResponse)
    expect(updatePayload.data.id).toBe(created.data.id)
    expect(updatePayload.data.title).toBe('Updated lunch')
    expect(updatePayload.data.categoryKey).toBe('travel')
    expect(updatePayload.data.sourceKey).toBe('bank-transfer')
    expect(updatePayload.data.visibility).toBe('household')
    expect(updatePayload.data.note).toBe('after update')
    expect(updatePayload.data.amountMinor).toBe(155000)
    expect(updatePayload.data.updatedAt).toBeGreaterThanOrEqual(
      updatePayload.data.createdAt,
    )

    const auditRow = await env.DB.prepare(
      `SELECT action_type, target_type, target_id, payload_json
         FROM audit_logs
        WHERE target_id = ?
        ORDER BY created_at DESC
        LIMIT 1`,
    )
      .bind(created.data.id)
      .first<{
        action_type: string
        target_type: string
        target_id: string
        payload_json: string
      }>()

    expect(auditRow).not.toBeNull()
    expect(auditRow?.action_type).toBe('expense.updated')
    expect(auditRow?.target_type).toBe('expense')
    expect(auditRow?.target_id).toBe(created.data.id)

    const auditPayload = JSON.parse(auditRow?.payload_json ?? '{}') as {
      changes?: Array<{ field: string; before: unknown; after: unknown }>
    }
    expect(auditPayload.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'title',
          before: 'Original lunch',
          after: 'Updated lunch',
        }),
        expect.objectContaining({
          field: 'categoryKey',
          before: 'food',
          after: 'travel',
        }),
      ]),
    )
  })

  it('audits a household expense visibility change to private', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-private-transition:private-transition@example.com',
    )
    const householdResponse = await createHousehold(
      auth.accessToken,
      'Visibility transition household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const createResponse = await createExpense(auth.accessToken, {
      amount: 99000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Shared dinner',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const response = await authorizedJsonRequest(auth.accessToken, {
      method: 'PATCH',
      path: `/api/v1/expenses/${created.data.id}`,
      body: {
        amount: 99000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'Private dinner',
        occurredAt: Date.now(),
      },
    })
    expect(response.status).toBe(200)

    const auditRow = await env.DB.prepare(
      `SELECT household_id, payload_json
         FROM audit_logs
        WHERE target_id = ?
        ORDER BY created_at DESC
        LIMIT 1`,
    )
      .bind(created.data.id)
      .first<{ household_id: string; payload_json: string }>()

    expect(auditRow?.household_id).toBe(householdId)
    const auditPayload = JSON.parse(auditRow?.payload_json ?? '{}') as {
      visibilityBefore?: string
      visibilityAfter?: string
    }
    expect(auditPayload.visibilityBefore).toBe('household')
    expect(auditPayload.visibilityAfter).toBe('private')
  })

  it('audits a private expense update', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-audit-update-private:audit-update-private@example.com',
    )
    const createResponse = await createExpense(auth.accessToken, {
      amount: 45000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private audit update',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    await SELF.fetch(`https://example.com/api/v1/expenses/${created.data.id}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 55000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'Updated private audit',
        occurredAt: Date.now(),
        note: 'updated note',
      }),
    })

    const auditRow = await env.DB.prepare(
      `SELECT action_type, target_type, target_id, household_id
         FROM audit_logs
        WHERE target_id = ?
        ORDER BY created_at DESC
        LIMIT 1`,
    )
      .bind(created.data.id)
      .first<{
        action_type: string
        target_type: string
        target_id: string
        household_id: string | null
      }>()

    expect(auditRow).not.toBeNull()
    expect(auditRow?.action_type).toBe('expense.updated')
    expect(auditRow?.target_type).toBe('expense')
    expect(auditRow?.target_id).toBe(created.data.id)
    expect(auditRow?.household_id).toBeNull()
  })
})
