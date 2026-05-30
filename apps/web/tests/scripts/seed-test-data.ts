/**
 * Seed script for test data via API
 *
 * Backend must be running at http://localhost:8787
 * Web must be running at http://localhost:3000
 *
 * Usage:
 *   npx tsx tests/scripts/seed-test-data.ts [cleanup|seed|demo]
 *
 * Examples:
 *   npx tsx tests/scripts/seed-test-data.ts seed    # Seed all test data
 *   npx tsx tests/scripts/seed-test-data.ts cleanup # Clean up test data
 *   npx tsx tests/scripts/seed-test-data.ts demo    # Seed comprehensive multi-date data for insights testing
 */

// Use relative imports for standalone script
import { signInWithFirebaseEmailPassword, getFirebaseIdToken } from '../../src/lib/auth/firebase-auth'

import * as expensesApi from '../../src/features/expenses/api/expense'
import * as budgetsApi from '../../src/features/budgets/api/budget'
import * as groupsApi from '../../src/features/groups/api/group'
import * as householdsApi from '../../src/features/households/api/household'
import { API_ENDPOINTS } from '../../src/api/endpoints'
import type { CreateExpenseRequest } from '../../src/features/expenses/types/expense'
import type { CreateBudgetRequest } from '../../src/features/budgets/types/budget'
import type { CreateExpenseGroupRequest } from '../../src/features/groups/types/group'
import type { CreateHouseholdRequest } from '../../src/features/households/types/household'
import type { CategoryKey, SourceKey } from '../../src/types/reference-data'

// Test account credentials
const TEST_EMAIL = process.env.TEST_ACCOUNT_EMAIL ?? 'tungxuan101998@gmail.com'
const TEST_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD ?? '10101998'

// API base URL (Cloudflare Workers default port)
const API_BASE = 'http://localhost:8787/api/v1'

// Track created entities for cleanup
const createdIds = {
  expenses: [] as string[],
  budgets: [] as string[],
  groups: [] as string[],
  households: [] as string[],
}

// Global access token
let accessToken = ''

// Categories and sources for test data
const CATEGORIES: CategoryKey[] = [
  'food',
  'transport',
  'shopping',
  'health',
  'social',
  'education',
  'travel',
  'other',
]
const SOURCES: SourceKey[] = ['cash', 'card', 'bank-transfer', 'other']

// ============================================================
// AUTHENTICATION
// ============================================================

