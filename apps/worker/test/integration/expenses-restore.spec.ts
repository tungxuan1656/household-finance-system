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

describe('expense restore routes', () => {
  it('allows admin restore from deleted household expense list', async () => {
    const admin = await exchangeAccessToken(
      'test:firebase-user-expense-restore-admin:restore-admin@example.com',
    )
    const member = await exchangeAccessToken(
      'test:firebase-user-expense-restore-member:restore-member@example.com',
    )

    const householdResponse = await createHousehold(
      admin.accessToken,
      'Restore household',
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
        ApiEnvelope<{ id: string; title: string; householdId: string | null }>
      >(restoreResponse)

    expect(restorePayload.data.id).toBe(created.data.id)
    expect(restorePayload.data.title).toBe('Shared groceries')
    expect(restorePayload.data.householdId).toBe(householdId)

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

  it('rejects unauthorized restore of household expense for non-admin', async () => {
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

  it('private expense owner can restore own deleted expense', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-private-restore-owner:private-restore-owner@example.com',
    )

    const createResponse = await createExpense(auth.accessToken, {
      amount: 40000,
      categoryKey: 'food',
      sourceKey: 'cash',
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
        ApiEnvelope<{ id: string; title: string; householdId: string | null }>
      >(restoreResponse)

    expect(restorePayload.data.id).toBe(created.data.id)
    expect(restorePayload.data.title).toBe('Private restore test')
    expect(restorePayload.data.householdId).toBeNull()
  })
})
