import type { ReferenceCategoryKey } from '@/contracts/reference-data'

const SPREADSHEET_FORMULA_PREFIX = /^[=+\-@\t\r]/

export const sanitizeCsvCell = (value: string): string =>
  SPREADSHEET_FORMULA_PREFIX.test(value) ? `'${value}` : value

const csvEscape = (value: string): string => {
  const sanitizedValue = sanitizeCsvCell(value)

  if (/[",\n]/.test(sanitizedValue)) {
    return `"${sanitizedValue.replaceAll('"', '""')}"`
  }

  return sanitizedValue
}

type AnalyticsExportExpenseRow = {
  id: string
  occurredAt: number
  categoryKey: ReferenceCategoryKey
  payerUserId: string
  visibility: 'private' | 'household'
  title: string
  amountMinor: number
}

type AnalyticsOverviewExportInput = {
  period: string
  householdId: string | null
  currencyCode: string
  totalSpendMinor: number
  expenseCount: number
  dailySpend: Array<{ date: string; totalSpendMinor: number }>
  topCategories: Array<{
    categoryKey: ReferenceCategoryKey
    totalSpendMinor: number
    percentOfTotal: number
    expenseCount: number
  }>
}

type AnalyticsComparisonExportInput = {
  householdId: string | null
  currencyCode: string
  currentPeriod: {
    period: string
    totalSpendMinor: number
    expenseCount: number
  }
  previousPeriod: {
    period: string
    totalSpendMinor: number
    expenseCount: number
  }
  totalDeltaSpendMinor: number
  totalDeltaPercent: number | null
  topCategoryDeltas: Array<{
    categoryKey: ReferenceCategoryKey
    currentTotalSpendMinor: number
    previousTotalSpendMinor: number
    deltaSpendMinor: number
    deltaPercent: number | null
  }>
  payerAttribution: Array<{
    payerDisplayName: string | null
    payerUserId: string
    totalSpendMinor: number
    percentOfTotal: number
    expenseCount: number
  }>
}

type AnalyticsGroupsExportInput = {
  period: string
  householdId: string | null
  currencyCode: string
  totalGroupedSpendMinor: number
  groups: Array<{
    groupId: string
    groupName: string
    totalSpendMinor: number
    expenseCount: number
    overlapPercentOfTotal: number
    percentOfTotal: number
  }>
}

export const buildAnalyticsExportCsv = (input: {
  comparison: AnalyticsComparisonExportInput
  expenseRows: AnalyticsExportExpenseRow[]
  groups: AnalyticsGroupsExportInput
  overview: AnalyticsOverviewExportInput
}): string => {
  const header = [
    'section',
    'period',
    'household_id',
    'currency_code',
    'metric_key',
    'label',
    'total_spend_minor',
    'expense_count',
    'previous_period',
    'previous_total_spend_minor',
    'delta_spend_minor',
    'delta_percent',
    'date',
    'category_key',
    'payer_user_id',
    'group_id',
    'group_name',
    'visibility',
    'title',
    'amount_minor',
    'occurred_at',
  ]

  const lines = [header.join(',')]
  const baseRow = [
    input.overview.period,
    input.overview.householdId ?? '',
    input.overview.currencyCode,
  ]

  const pushRow = (values: Array<string | number | null>) => {
    lines.push(values.map((value) => csvEscape(String(value ?? ''))).join(','))
  }

  lines.push(
    [
      'summary',
      ...baseRow,
      'overview_total',
      'Overview total spend',
      input.overview.totalSpendMinor,
      input.overview.expenseCount,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]
      .map((value) => csvEscape(String(value)))
      .join(','),
  )

  for (const point of input.overview.dailySpend) {
    pushRow([
      'daily',
      ...baseRow,
      'daily_total',
      'Daily spend total',
      '',
      '',
      '',
      '',
      '',
      '',
      point.date,
      '',
      '',
      '',
      '',
      '',
      '',
      point.totalSpendMinor,
      '',
    ])
  }

  for (const category of input.overview.topCategories) {
    pushRow([
      'category',
      ...baseRow,
      'top_category',
      'Top category total',
      category.totalSpendMinor,
      category.expenseCount,
      '',
      '',
      '',
      category.percentOfTotal,
      '',
      category.categoryKey,
      '',
      '',
      '',
      '',
      '',
      '',
    ])
  }

  pushRow([
    'comparison',
    ...baseRow,
    'period_delta',
    'Current versus previous period',
    input.comparison.currentPeriod.totalSpendMinor,
    input.comparison.currentPeriod.expenseCount,
    input.comparison.previousPeriod.period,
    input.comparison.previousPeriod.totalSpendMinor,
    input.comparison.totalDeltaSpendMinor,
    input.comparison.totalDeltaPercent,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ])

  for (const categoryDelta of input.comparison.topCategoryDeltas) {
    pushRow([
      'comparison_category',
      ...baseRow,
      'category_delta',
      'Category delta',
      categoryDelta.currentTotalSpendMinor,
      '',
      input.comparison.previousPeriod.period,
      categoryDelta.previousTotalSpendMinor,
      categoryDelta.deltaSpendMinor,
      categoryDelta.deltaPercent,
      '',
      categoryDelta.categoryKey,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ])
  }

  for (const payer of input.comparison.payerAttribution) {
    pushRow([
      'comparison_payer',
      ...baseRow,
      'payer_attribution',
      payer.payerDisplayName ?? 'Unknown payer',
      payer.totalSpendMinor,
      payer.expenseCount,
      '',
      '',
      '',
      payer.percentOfTotal,
      '',
      '',
      payer.payerUserId,
      '',
      '',
      '',
      '',
      '',
      '',
    ])
  }

  pushRow([
    'groups_summary',
    ...baseRow,
    'grouped_total',
    'Grouped spend total',
    input.groups.totalGroupedSpendMinor,
    input.groups.groups.reduce((count, group) => count + group.expenseCount, 0),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ])

  for (const group of input.groups.groups) {
    pushRow([
      'group',
      ...baseRow,
      'group_breakdown',
      group.groupName,
      group.totalSpendMinor,
      group.expenseCount,
      '',
      '',
      '',
      group.overlapPercentOfTotal,
      '',
      '',
      '',
      group.groupId,
      group.groupName,
      '',
      '',
      '',
      '',
    ])
  }

  for (const row of input.expenseRows) {
    pushRow([
      'expense',
      ...baseRow,
      'expense_row',
      row.title,
      '',
      '',
      '',
      '',
      '',
      '',
      new Date(row.occurredAt).toISOString().slice(0, 10),
      row.categoryKey,
      row.payerUserId,
      '',
      '',
      row.visibility,
      row.title,
      row.amountMinor,
      new Date(row.occurredAt).toISOString(),
    ])
  }

  return lines.join('\n')
}
