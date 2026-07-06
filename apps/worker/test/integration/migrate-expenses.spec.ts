import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import type { MigrateExpensesResultDTO } from '@/contracts/migrate-types'
import type { ApiErrorEnvelope } from '../helpers/test-context'
import { registerWorkerIntegrationSetup } from '../helpers/test-context'

import {
  TEST_TOKEN,
  HOUSEHOLD_TOKEN,
  INTERNAL_API_KEY,
  getAuth,
  postMigrate,
  postMigrateAndParse,
  postInternalMigrate,
  postInternalMigrateAndParse,
  getExpensesList,
  findExpenseByTitle,
} from './migrate-expenses-test-setup'

registerWorkerIntegrationSetup()

describe('POST /api/v1/migrate/expenses - integration tests', () => {
  it('Happy path dryRun', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          '2025-01-15': {
            'tx-1': {
              categoryId: 0,
              date: '20250115',
              money: -50000,
              note: 'Lunch',
            },
            'tx-2': {
              categoryId: 1,
              date: '20250115',
              money: -20000,
              note: 'Bus fare',
            },
            'tx-3': {
              categoryId: 0,
              date: '20250115',
              money: 100000,
              note: 'Salary deposit',
            },
            'tx-4': {
              categoryId: 1,
              date: '20250115',
              money: 0,
              note: 'Zero transaction',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.data.dryRun).toBe(true)
    expect(payload.data.created).toBe(2)
    expect(payload.data.skipped).toBe(2)
    expect(payload.data.skippedBreakdown.income).toBe(1)
    expect(payload.data.skippedBreakdown.zero).toBe(1)
    expect(payload.data.errors).toHaveLength(0)
  })

  it('Happy path real create', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        transactions: {
          '2025-01-15': {
            'tx-lunch': {
              categoryId: 0,
              date: '20250115',
              money: -50000,
              note: 'Lunch',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.data.created).toBe(1)
    expect(payload.data.dryRun).toBe(false)

    // Verify the expense was persisted by fetching the list
    const { response: listResponse, payload: listPayload } =
      await getExpensesList<{
        items: Array<{
          id: string
          title: string
          amountMinor: number
          categoryKey: string
          sourceKey: string
          occurredAt: number
        }>
        nextCursor: string | null
      }>(auth.accessToken)

    expect(listResponse.status).toBe(200)
    expect(listPayload.success).toBe(true)
    expect(listPayload.data.items.length).toBeGreaterThanOrEqual(1)

    const created = findExpenseByTitle(listPayload.data.items, 'Lunch')
    expect(created).toBeDefined()
    expect(created!.amountMinor).toBe(50000)
    expect(created!.categoryKey).toBe('food')
    expect(created!.sourceKey).toBe('bank-transfer')
    expect(created!.occurredAt).toBe(Date.UTC(2025, 0, 15))
  })

  it('Skip non-expense category (money-in)', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          '2025-06-01': {
            'tx-income-cat': {
              categoryId: 9,
              date: '20250601',
              money: -30000,
              note: 'Some expense mapped to money-in',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(0)
    expect(payload.data.skippedBreakdown.nonExpenseCategory).toBe(1)
    expect(payload.data.errors).toHaveLength(1)
    expect(payload.data.errors[0].reason).toBe(
      'mapped category is not expense-kind',
    )
  })

  it('Imports blank note as empty title (no longer skipped)', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          '2025-03-10': {
            'tx-blank': {
              categoryId: 0,
              date: '20250310',
              money: -15000,
              note: '   ',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)
    expect(payload.data.skipped).toBe(0)
    expect(payload.data.skippedBreakdown.blankNote).toBeUndefined()
  })

  it('Invalid date', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          bad: {
            'tx-bad-date': {
              categoryId: 0,
              date: '2025-99-99',
              money: -10000,
              note: 'Bad date entry',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(0)
    expect(payload.data.skippedBreakdown.invalidDate).toBe(1)
    expect(payload.data.errors).toHaveLength(1)
    expect(payload.data.errors[0].reason).toBe('invalid date')
  })

  it('Unknown external categoryId', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          '2025-04-20': {
            'tx-unknown-cat': {
              categoryId: 999,
              date: '20250420',
              money: -25000,
              note: 'Unknown category',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(0)
    expect(payload.data.skippedBreakdown.unknownCategory).toBe(1)
    expect(payload.data.errors).toHaveLength(1)
    expect(payload.data.errors[0].reason).toBe('unknown external categoryId')
  })

  it('categoryMapping override', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        categoryMapping: { '0': 'transport' },
        transactions: {
          '2025-07-04': {
            'tx-override': {
              categoryId: 0,
              date: '20250704',
              money: -80000,
              note: 'Mapped to transport',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)

    // Verify categoryKey is 'transport' (override), not 'food' (default)
    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ title: string; categoryKey: string }>
    }>(auth.accessToken)
    const created = findExpenseByTitle(
      listPayload.data.items,
      'Mapped to transport',
    )
    expect(created).toBeDefined()
    expect(created!.categoryKey).toBe('transport')
  })

  it('sourceKey override', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        sourceKey: 'cash',
        transactions: {
          '2025-08-10': {
            'tx-source': {
              categoryId: 5,
              date: '20250810',
              money: -120000,
              note: 'Cash purchase',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)

    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ title: string; sourceKey: string }>
    }>(auth.accessToken)
    const created = findExpenseByTitle(listPayload.data.items, 'Cash purchase')
    expect(created).toBeDefined()
    expect(created!.sourceKey).toBe('cash')
  })

  it('Auth required — 401', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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

  it('Household scope', async () => {
    const auth = await getAuth(HOUSEHOLD_TOKEN)

    // Create a household first
    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Migrate Test Household' }),
      },
    )
    expect(householdResponse.status).toBe(201)

    const householdPayload = (await householdResponse.json()) as ApiEnvelope<{
      id: string
      defaultCurrencyCode: string
    }>
    const householdId = householdPayload.data.id
    const defaultCurrencyCode = householdPayload.data.defaultCurrencyCode

    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        householdId,
        transactions: {
          '2025-09-01': {
            'tx-hh': {
              categoryId: 0,
              date: '20250901',
              money: -30000,
              note: 'Household grocery',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)

    // Verify the expense has the householdId and correct currency
    const { payload: listPayload } = await getExpensesList<{
      items: Array<{
        title: string
        householdId: string | null
        currencyCode: string
      }>
    }>(auth.accessToken)
    const created = findExpenseByTitle(
      listPayload.data.items,
      'Household grocery',
    )
    expect(created).toBeDefined()
    expect(created!.householdId).toBe(householdId)
    expect(created!.currencyCode).toBe(defaultCurrencyCode)
  })

  it('Long note truncation to 200 chars', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const longNote = 'A'.repeat(250)
    const truncatedNote = 'A'.repeat(200)

    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        transactions: {
          '2025-10-01': {
            'tx-long': {
              categoryId: 0,
              date: '20251001',
              money: -50000,
              note: longNote,
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)

    // Verify the title was truncated
    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ title: string }>
    }>(auth.accessToken)
    const created = findExpenseByTitle(listPayload.data.items, truncatedNote)
    expect(created).toBeDefined()
    expect(created!.title).toHaveLength(200)
  })

  it('Batch create 60 entries (exceeds old per-call subrequest budget)', async () => {
    const auth = await getAuth(TEST_TOKEN)

    // Build 60 distinct entries across 3 date keys
    const transactions: Record<string, Record<string, unknown>> = {}
    for (let i = 0; i < 60; i++) {
      const dateKey = `2025-11-${String(Math.floor(i / 20) + 1).padStart(2, '0')}`
      if (!transactions[dateKey]) {
        transactions[dateKey] = {}
      }
      const txId = `tx-batch-${i}`
      transactions[dateKey][txId] = {
        categoryId: 0,
        date: dateKey.replace(/-/g, ''),
        money: -(i + 1) * 1000,
        note: `Batch entry ${i}`,
      }
    }

    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        transactions,
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(60)
    expect(payload.data.errors).toHaveLength(0)
    expect(payload.data.skipped).toBe(0)
    expect(payload.data.dryRun).toBe(false)

    // Verify entries were persisted via the list endpoint (limit=100 to cover all batch entries)
    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ title: string }>
    }>(auth.accessToken, 'limit=100')

    const entry0 = findExpenseByTitle(listPayload.data.items, 'Batch entry 0')
    expect(entry0).toBeDefined()

    const entry59 = findExpenseByTitle(listPayload.data.items, 'Batch entry 59')
    expect(entry59).toBeDefined()
  })

  // ── Internal endpoint tests ──────────────────────────────────────────────

  describe('POST /api/v1/internal/migrate/expenses', () => {
    it('Happy path dryRun (internal, personal scope)', async () => {
      // Get a target user first
      const auth = await getAuth(TEST_TOKEN)
      const targetUserId = auth.user.id

      const { response, payload } = await postInternalMigrateAndParse(
        {
          dryRun: true,
          targetUserId,
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
      const targetUserId = auth.user.id

      const { response, payload } = await postInternalMigrateAndParse(
        {
          dryRun: true,
          targetUserId,
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

      // Verify not persisted via the target user's expense list
      const { payload: listPayload } = await getExpensesList<{
        items: Array<{ title: string }>
      }>(auth.accessToken)
      const found = findExpenseByTitle(
        listPayload.data.items,
        'Should not persist',
      )
      expect(found).toBeUndefined()
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
      const body = {
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
      }
      const response = await postInternalMigrate(body, INTERNAL_API_KEY)

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
      const targetUserId = auth.user.id

      const { response, payload } = await postInternalMigrateAndParse(
        {
          dryRun: false,
          targetUserId,
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

      // Verify the expense was persisted under the target user
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
      // Create household with HOUSEHOLD_TOKEN user, then internal-migrate for them
      const auth = await getAuth(HOUSEHOLD_TOKEN)
      const targetUserId = auth.user.id

      // Create a household
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
          targetUserId,
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

      // Verify household scoping
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
      // TEST_TOKEN user creates a household
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

      // HOUSEHOLD_TOKEN user is NOT a member of this household
      const otherAuth = await getAuth(HOUSEHOLD_TOKEN)
      const targetUserId = otherAuth.user.id

      const response = await postInternalMigrate(
        {
          dryRun: true,
          targetUserId,
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

      // Target user is not a member → the handler throws forbidden
      expect(response.status).toBe(403)

      const payload = (await response.json()) as ApiErrorEnvelope
      expect(payload.success).toBe(false)
      expect(payload.error.code).toBe('FORBIDDEN')
    })

    it('Existing public route ignores internal secret and still needs bearer auth', async () => {
      // Attempt to call public route with internal API key (no bearer token)
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

      // Public route uses authMiddleware which expects Bearer token
      expect(response.status).toBe(401)

      const payload = (await response.json()) as ApiErrorEnvelope
      expect(payload.success).toBe(false)
      expect(payload.error.code).toBe('UNAUTHENTICATED')
    })
  })
})
