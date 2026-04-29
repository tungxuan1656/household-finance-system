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
      user: {
        id: string
      }
    }>
  >(exchangeResponse)

  return exchangePayload.data
}

export const registerWorkerIntegrationSetup = () => {
  beforeEach(async () => {
    await applyMigrations(env.DB)

    for (const statement of clearTableStatements) {
      await env.DB.exec(statement)
    }
  })
}
