import { SELF } from 'cloudflare:test'

import type { ApiEnvelope } from '../helpers/test-context'
import type { MigrateExpensesResultDTO } from '@/contracts/migrate-types'
import { exchangeAccessToken, parseJson } from '../helpers/test-context'

// Shared test token identities
export const TEST_TOKEN = 'test:firebase-user-migrate:user-migrate@example.com'
export const HOUSEHOLD_TOKEN =
  'test:firebase-user-migrate-household:user-migrate-hh@example.com'

// Get auth for a test identity
export async function getAuth(tokenId: string) {
  return exchangeAccessToken(tokenId)
}

// POST to /api/v1/migrate/expenses
export async function postMigrate(
  body: Record<string, unknown>,
  accessToken: string,
) {
  return SELF.fetch('https://example.com/api/v1/migrate/expenses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

// POST + parse response
export async function postMigrateAndParse(
  body: Record<string, unknown>,
  accessToken: string,
) {
  const response = await postMigrate(body, accessToken)
  const payload =
    await parseJson<ApiEnvelope<MigrateExpensesResultDTO>>(response)
  return { response, payload }
}

// GET /api/v1/expenses list
export async function getExpensesList<
  T = { items: Array<Record<string, unknown>> },
>(accessToken: string, queryString?: string) {
  const url = queryString
    ? `https://example.com/api/v1/expenses?${queryString}`
    : 'https://example.com/api/v1/expenses'
  const response = await SELF.fetch(url, {
    method: 'GET',
    headers: { authorization: `Bearer ${accessToken}` },
  })
  const payload = await parseJson<ApiEnvelope<T>>(response)
  return { response, payload }
}

// Find a created expense by title in the expenses list
export function findExpenseByTitle<T extends { title: string }>(
  items: T[],
  title: string,
): T | undefined {
  return items.find((item) => item.title === title)
}
