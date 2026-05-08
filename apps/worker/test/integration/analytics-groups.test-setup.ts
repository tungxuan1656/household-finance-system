import { SELF } from 'cloudflare:test'

import {
  type ApiEnvelope,
  createExpense,
  createHousehold,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

export type AnalyticsGroupsDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalGroupedSpendMinor: number
  groups: Array<{
    groupId: string
    groupName: string
    totalSpendMinor: number
    expenseCount: number
    percentOfTotal: number
    overlapPercentOfTotal: number
  }>
}

export { SELF, createExpense, createHousehold, exchangeAccessToken, parseJson }
export type { ApiEnvelope }

export const createExpenseGroup = async (
  accessToken: string,
  householdId: string,
  name: string,
) => {
  const response = await SELF.fetch('https://example.com/api/v1/groups', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ householdId, name }),
  })

  return {
    response,
    id: (await parseJson<ApiEnvelope<{ id: string }>>(response)).data.id,
  }
}

export const assignExpenseGroups = async (
  accessToken: string,
  expenseId: string,
  groupIds: string[],
) =>
  SELF.fetch(`https://example.com/api/v1/expenses/${expenseId}/groups`, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ groupIds }),
  })

export const updateHouseholdCurrency = async (
  accessToken: string,
  householdId: string,
  defaultCurrencyCode: string,
) =>
  SELF.fetch(`https://example.com/api/v1/households/${householdId}`, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ defaultCurrencyCode }),
  })
