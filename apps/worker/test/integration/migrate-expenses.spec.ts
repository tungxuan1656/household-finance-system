import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import type { ApiErrorEnvelope } from '../helpers/test-context'
import { registerWorkerIntegrationSetup } from '../helpers/test-context'

import {
  TEST_TOKEN,
  getAuth,
  postMigrate,
  postMigrateAndParse,
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
          '2025-01-20': {
            'tx-income-map': {
              categoryId: 9,
              date: '20250120',
              money: -15000,
              note: 'Wrong kind',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(0)
    expect(payload.data.skipped).toBe(1)
    expect(payload.data.skippedBreakdown.nonExpenseCategory).toBe(1)
    expect(payload.data.errors[0]?.reason).toBe(
      'mapped category is not expense-kind',
    )
  })

  it('Imports blank note as empty title (no longer skipped)', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          '2025-01-21': {
            'tx-blank-note': {
              categoryId: 0,
              date: '20250121',
              money: -12000,
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
    expect(payload.data.errors).toHaveLength(0)
  })

  it('Invalid date', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          'bad-date-key': {
            'tx-bad-date': {
              categoryId: 0,
              date: '20250230',
              money: -10000,
              note: 'Impossible date',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(0)
    expect(payload.data.skipped).toBe(1)
    expect(payload.data.skippedBreakdown.invalidDate).toBe(1)
    expect(payload.data.errors[0]?.reason).toBe('invalid date')
  })

  it('Unknown external categoryId', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          '2025-01-25': {
            'tx-unknown-cat': {
              categoryId: 999,
              date: '20250125',
              money: -11000,
              note: 'Unknown cat',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(0)
    expect(payload.data.skipped).toBe(1)
    expect(payload.data.skippedBreakdown.unknownCategory).toBe(1)
    expect(payload.data.errors[0]?.reason).toBe('unknown external categoryId')
  })

  it('Legacy categoryId 7 maps to repairs (expense kind)', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          '2025-02-01': {
            'tx-legacy-7': {
              categoryId: 7,
              date: '20250201',
              money: -50000,
              note: 'Repairs legacy',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)
    expect(payload.data.skipped).toBe(0)
    expect(payload.data.skippedBreakdown.unknownCategory).toBe(0)
    expect(payload.data.errors).toHaveLength(0)
  })

  it('Legacy categoryId 21 maps to self-development (expense kind)', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: true,
        transactions: {
          '2025-02-01': {
            'tx-legacy-21': {
              categoryId: 21,
              date: '20250201',
              money: -30000,
              note: 'Self-dev legacy',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)
    expect(payload.data.skipped).toBe(0)
    expect(payload.data.skippedBreakdown.unknownCategory).toBe(0)
    expect(payload.data.errors).toHaveLength(0)
  })

  it('categoryMapping override', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        categoryMapping: {
          '99': 'food',
        },
        transactions: {
          '2025-01-26': {
            'tx-override': {
              categoryId: 99,
              date: '20250126',
              money: -25000,
              note: 'Override category',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)

    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ title: string; categoryKey: string }>
    }>(auth.accessToken)
    const created = findExpenseByTitle(
      listPayload.data.items,
      'Override category',
    )
    expect(created).toBeDefined()
    expect(created!.categoryKey).toBe('food')
  })

  it('sourceKey override', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        sourceKey: 'cash',
        transactions: {
          '2025-01-27': {
            'tx-source': {
              categoryId: 0,
              date: '20250127',
              money: -18000,
              note: 'Cash expense',
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
    const created = findExpenseByTitle(listPayload.data.items, 'Cash expense')
    expect(created).toBeDefined()
    expect(created!.sourceKey).toBe('cash')
  })

  it('Auth required — 401', async () => {
    const response = await postMigrate(
      {
        dryRun: true,
        transactions: {
          '2025-01-28': {
            'tx-unauth': {
              categoryId: 0,
              date: '20250128',
              money: -10000,
              note: 'No auth',
            },
          },
        },
      },
      'invalid-token',
    )

    expect(response.status).toBe(401)
    const payload = (await response.json()) as ApiErrorEnvelope
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('Household scope', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Migrate household' }),
      },
    )

    expect(householdResponse.status).toBe(201)
    const householdPayload = (await householdResponse.json()) as {
      data: { id: string }
    }
    const householdId = householdPayload.data.id

    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        householdId,
        transactions: {
          '2025-01-29': {
            'tx-household': {
              categoryId: 0,
              date: '20250129',
              money: -44000,
              note: 'Household grocery',
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)

    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ title: string; householdId: string | null }>
    }>(auth.accessToken)
    const created = findExpenseByTitle(
      listPayload.data.items,
      'Household grocery',
    )
    expect(created).toBeDefined()
    expect(created!.householdId).toBe(householdId)
  })

  it('Long note truncation to 200 chars', async () => {
    const auth = await getAuth(TEST_TOKEN)
    const longNote = 'x'.repeat(250)
    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        transactions: {
          '2025-01-30': {
            'tx-long': {
              categoryId: 0,
              date: '20250130',
              money: -33000,
              note: longNote,
            },
          },
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.data.created).toBe(1)

    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ title: string }>
    }>(auth.accessToken)
    const created = findExpenseByTitle(
      listPayload.data.items,
      longNote.slice(0, 200),
    )
    expect(created).toBeDefined()
  })

  it('Batch create 60 entries (exceeds old per-call subrequest budget)', async () => {
    const auth = await getAuth(TEST_TOKEN)

    const txMap: Record<
      string,
      { categoryId: number; date: string; money: number; note: string }
    > = {}

    for (let i = 0; i < 60; i++) {
      txMap[`tx-${i}`] = {
        categoryId: 0,
        date: '20250201',
        money: -(1000 + i),
        note: `Batch entry ${i}`,
      }
    }

    const { response, payload } = await postMigrateAndParse(
      {
        dryRun: false,
        transactions: {
          '2025-02-01': txMap,
        },
      },
      auth.accessToken,
    )

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.data.created).toBe(60)
    expect(payload.data.skipped).toBe(0)

    const { payload: listPayload } = await getExpensesList<{
      items: Array<{ title: string }>
    }>(auth.accessToken, 'limit=100')

    expect(
      findExpenseByTitle(listPayload.data.items, 'Batch entry 0'),
    ).toBeDefined()
    expect(
      findExpenseByTitle(listPayload.data.items, 'Batch entry 59'),
    ).toBeDefined()
  })
})
