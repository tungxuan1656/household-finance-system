import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  createExpense,
  createHousehold,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

const addMemberToHousehold = async (
  householdId: string,
  userId: string,
  role: 'admin' | 'member',
) => {
  const now = Date.now()

  await env.DB.prepare(
    `INSERT INTO household_memberships (
        id, household_id, user_id, role, state, joined_at, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
  )
    .bind(
      `hm-${householdId}-${userId}`,
      householdId,
      userId,
      role,
      now,
      now,
      now,
    )
    .run()
}

describe('expense delete and restore routes', () => {
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

    const restoreResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}/restore`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${admin.accessToken}`,
        },
      },
    )

    expect(restoreResponse.status).toBe(200)

    const restorePayload =
      await parseJson<
        ApiEnvelope<{ id: string; title: string; visibility: string }>
      >(restoreResponse)

    expect(restorePayload.data.id).toBe(created.data.id)
    expect(restorePayload.data.title).toBe('Shared groceries')
    expect(restorePayload.data.visibility).toBe('household')

    const restoredDetailResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )

    expect(restoredDetailResponse.status).toBe(200)

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
      'expense.restored',
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

  it('rolls back restore when audit write fails', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-restore-audit-fail:restore-audit-fail@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Restore rollback household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const createResponse = await createExpense(auth.accessToken, {
      amount: 67000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Restore rollback',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const deleteResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(deleteResponse.status).toBe(200)

    await env.DB.prepare('DROP TABLE audit_logs').run()

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}/restore`,
      {
        method: 'POST',
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

    expect(detailResponse.status).toBe(404)
  })

  it('rejects unauthorized restore of household expense (non-admin)', async () => {
    const admin = await exchangeAccessToken(
      'test:firebase-user-expense-restore-nonadmin-admin:restore-nonadmin-admin@example.com',
    )
    const member = await exchangeAccessToken(
      'test:firebase-user-expense-restore-nonadmin-member:restore-nonadmin-member@example.com',
    )
    const otherMember = await exchangeAccessToken(
      'test:firebase-user-expense-restore-nonadmin-other:restore-nonadmin-other@example.com',
    )

    const householdResponse = await createHousehold(
      admin.accessToken,
      'Restore non-admin household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    await addMemberToHousehold(householdId, member.user.id, 'member')
    await addMemberToHousehold(householdId, otherMember.user.id, 'member')

    const createResponse = await createExpense(member.accessToken, {
      amount: 75000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Non-admin restore test',
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

    const restoreResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}/restore`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${otherMember.accessToken}`,
        },
      },
    )

    expect(restoreResponse.status).toBe(403)

    const payload = await parseJson<ApiErrorEnvelope>(restoreResponse)

    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('audits a private expense delete', async () => {
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

  it('private expense owner can restore own deleted expense', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-private-restore-owner:private-restore-owner@example.com',
    )

    const createResponse = await createExpense(auth.accessToken, {
      amount: 40000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private restore test',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const deleteResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(deleteResponse.status).toBe(200)

    const restoreResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}/restore`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(restoreResponse.status).toBe(200)

    const restorePayload =
      await parseJson<
        ApiEnvelope<{ id: string; title: string; visibility: string }>
      >(restoreResponse)

    expect(restorePayload.data.id).toBe(created.data.id)
    expect(restorePayload.data.title).toBe('Private restore test')
    expect(restorePayload.data.visibility).toBe('private')
  })
})
