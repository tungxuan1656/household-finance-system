/**
 * Test data generators and constants
 */

import type { CreateExpenseRequest } from '../../src/features/expenses/types/expense'
import type { CreateBudgetRequest } from '../../src/features/budgets/types/budget'
import type { CreateExpenseGroupRequest } from '../../src/features/groups/types/group'
import type { CategoryKey, SourceKey } from '../../src/types/reference-data'

// ============================================================
// REFERENCE DATA
// ============================================================

export const TEST_CATEGORIES: CategoryKey[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'health',
  'entertainment',
  'education',
  'travel',
]

export const TEST_SOURCES: SourceKey[] = [
  'cash',
  'card',
  'bank-transfer',
  'momo',
  'zalo-pay',
]

// ============================================================
// DATA GENERATORS
// ============================================================

export function generateExpenseData(overrides?: Partial<CreateExpenseRequest>): CreateExpenseRequest {
  const randomCategory = TEST_CATEGORIES[Math.floor(Math.random() * TEST_CATEGORIES.length)]
  const randomSource = TEST_SOURCES[Math.floor(Math.random() * TEST_SOURCES.length)]

  return {
    amount: generateRandomAmount(),
    categoryKey: randomCategory,
    sourceKey: randomSource,
    title: `Test expense - ${randomCategory} - ${Date.now()}`,
    occurredAt: Date.now(),
    note: undefined,
    householdId: undefined,
    groupIds: undefined,
    ...overrides,
  }
}

export function generateBudgetData(overrides?: Partial<CreateBudgetRequest>): Partial<CreateBudgetRequest> {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const currentPeriod = `${currentMonth}`

  return {
    householdId: '',
    period: currentPeriod,
    totalLimit: 10000000,
    categoryLimits: [
      { categoryKey: 'food', limitMinor: 3000000 },
      { categoryKey: 'transport', limitMinor: 2000000 },
      { categoryKey: 'shopping', limitMinor: 2000000 },
    ],
    ...overrides,
  }
}

export function generateGroupData(overrides?: Partial<CreateExpenseGroupRequest>): Partial<CreateExpenseGroupRequest> {
  return {
    name: `Test Group ${Date.now()}`,
    description: 'Test group description',
    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    eventBudget: 5000000,
    ...overrides,
  }
}

export function generateAmount() {
  return generateRandomAmount()
}

export function generateRandomAmount(min: number = 10000, max: number = 500000) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateRandomCategory(): CategoryKey {
  return TEST_CATEGORIES[Math.floor(Math.random() * TEST_CATEGORIES.length)]
}

export function generateRandomSource(): SourceKey {
  return TEST_SOURCES[Math.floor(Math.random() * TEST_SOURCES.length)]
}

export function generatePastDate(daysAgo: number) {
  const msPerDay = 24 * 60 * 60 * 1000
  return Date.now() - Math.floor(Math.random() * daysAgo * msPerDay)
}

export function generateFutureDate(daysAhead: number) {
  const msPerDay = 24 * 60 * 60 * 1000
  return Date.now() + Math.floor(Math.random() * daysAhead * msPerDay)
}

// ============================================================
// EXPENSE DATA SETS (for insights testing)
// ============================================================

export function generateDailyExpenseDataset(count: number = 30): CreateExpenseRequest[] {
  const expenses: CreateExpenseRequest[] = []
  const msPerDay = 24 * 60 * 60 * 1000

  for (let i = 0; i < count; i++) {
    const category = TEST_CATEGORIES[i % TEST_CATEGORIES.length]
    expenses.push({
      amount: generateRandomAmount(10000, 300000),
      categoryKey: category,
      sourceKey: TEST_SOURCES[i % TEST_SOURCES.length],
      title: `Daily ${category} ${i + 1}`,
      occurredAt: Date.now() - i * msPerDay,
    })
  }

  return expenses
}

export function generateMonthlyExpenseDataset(months: number = 3): CreateExpenseRequest[] {
  const expenses: CreateExpenseRequest[] = []
  const now = new Date()

  for (let m = 0; m < months; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
    const expenseCount = Math.min(daysInMonth, 10)

    for (let d = 0; d < expenseCount; d++) {
      const dayDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), d + 1)
      expenses.push({
        amount: generateRandomAmount(50000, 500000),
        categoryKey: TEST_CATEGORIES[d % TEST_CATEGORIES.length],
        sourceKey: TEST_SOURCES[d % TEST_SOURCES.length],
        title: `Monthly ${monthDate.toLocaleString('default', { month: 'long' })} day ${d + 1}`,
        occurredAt: dayDate.getTime(),
      })
    }
  }

  return expenses
}

export function generateYearlyExpenseDataset(years: number = 2): CreateExpenseRequest[] {
  const expenses: CreateExpenseRequest[] = []
  const now = new Date()

  for (let y = 0; y < years; y++) {
    const year = now.getFullYear() - y
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(year, m-1, 15)
      expenses.push({
        amount: generateRandomAmount(100000, 1000000),
        categoryKey: TEST_CATEGORIES[m % TEST_CATEGORIES.length],
        sourceKey: TEST_SOURCES[m % TEST_SOURCES.length],
        title: `Yearly ${year}-${String(m + 1).padStart(2, '0')}`,
        occurredAt: monthDate.getTime(),
      })
    }
  }

  return expenses
}

export function generateCategoryAllDataset(): CreateExpenseRequest[] {
  const expenses: CreateExpenseRequest[] = []

  for (const category of TEST_CATEGORIES) {
    for (let i = 0; i < 5; i++) {
      expenses.push({
        amount: generateRandomAmount(10000, 200000),
        categoryKey: category,
        sourceKey: TEST_SOURCES[i % TEST_SOURCES.length],
        title: `${category} expense ${i + 1}`,
        occurredAt: generatePastDate(30),
      })
    }
  }

  return expenses
}

// Test account - credentials stored in .env.test (gitignored)
const _TEST_ACCOUNTS = {
  primary: {
    email: process.env.TEST_ACCOUNT_EMAIL ?? 'tungxuan101998@gmail.com',
    password: process.env.TEST_ACCOUNT_PASSWORD ?? '10101998',
  },
} as const

export { _TEST_ACCOUNTS as TEST_ACCOUNTS }