async function authenticate(): Promise<void> {
  console.log('🔐 Authenticating...')
  try {
    const credential = await signInWithFirebaseEmailPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })
    const idToken = await getFirebaseIdToken(credential.user)
    const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.providerExchange}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, provider: 'firebase' }),
    })
    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status} ${await response.text()}`)
    }
    const data = await response.json()
    accessToken = data.accessToken
    console.log('✅ Authenticated successfully')
  } catch (error) {
    console.error('❌ Authentication failed:', error)
    throw error
  }
}

// ============================================================
// API HELPERS (bypass axios interceptor for seeding)
// ============================================================

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  const json = await response.json()
  if (!response.ok) {
    throw new Error(`API POST ${path} failed: ${response.status} ${JSON.stringify(json)}`)
  }
  return json.data ?? json
}

// ============================================================
// EXPENSE HELPERS
// ============================================================

async function createExpense(data: Partial<CreateExpenseRequest>): Promise<string> {
  const payload: CreateExpenseRequest = {
    amount: data.amount ?? Math.floor(Math.random() * 500000) + 10000,
    categoryKey: data.categoryKey ?? CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    sourceKey: data.sourceKey ?? SOURCES[Math.floor(Math.random() * SOURCES.length)],
    title: data.title ?? 'Test expense',
    occurredAt: data.occurredAt ?? Date.now(),
    note: data.note,
    householdId: data.householdId,
    groupIds: data.groupIds,
  }
  const result = await apiPost<{ id: string }>(API_ENDPOINTS.expenses.create, payload)
  createdIds.expenses.push(result.id)
  return result.id
}

async function deleteExpense(id: string): Promise<void> {
  await fetch(`${API_BASE}${API_ENDPOINTS.expenses.detail(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

// ============================================================
// BUDGET HELPERS
// ============================================================

async function createBudget(data: Partial<CreateBudgetRequest>): Promise<string> {
  const payload: CreateBudgetRequest = {
    householdId: data.householdId ?? '',
    period: data.period ?? '2026-06',
    totalLimit: data.totalLimit ?? 10000000,
    categoryLimits: data.categoryLimits,
  }
  const result = await apiPost<{ id: string }>(API_ENDPOINTS.budgets.create, payload)
  createdIds.budgets.push(result.id)
  return result.id
}

// ============================================================
// GROUP HELPERS
// ============================================================

async function createGroup(data: Partial<CreateExpenseGroupRequest>): Promise<string> {
  const payload: CreateExpenseGroupRequest = {
    name: data.name ?? 'Test Group',
    description: data.description,
    householdId: data.householdId,
    startDate: data.startDate,
    endDate: data.endDate,
    eventBudget: data.eventBudget,
  }
  const result = await apiPost<{ id: string }>(API_ENDPOINTS.groups.create, payload)
  createdIds.groups.push(result.id)
  return result.id
}

// ============================================================
// HOUSEHOLD HELPERS
// ============================================================

async function createHousehold(name: string): Promise<string> {
  const payload: CreateHouseholdRequest = { name }
  // POST /households to create
  const response = await fetch(`${API_BASE}/households`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
  const json = await response.json()
  if (!response.ok) {
    throw new Error(`Create household failed: ${response.status} ${JSON.stringify(json)}`)
  }
  const result = json.data ?? json
  createdIds.households.push(result.id)
  return result.id
}

// ============================================================
// SEED FUNCTIONS
// ============================================================

async function seedDailyExpenses(days: number = 30): Promise<void> {
  console.log(`📅 Seeding daily expenses (${days} days)...`)
  const now = Date.now()
  const msPerDay = 24 * 60 * 60 * 1000
  for (let i = 0; i < days; i++) {
    const date = now - i * msPerDay
    await createExpense({
      amount: Math.floor(Math.random() * 300000) + 10000,
      categoryKey: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      sourceKey: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      title: `Daily expense day ${i}`,
      occurredAt: date,
    })
  }
  console.log(`✅ Created ${days} daily expenses`)
}

async function seedMonthlyExpenses(months: number = 3): Promise<void> {
  console.log(`📅 Seeding monthly expenses (${months} months)...`)
  const now = new Date()
  for (let m = 0; m < months; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
    for (let d = 0; d < Math.min(daysInMonth, 10); d++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), d + 1)
      await createExpense({
        amount: Math.floor(Math.random() * 500000) + 50000,
        categoryKey: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        sourceKey: SOURCES[Math.floor(Math.random() * SOURCES.length)],
        title: `Monthly expense ${monthDate.toLocaleString('default', { month: 'long' })} day ${d + 1}`,
        occurredAt: date.getTime(),
      })
    }
  }
  console.log(`✅ Created ${months * 10} monthly expenses`)
}

async function seedYearlyExpenses(years: number = 2): Promise<void> {
  console.log(`📅 Seeding yearly expenses (${years} years)...`)
  const now = new Date()
  for (let y = 0; y < years; y++) {
    const year = now.getFullYear() - y
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(year, m, 15)
      await createExpense({
        amount: Math.floor(Math.random() * 1000000) + 100000,
        categoryKey: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        sourceKey: SOURCES[Math.floor(Math.random() * SOURCES.length)],
        title: `Yearly expense ${year}-${String(m + 1).padStart(2, '0')}`,
        occurredAt: monthDate.getTime(),
      })
    }
  }
  console.log(`✅ Created ${years * 12} yearly expenses`)
}

async function seedMultipleCategories(): Promise<void> {
  console.log('🏷️  Seeding multiple categories...')
  for (const category of CATEGORIES) {
    for (let i = 0; i < 5; i++) {
      await createExpense({
        amount: Math.floor(Math.random() * 200000) + 10000,
        categoryKey: category,
        sourceKey: SOURCES[Math.floor(Math.random() * SOURCES.length)],
        title: `${category} expense ${i + 1}`,
        occurredAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      })
    }
  }
  console.log(`✅ Created expenses for ${CATEGORIES.length} categories`)
}

