import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import type { MigrateExpensesResultDTO } from '@/contracts/migrate-types'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

const TEST_TOKEN = 'test:firebase-user-migrate:user-migrate@example.com'
const HOUSEHOLD_TOKEN =
  'test:firebase-user-migrate-household:user-migrate-hh@example.com'

describe('POST /api/v1/migrate/expenses - integration tests', () => {
  it('Happy path dryRun', async () => {
    const auth = await exchangeAccessToken(TEST_TOKEN)

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.success).toBe(true)
    expect(payload.data.dryRun).toBe(true)
    expect(payload.data.created).toBe(2)
    expect(payload.data.skipped).toBe(2)
    expect(payload.data.skippedBreakdown.income).toBe(1)
    expect(payload.data.skippedBreakdown.zero).toBe(1)
    expect(payload.data.errors).toHaveLength(0)
  })

  it('Happy path real create', async () => {
    const auth = await exchangeAccessToken(TEST_TOKEN)

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.success).toBe(true)
    expect(payload.data.created).toBe(1)
    expect(payload.data.dryRun).toBe(false)

    // Verify the expense was persisted by fetching the list
    const listResponse = await SELF.fetch(
      'https://example.com/api/v1/expenses',
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(listResponse.status).toBe(200)

    const listPayload =
      await parseJson<
        ApiEnvelope<{
          items: Array<{
            id: string
            title: string
            amountMinor: number
            categoryKey: string
            sourceKey: string
            occurredAt: number
          }>
          nextCursor: string | null
        }>
      >(listResponse)

    expect(listPayload.success).toBe(true)
    expect(listPayload.data.items.length).toBeGreaterThanOrEqual(1)

    const created = listPayload.data.items.find(
      (item) => item.title === 'Lunch',
    )
    expect(created).toBeDefined()
    expect(created!.amountMinor).toBe(50000)
    expect(created!.categoryKey).toBe('food')
    expect(created!.sourceKey).toBe('bank-transfer')
    expect(created!.occurredAt).toBe(Date.UTC(2025, 0, 15))
  })

  it('Skip non-expense category (money-in)', async () => {
    const auth = await exchangeAccessToken(TEST_TOKEN)

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.data.created).toBe(0)
    expect(payload.data.skippedBreakdown.nonExpenseCategory).toBe(1)
    expect(payload.data.errors).toHaveLength(1)
    expect(payload.data.errors[0].reason).toBe(
      'mapped category is not expense-kind',
    )
  })

  it('Skip blank note', async () => {
    const auth = await exchangeAccessToken(TEST_TOKEN)

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.data.created).toBe(0)
    expect(payload.data.skippedBreakdown.blankNote).toBe(1)
  })

  it('Invalid date', async () => {
    const auth = await exchangeAccessToken(TEST_TOKEN)

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.data.created).toBe(0)
    expect(payload.data.skippedBreakdown.invalidDate).toBe(1)
    expect(payload.data.errors).toHaveLength(1)
    expect(payload.data.errors[0].reason).toBe('invalid date')
  })

  it('Unknown external categoryId', async () => {
    const auth = await exchangeAccessToken(TEST_TOKEN)

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.data.created).toBe(0)
    expect(payload.data.skippedBreakdown.unknownCategory).toBe(1)
    expect(payload.data.errors).toHaveLength(1)
    expect(payload.data.errors[0].reason).toBe('unknown external categoryId')
  })

  it('categoryMapping override', async () => {
    const auth = await exchangeAccessToken(TEST_TOKEN)

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          dryRun: false,
          categoryMapping: {
            '0': 'transport',
          },
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.data.created).toBe(1)

    // Verify categoryKey is 'transport' (override), not 'food' (default)
    const listResponse = await SELF.fetch(
      'https://example.com/api/v1/expenses',
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    const listPayload =
      await parseJson<
        ApiEnvelope<{ items: Array<{ title: string; categoryKey: string }> }>
      >(listResponse)

    const created = listPayload.data.items.find(
      (item) => item.title === 'Mapped to transport',
    )
    expect(created).toBeDefined()
    expect(created!.categoryKey).toBe('transport')
  })

  it('sourceKey override', async () => {
    const auth = await exchangeAccessToken(TEST_TOKEN)

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.data.created).toBe(1)

    // Verify sourceKey is 'cash'
    const listResponse = await SELF.fetch(
      'https://example.com/api/v1/expenses',
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    const listPayload =
      await parseJson<
        ApiEnvelope<{ items: Array<{ title: string; sourceKey: string }> }>
      >(listResponse)

    const created = listPayload.data.items.find(
      (item) => item.title === 'Cash purchase',
    )
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

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('Household scope', async () => {
    const auth = await exchangeAccessToken(HOUSEHOLD_TOKEN)

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

    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string; defaultCurrencyCode: string }>>(
        householdResponse,
      )
    const householdId = householdPayload.data.id
    const defaultCurrencyCode = householdPayload.data.defaultCurrencyCode

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.data.created).toBe(1)

    // Verify the expense has the householdId and correct currency
    const listResponse = await SELF.fetch(
      'https://example.com/api/v1/expenses',
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    const listPayload = await parseJson<
      ApiEnvelope<{
        items: Array<{
          title: string
          householdId: string | null
          currencyCode: string
        }>
      }>
    >(listResponse)

    const created = listPayload.data.items.find(
      (item) => item.title === 'Household grocery',
    )
    expect(created).toBeDefined()
    expect(created!.householdId).toBe(householdId)
    expect(created!.currencyCode).toBe(defaultCurrencyCode)
  })

  it('Long note truncation to 200 chars', async () => {
    const auth = await exchangeAccessToken(TEST_TOKEN)

    const longNote = 'A'.repeat(250)
    const truncatedNote = 'A'.repeat(200)

    const response = await SELF.fetch(
      'https://example.com/api/v1/migrate/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)

    expect(payload.data.created).toBe(1)

    // Verify the title was truncated
    const listResponse = await SELF.fetch(
      'https://example.com/api/v1/expenses',
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    const listPayload = await parseJson<
      ApiEnvelope<{
        items: Array<{ title: string }>
      }>
    >(listResponse)

    const created = listPayload.data.items.find(
      (item) => item.title === truncatedNote,
    )
    expect(created).toBeDefined()
    expect(created!.title).toHaveLength(200)
  })
})
