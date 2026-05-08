import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  createExpense,
  createHousehold,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('GET /api/v1/analytics/export', () => {
  it('returns 401 when request is unauthenticated', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/export?period=2026-05',
    )

    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid period', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-export-invalid:analytics-export-invalid@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/export?period=2026-5',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('returns 403 for non-member household export', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-analytics-export-owner:analytics-export-owner@example.com',
    )
    const stranger = await exchangeAccessToken(
      'test:firebase-user-analytics-export-stranger:analytics-export-stranger@example.com',
    )

    const householdResponse = await createHousehold(
      owner.accessToken,
      'Export household',
    )
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/export?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${stranger.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(403)
  })

  it('returns household CSV export excluding private expenses with expected headers', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-export-happy:analytics-export-happy@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Analytics export household',
    )
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    await createExpense(auth.accessToken, {
      amount: 12000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Breakfast',
      occurredAt: Date.UTC(2026, 4, 2, 8),
    })

    await createExpense(auth.accessToken, {
      amount: 7000,
      categoryKey: 'shopping',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private purchase',
      occurredAt: Date.UTC(2026, 4, 10, 11),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/export?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/csv; charset=utf-8')
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename=analytics-2026-05-household.csv',
    )

    const csv = await response.text()
    const lines = csv.split('\n')

    expect(lines[0]).toBe(
      'section,period,household_id,currency_code,metric_key,label,total_spend_minor,expense_count,previous_period,previous_total_spend_minor,delta_spend_minor,delta_percent,date,category_key,payer_user_id,group_id,group_name,visibility,title,amount_minor,occurred_at',
    )
    expect(
      lines.some((line) =>
        line.startsWith(
          `summary,2026-05,${householdId},VND,overview_total,Overview total spend,12000,1,`,
        ),
      ),
    ).toBe(true)
    expect(
      lines.some((line) =>
        line.startsWith(
          `comparison,2026-05,${householdId},VND,period_delta,Current versus previous period,12000,1,2026-04,0,12000,`,
        ),
      ),
    ).toBe(true)
    expect(
      lines.some((line) => line.startsWith('groups_summary,2026-05,')),
    ).toBe(true)
    expect(lines.some((line) => line.includes('expense_row,Breakfast'))).toBe(
      true,
    )
    expect(csv).not.toContain('Private purchase')
  })

  it('returns exact empty month CSV', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-export-empty:analytics-export-empty@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/export?period=2026-05',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const csv = await response.text()
    const lines = csv.split('\n')
    expect(lines[0]).toBe(
      'section,period,household_id,currency_code,metric_key,label,total_spend_minor,expense_count,previous_period,previous_total_spend_minor,delta_spend_minor,delta_percent,date,category_key,payer_user_id,group_id,group_name,visibility,title,amount_minor,occurred_at',
    )
    expect(
      lines.some((line) =>
        line.startsWith(
          'summary,2026-05,,VND,overview_total,Overview total spend,0,0,',
        ),
      ),
    ).toBe(true)
  })

  it('neutralizes spreadsheet formula cells in exported CSV', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-export-formula:analytics-export-formula@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Formula export household',
    )
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    await createExpense(auth.accessToken, {
      amount: 15000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: '=HYPERLINK("https://attacker.test","click")',
      occurredAt: Date.UTC(2026, 4, 7, 9),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/export?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const csv = await response.text()

    expect(csv).toContain(`'=HYPERLINK(""https://attacker.test"",""click"")`)
    expect(csv).not.toContain(
      `,=HYPERLINK(""https://attacker.test"",""click""),`,
    )
  })
})
