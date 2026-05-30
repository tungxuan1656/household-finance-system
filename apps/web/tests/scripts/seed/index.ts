/**
 * Seed script for test data via API
 *
 * Backend must be running at http://localhost:8787
 * Web must be running at http://localhost:3000
 *
 * Usage:
 *   npx tsx tests/scripts/seed/index.ts [cleanup|seed|demo]
 *
 * Examples:
 *   npx tsx tests/scripts/seed/index.ts seed    # Seed all test data
 *   npx tsx tests/scripts/seed/index.ts cleanup # Clean up test data
 *   npx tsx tsx tests/scripts/seed/index.ts demo    # Seed comprehensive multi-date data for insights testing
 */

import { CATEGORIES, createdIds } from './types'
import { authenticate } from './auth'
import {
  createExpense,
  createBudget,
  createGroup,
  getFirstHouseholdId,
  deleteExpense,
  apiDelete,
} from './helpers'
import { API_ENDPOINTS } from '../../../../src/api/endpoints'
import { getAccessToken } from './types'

// ============================================================
// SEED FUNCTIONS
// ============================================================

async function seedDailyExpenses(days: number = 30): Promise<void> {
  console.log(`📅 Seeding daily expenses (${days} days)...`)
  const now = Date.now()
  const msPerDay = 24 * 60 * 60 * 1000
  for (let i = 0; i < days; i++) {
    const date = now - i * msPerDay
    const id = await createExpense({
      amount: Math.floor(Math.random() * 300000) + 10000,
      categoryKey: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      sourceKey: 'card',
      title: `Daily expense day ${i}`,
      occurredAt: date,
    })
    createdIds.expenses.push(id)
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
      const id = await createExpense({
        amount: Math.floor(Math.random() * 500000) + 50000,
        categoryKey: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        sourceKey: 'card',
        title: `Monthly expense ${monthDate.toLocaleString('default', { month: 'long' })} day ${d + 1}`,
        occurredAt: date.getTime(),
      })
      createdIds.expenses.push(id)
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
      const id = await createExpense({
        amount: Math.floor(Math.random() * 1000000) + 100000,
        categoryKey: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        sourceKey: 'bank-transfer',
        title: `Yearly expense ${year}-${String(m + 1).padStart(2, '0')}`,
        occurredAt: monthDate.getTime(),
      })
      createdIds.expenses.push(id)
    }
  }
  console.log(`✅ Created ${years * 12} yearly expenses`)
}

async function seedMultipleCategories(): Promise<void> {
  console.log('🏷️  Seeding multiple categories...')
  for (const category of CATEGORIES) {
    for (let i = 0; i < 5; i++) {
      const id = await createExpense({
        amount: Math.floor(Math.random() * 200000) + 10000,
        categoryKey: category,
        sourceKey: 'cash',
        title: `${category} expense ${i + 1}`,
        occurredAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      })
      createdIds.expenses.push(id)
    }
  }
  console.log(`✅ Created expenses for ${CATEGORIES.length} categories`)
}

async function seedBudgets(): Promise<void> {
  console.log('💰 Seeding budgets...')
  const householdId = await getFirstHouseholdId()

  if (!householdId) {
    console.log('⚠️  No household found, skipping budgets')
    return
  }

  // Current month budget
  const budget1Id = await createBudget({
    householdId,
    period: '2026-06',
    totalLimit: 15000000,
    categoryLimits: [
      { categoryKey: 'food', limitMinor: 3000000 },
      { categoryKey: 'transport', limitMinor: 2000000 },
      { categoryKey: 'shopping', limitMinor: 2000000 },
    ],
  })
  createdIds.budgets.push(budget1Id)

  // Previous month budget
  const budget2Id = await createBudget({
    householdId,
    period: '2026-05',
    totalLimit: 12000000,
    categoryLimits: [
      { categoryKey: 'food', limitMinor: 2500000 },
      { categoryKey: 'transport', limitMinor: 1500000 },
    ],
  })
  createdIds.budgets.push(budget2Id)

  console.log('✅ Created 2 budgets (current + previous month)')
}

async function seedGroups(): Promise<void> {
  console.log('👥 Seeding groups...')
  const householdId = await getFirstHouseholdId()

  if (!householdId) {
    console.log('⚠️  No household found, skipping groups')
    return
  }

  const group1Id = await createGroup({
    householdId,
    name: 'Weekend Trip',
    description: 'Budget for weekend trip expenses',
    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    eventBudget: 5000000,
  })
  createdIds.groups.push(group1Id)

  const group2Id = await createGroup({
    householdId,
    name: 'Groceries',
    description: 'Monthly groceries',
    startDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
    eventBudget: 3000000,
  })
  createdIds.groups.push(group2Id)

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
      await apiDelete(API_ENDPOINTS.groups.archive(groupId))
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