import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('DELETE /api/v1/incomes/:id — integration tests', () => {
  it('soft-deletes own income and excludes it from list', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-del-own:inc-del-own@example.com',
    )

    // Create an income
    const createRes = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 3000000,
        sourceKey: 'bank-transfer',
        title: 'Freelance payment',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)

    // DELETE returns success
    const deleteRes = await SELF.fetch(
      `https://example.com/api/v1/incomes/${created.data.id}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${auth.accessToken}` },
      },
    )
    expect(deleteRes.status).toBe(200)

    const deletePayload =
      await parseJson<ApiEnvelope<{ deleted: true }>>(deleteRes)
    expect(deletePayload.data).toEqual({ deleted: true })

    // Deleted income no longer appears in list
    const listRes = await SELF.fetch('https://example.com/api/v1/incomes', {
      headers: { authorization: `Bearer ${auth.accessToken}` },
    })
    expect(listRes.status).toBe(200)
    const listPayload =
      await parseJson<
        ApiEnvelope<{ items: Array<{ id: string }>; nextCursor: string | null }>
      >(listRes)
    expect(
      listPayload.data.items.find((item) => item.id === created.data.id),
    ).toBeUndefined()
  })

  it('returns not-found for non-existent income', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-del-nonexist:inc-del-nonexist@example.com',
    )

    const res = await SELF.fetch(
      'https://example.com/api/v1/incomes/nonexistent-id',
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${auth.accessToken}` },
      },
    )
    expect(res.status).toBe(404)

    const payload = await parseJson<ApiErrorEnvelope>(res)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('returns forbidden when deleting another user income', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-inc-del-owner:inc-del-owner@example.com',
    )
    const other = await exchangeAccessToken(
      'test:firebase-user-inc-del-other:inc-del-other@example.com',
    )

    const createRes = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1500000,
        sourceKey: 'cash',
        title: 'Owner income',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)

    const res = await SELF.fetch(
      `https://example.com/api/v1/incomes/${created.data.id}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${other.accessToken}` },
      },
    )
    expect(res.status).toBe(403)

    const payload = await parseJson<ApiErrorEnvelope>(res)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('returns not-found when re-deleting already deleted income', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-del-twice:inc-del-twice@example.com',
    )

    const createRes = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 2000000,
        sourceKey: 'bank-transfer',
        title: 'To delete twice',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)

    // First delete
    const del1 = await SELF.fetch(
      `https://example.com/api/v1/incomes/${created.data.id}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${auth.accessToken}` },
      },
    )
    expect(del1.status).toBe(200)

    // Second delete should 404
    const del2 = await SELF.fetch(
      `https://example.com/api/v1/incomes/${created.data.id}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${auth.accessToken}` },
      },
    )
    expect(del2.status).toBe(404)

    const payload = await parseJson<ApiErrorEnvelope>(del2)
    expect(payload.error.code).toBe('NOT_FOUND')
  })
})
