import { describe, expect, it } from 'vitest'

import {
  type ApiErrorEnvelope,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

import {
  SELF,
  type ApiEnvelope,
  addMemberToHousehold,
  createExpense,
  createHousehold,
  env,
  exchangeAccessToken,
  parseJson,
} from './expenses-delete-restore.test-setup'

registerWorkerIntegrationSetup()

describe('expense delete routes', () => {
  it('soft-deletes household expense, hides it, and allows admin restore from deleted list', async () => {
    const admin = await exchangeAccessToken(
      'test:firebase-user-expense-lifecycle-admin:lifecycle-admin@example.com',
    )
    const member = await exchangeAccessToken(
      'test:firebase-user-expense-lifecycle-member:lifecycle-member@example.com',
    )

    const householdResponse = await createHousehold(
      admin.accessToken,
      'Expense lifecycle household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    await addMemberToHousehold(householdId, member.user.id, 'member')

    const createResponse = await createExpense(member.accessToken, {
      amount: 84000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Shared groceries',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const deleteResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )

    expect(deleteResponse.status).toBe(200)

    const deletePayload =
      await parseJson<ApiEnvelope<{ deleted: true }>>(deleteResponse)
    expect(deletePayload.data).toEqual({ deleted: true })

    const detailResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )

    expect(detailResponse.status).toBe(404)

    const listResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses?household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )

    expect(listResponse.status).toBe(200)

    const listPayload =
      await parseJson<
        ApiEnvelope<{ items: Array<{ id: string }>; nextCursor: string | null }>
      >(listResponse)

    expect(
      listPayload.data.items.find((item) => item.id === created.data.id),
    ).toBeUndefined()

    const deletedListResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/deleted?household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${admin.accessToken}`,
        },
      },
    )

    expect(deletedListResponse.status).toBe(200)

    const deletedListPayload =
      await parseJson<
        ApiEnvelope<{ items: Array<{ id: string; title: string }> }>
      >(deletedListResponse)

    expect(deletedListPayload.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.data.id,
          title: 'Shared groceries',
        }),
      ]),
    )

    const auditRows = await env.DB.prepare(
      `SELECT action_type
         FROM audit_logs
        WHERE target_id = ?
        ORDER BY created_at ASC`,
    )
      .bind(created.data.id)
      .all<{ action_type: string }>()

    expect(auditRows.results.map((row) => row.action_type)).toEqual([
      'expense.deleted',
    ])
  })

  it('returns forbidden when non-admin requests deleted household expense list', async () => {
    const admin = await exchangeAccessToken(
      'test:firebase-user-expense-trash-admin:trash-admin@example.com',
    )
    const member = await exchangeAccessToken(
      'test:firebase-user-expense-trash-member:trash-member@example.com',
    )

    const householdResponse = await createHousehold(
      admin.accessToken,
      'Expense deleted list household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    await addMemberToHousehold(householdId, member.user.id, 'member')

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/deleted?household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(403)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('returns forbidden when member tries to delete another users private expense', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-expense-private-owner:private-owner@example.com',
    )
    const otherUser = await exchangeAccessToken(
      'test:firebase-user-expense-private-other:private-other@example.com',
    )

    const createResponse = await createExpense(owner.accessToken, {
      amount: 33000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private snack',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${otherUser.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(403)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('rolls back delete when audit write fails', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-delete-audit-fail:delete-audit-fail@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Delete rollback household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const createResponse = await createExpense(auth.accessToken, {
      amount: 12000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Delete rollback',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    await env.DB.prepare('DROP TABLE audit_logs').run()

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(500)

    const detailResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(detailResponse.status).toBe(200)
  })

  it('audits private expense delete', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-audit-delete-private:audit-delete-private@example.com',
    )

    const createResponse = await createExpense(auth.accessToken, {
      amount: 22000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private audit delete',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    await SELF.fetch(`https://example.com/api/v1/expenses/${created.data.id}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
      },
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
    expect(auditRow?.action_type).toBe('expense.deleted')
    expect(auditRow?.target_type).toBe('expense')
    expect(auditRow?.target_id).toBe(created.data.id)
    expect(auditRow?.household_id).toBeNull()
  })
})
