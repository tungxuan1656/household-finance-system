import { SELF, env } from 'cloudflare:test'
import { beforeEach } from 'vitest'

import { applyMigrations } from './apply-migrations'

const clearTableStatements = [
  'DELETE FROM audit_logs',
  'DELETE FROM budget_limits',
  'DELETE FROM budgets',
  'DELETE FROM expense_group_items',
  'DELETE FROM expenses',
  'DELETE FROM expense_groups',
  'DELETE FROM expense_categories',
  'DELETE FROM household_invitations',
  'DELETE FROM household_memberships',
  'DELETE FROM households',
  'DELETE FROM refresh_sessions',
  'DELETE FROM auth_identities',
  'DELETE FROM users',
]

export type ApiEnvelope<T> = {
  success: true
  data: T
  error: null
  meta: {
    requestId: string
  }
}

export type ApiErrorEnvelope = {
  success: false
  data: null
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta: {
    requestId: string
  }
}

export const parseJson = async <T>(response: Response): Promise<T> =>
  response.json() as Promise<T>

export const exchangeAccessToken = async (
  idToken: string,
): Promise<{
  accessToken: string
  refreshToken: string
  user: {
    id: string
  }
}> => {
  const exchangeResponse = await SELF.fetch(
    'https://example.com/api/v1/auth/provider/exchange',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'firebase',
        idToken,
      }),
    },
  )

  const exchangePayload = await parseJson<
    ApiEnvelope<{
      accessToken: string
      refreshToken: string
      user: {
        id: string
      }
    }>
  >(exchangeResponse)

  return exchangePayload.data
}

export const authorizedJsonRequest = async (
  accessToken: string,
  {
    method,
    path,
    body,
  }: {
    method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
    path: string
    body?: unknown
  },
) =>
  SELF.fetch(`https://example.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

export const createHousehold = async (accessToken: string, name: string) => {
  const response = await authorizedJsonRequest(accessToken, {
    method: 'POST',
    path: '/api/v1/households',
    body: { name },
  })

  return response
}

export const createExpense = async (
  accessToken: string,
  body: Record<string, unknown>,
) => {
  const payload = { ...body }

  if (payload.visibility === 'private') {
    delete payload.visibility
  }

  if (
    payload.visibility === 'household' &&
    typeof payload.householdId === 'string'
  ) {
    delete payload.visibility
  }

  const response = await authorizedJsonRequest(accessToken, {
    method: 'POST',
    path: '/api/v1/expenses',
    body: payload,
  })

  return response
}

export const registerWorkerIntegrationSetup = () => {
  beforeEach(async () => {
    await applyMigrations(env.DB)

    for (const statement of clearTableStatements) {
      await env.DB.exec(statement)
    }
  })
}
