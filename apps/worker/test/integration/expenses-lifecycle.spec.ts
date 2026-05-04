import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  authorizedJsonRequest,
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

describe('expense lifecycle routes', () => {
  it('updates an owned household expense and writes an audit entry', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-update-owner:update-owner@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Expense update household',
    )
    expect(householdResponse.status).toBe(201)

    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

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

    const updatePayload = await parseJson<
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

    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

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

  it('rolls back an expense update when the audit write fails', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-update-audit-fail:update-audit-fail@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Update rollback household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const createResponse = await createExpense(auth.accessToken, {
      amount: 45000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Rollback lunch',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    await env.DB.prepare('DROP TABLE audit_logs').run()

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 78000,
          categoryKey: 'travel',
          sourceKey: 'bank-transfer',
          visibility: 'household',
          householdId,
          title: 'Changed lunch',
          occurredAt: Date.now(),
        }),
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

    const detailPayload =
      await parseJson<
        ApiEnvelope<{ title: string; categoryKey: string; amountMinor: number }>
      >(detailResponse)

    expect(detailPayload.data.title).toBe('Rollback lunch')
    expect(detailPayload.data.categoryKey).toBe('food')
    expect(detailPayload.data.amountMinor).toBe(45000)
  })

  it('soft-deletes a household expense, hides it from normal reads, and allows admin restore from deleted list', async () => {
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

  it('returns forbidden when a non-admin requests the deleted household expense list', async () => {
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

  it('returns forbidden when a member tries to delete another users private expense', async () => {
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

  it('rolls back a delete when the audit write fails', async () => {
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

  it('rolls back a restore when the audit write fails', async () => {
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

  it('rejects update of non-existent expense with 404', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-update-nonexistent:update-nonexistent@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/non-existent-id',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10000,
          categoryKey: 'food',
          sourceKey: 'cash',
          visibility: 'private',
          title: 'Non-existent',
          occurredAt: Date.now(),
        }),
      },
    )

    expect(response.status).toBe(404)

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('rejects unauthorized update of private expense (non-owner)', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-expense-update-private-owner:update-private-owner@example.com',
    )
    const other = await exchangeAccessToken(
      'test:firebase-user-expense-update-private-other:update-private-other@example.com',
    )

    const createResponse = await createExpense(owner.accessToken, {
      amount: 50000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private expense',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${other.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 60000,
          categoryKey: 'food',
          sourceKey: 'cash',
          visibility: 'private',
          title: 'Updated private expense',
          occurredAt: Date.now(),
        }),
      },
    )

    expect(response.status).toBe(403)

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(payload.error.code).toBe('FORBIDDEN')
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

    // The creator (member) soft-deletes the expense
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

    // otherMember (member, not admin) attempts to restore — should be forbidden
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

  it('rejects update with invalid category', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-update-invalidcat:update-invalidcat@example.com',
    )

    const createResponse = await createExpense(auth.accessToken, {
      amount: 30000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Valid expense',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 30000,
          categoryKey: 'invalid-category',
          sourceKey: 'cash',
          visibility: 'private',
          title: 'Updated',
          occurredAt: Date.now(),
        }),
      },
    )

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(payload.error.code).toBe('INVALID_INPUT')
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

  it('private expense owner can restore their own deleted expense', async () => {
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
