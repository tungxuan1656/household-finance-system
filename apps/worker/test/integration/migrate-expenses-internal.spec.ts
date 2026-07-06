import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import type { ApiEnvelope, ApiErrorEnvelope } from '../helpers/test-context'
import { registerWorkerIntegrationSetup } from '../helpers/test-context'

import {
  HOUSEHOLD_TOKEN,
  INTERNAL_API_KEY,
  TEST_TOKEN,
  findExpenseByTitle,
  getAuth,
  getExpensesList,
  postInternalMigrate,
  postInternalMigrateAndParse,
} from './migrate-expenses-test-setup'

registerWorkerIntegrationSetup()

describe('POST /api/v1/internal/migrate/expenses', () => {
  it('Happy path dryRun (internal, personal scope)', async () => {
    const auth = await getAuth(TEST_TOKEN)

    const { response, payload } = await postInternalMigrateAndParse(
      {
        dryRun: true,
        targetUserId: auth.user.id,
        transactions: {
          '2025-01-15': {
            'int-tx-1': {
              categoryId: 0,
              date: '20250115',
              money: -50000,
              note: 'Internal dry-run lunch',
            },
          },
        },
      },
      INTERNAL_API_KEY,
    )

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.data.dryRun).toBe(true)
    expect(payload.data.created).toBe(1)
    expect(payload.data.skipped).toBe(0)
  })

  it('Internal dry-run does not persist', async () => {
    const auth = await getAuth(TEST_TOKEN)

    const { response, payload } = await postInternalMigrateAndParse(
      {
        dryRun: true,
        targetUserId: auth.user.id,
        transactions: {
          '2025-02-10': {
            'int-tx-dry': {
              categoryId: 0,
              date: '20250210',
              money: -30000,
              note: 'Should not persist',
            },
          },
        },
      },
      INTERNAL_API_KEY,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)

    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ title: string }>
    }>(auth.accessToken)

    expect(
      findExpenseByTitle(listPayload.data.items, 'Should not persist'),
    ).toBeUndefined()
  })

  it('Missing internal secret -> 401', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const response = await postInternalMigrate({
      dryRun: true,
      targetUserId: auth.user.id,
      transactions: {
        '2025-01-01': {
          'tx-1': {
            categoryId: 0,
            date: '20250101',
            money: -10000,
            note: 'No key',
          },
        },
      },
    })

    expect(response.status).toBe(401)

    const payload = (await response.json()) as ApiErrorEnvelope
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('Wrong internal secret -> 401', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const response = await postInternalMigrate(
      {
        dryRun: true,
        targetUserId: auth.user.id,
        transactions: {
          '2025-01-01': {
            'tx-1': {
              categoryId: 0,
              date: '20250101',
              money: -10000,
              note: 'Wrong key',
            },
          },
        },
      },
      'wrong-secret-value',
    )

    expect(response.status).toBe(401)

    const payload = (await response.json()) as ApiErrorEnvelope
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('Missing targetUserId -> 400', async () => {
    const response = await postInternalMigrate(
      {
        dryRun: true,
        transactions: {
          '2025-01-01': {
            'tx-1': {
              categoryId: 0,
              date: '20250101',
              money: -10000,
              note: 'Missing target',
            },
          },
        },
      },
      INTERNAL_API_KEY,
    )

    expect(response.status).toBe(400)

    const payload = (await response.json()) as ApiErrorEnvelope
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('Unknown target user -> 404', async () => {
    const response = await postInternalMigrate(
      {
        dryRun: true,
        targetUserId: 'user-nonexistent-000000000000',
        transactions: {
          '2025-01-01': {
            'tx-1': {
              categoryId: 0,
              date: '20250101',
              money: -10000,
              note: 'Bad user',
            },
          },
        },
      },
      INTERNAL_API_KEY,
    )

    expect(response.status).toBe(404)

    const payload = (await response.json()) as ApiErrorEnvelope
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('Internal real create (personal scope)', async () => {
    const auth = await getAuth(TEST_TOKEN)

    const { response, payload } = await postInternalMigrateAndParse(
      {
        dryRun: false,
        targetUserId: auth.user.id,
        transactions: {
          '2025-03-15': {
            'int-tx-real': {
              categoryId: 0,
              date: '20250315',
              money: -75000,
              note: 'Internal real create',
            },
          },
        },
      },
      INTERNAL_API_KEY,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)
    expect(payload.data.dryRun).toBe(false)

    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ id: string; title: string; amountMinor: number }>
    }>(auth.accessToken)

    const created = findExpenseByTitle(
      listPayload.data.items,
      'Internal real create',
    )
    expect(created).toBeDefined()
    expect(created!.amountMinor).toBe(75000)
  })

  it('Internal household success when target user is member', async () => {
    const auth = await getAuth(HOUSEHOLD_TOKEN)

    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Internal Migrate HH' }),
      },
    )
    expect(householdResponse.status).toBe(201)

    type HouseholdPayload = {
      id: string
      defaultCurrencyCode: string
    }

    const householdPayload =
      (await householdResponse.json()) as ApiEnvelope<HouseholdPayload>
    const householdId = householdPayload.data.id

    const { response, payload } = await postInternalMigrateAndParse(
      {
        dryRun: false,
        targetUserId: auth.user.id,
        householdId,
        transactions: {
          '2025-04-01': {
            'int-tx-hh': {
              categoryId: 0,
              date: '20250401',
              money: -45000,
              note: 'Internal household expense',
            },
          },
        },
      },
      INTERNAL_API_KEY,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)

    const { payload: listPayload } = await getExpensesList<{
      items: Array<{
        title: string
        householdId: string | null
        currencyCode: string
      }>
    }>(auth.accessToken)

    const created = findExpenseByTitle(
      listPayload.data.items,
      'Internal household expense',
    )
    expect(created).toBeDefined()
    expect(created!.householdId).toBe(householdId)
  })

  it('Internal household forbid when target user is not member', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Other Household' }),
      },
    )
    expect(householdResponse.status).toBe(201)

    type HouseholdPayload = { id: string }

    const householdPayload =
      (await householdResponse.json()) as ApiEnvelope<HouseholdPayload>
    const householdId = householdPayload.data.id

    const otherAuth = await getAuth(HOUSEHOLD_TOKEN)

    const response = await postInternalMigrate(
      {
        dryRun: true,
        targetUserId: otherAuth.user.id,
        householdId,
        transactions: {
          '2025-05-01': {
            'int-tx-forbid': {
              categoryId: 0,
              date: '20250501',
              money: -20000,
              note: 'Forbidden',
            },
          },
        },
      },
      INTERNAL_API_KEY,
    )

    expect(response.status).toBe(403)

    const payload = (await response.json()) as ApiErrorEnvelope
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('Existing public route ignores internal secret and still needs bearer auth', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          'x-internal-api-key': INTERNAL_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          dryRun: true,
          transactions: {
            '2025-01-01': {
              'tx-1': {
                categoryId: 0,
                date: '20250101',
                money: -10000,
                note: 'Test',
              },
            },
          },
        }),
      },
    )

    expect(response.status).toBe(401)

    const payload = (await response.json()) as ApiErrorEnvelope
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })
})