async function seedBudgets(): Promise<void> {
  console.log('💰 Seeding budgets...')
  // Get first household
  const response = await fetch(`${API_BASE}${API_ENDPOINTS.households.list}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const householdData = await response.json()
  const householdId = householdData.data?.items?.[0]?.id

  if (!householdId) {
    console.log('⚠️  No household found, skipping budgets')
    return
  }

  // Current month budget
  await createBudget({
    householdId,
    period: '2026-06',
    totalLimit: 15000000,
    categoryLimits: [
      { categoryKey: 'food', limitMinor: 3000000 },
      { categoryKey: 'transport', limitMinor: 2000000 },
      { categoryKey: 'shopping', limitMinor: 2000000 },
    ],
  })

  // Previous month budget
  await createBudget({
    householdId,
    period: '2026-05',
    totalLimit: 12000000,
    categoryLimits: [
      { categoryKey: 'food', limitMinor: 2500000 },
      { categoryKey: 'transport', limitMinor: 1500000 },
    ],
  })

  console.log('✅ Created 2 budgets (current + previous month)')
}

async function seedGroups(): Promise<void> {
  console.log('👥 Seeding groups...')
  const response = await fetch(`${API_BASE}${API_ENDPOINTS.households.list}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const householdData = await response.json()
  const householdId = householdData.data?.items?.[0]?.id

  if (!householdId) {
    console.log('⚠️  No household found, skipping groups')
    return
  }

  await createGroup({
    householdId,
    name: 'Weekend Trip',
    description: 'Budget for weekend trip expenses',
    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    eventBudget: 5000000,
  })

  await createGroup({
    householdId,
    name: 'Groceries',
    description: 'Monthly groceries',
    startDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
    eventBudget: 3000000,
  })

  console.log('✅ Created 2 groups')
}

// ============================================================
// CLEANUP
// ============================================================

async function cleanup(): Promise<void> {
  console.log('🧹 Cleaning up test data...')

  for (const expenseId of createdIds.expenses) {
    try {
      await deleteExpense(expenseId)
    } catch {
      // Ignore errors during cleanup
    }
  }

  // Archive groups
  for (const groupId of createdIds.groups) {
    try {
      await fetch(`${API_BASE}${API_ENDPOINTS.groups.archive(groupId)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch {
      // Ignore errors during cleanup
    }
  }

  // Note: Budgets and households are harder to delete via API
  // In production, consider soft-delete or cascade delete

  createdIds.expenses = []
  createdIds.budgets = []
  createdIds.groups = []
  createdIds.households = []

  console.log('✅ Cleanup complete')
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const command = process.argv[2] ?? 'demo'

  try {
    await authenticate()

    switch (command) {
      case 'cleanup':
        await cleanup()
        break
      case 'seed':
        await seedDailyExpenses(30)
        await seedMultipleCategories()
        break
      case 'demo':
      default:
        // Comprehensive seed for insights testing
        console.log('\n🌍 ===== COMPREHENSIVE TEST DATA SEEDING =====\n')
        await seedDailyExpenses(30)
        await seedMonthlyExpenses(3)
        await seedYearlyExpenses(2)
        await seedMultipleCategories()
        await seedBudgets()
        await seedGroups()
        console.log('\n🌍 ===== SEEDING COMPLETE =====')
        console.log(`
Summary:
- 30 daily expenses (past 30 days)
- 30 monthly expenses (past 3 months, ~10 per month)
- 24 yearly expenses (past 2 years)
- 40 expenses across 8 categories
- 2 budgets (current + previous month)
- 2 expense groups

This data enables testing insights with:
- Week view (7-30 days data)
- Month view (3 months data)
- Quarter view (quarterly aggregation)
- Year view (2 years data)
- Category breakdown charts
- Comparison with previous period
        `)
        break
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
