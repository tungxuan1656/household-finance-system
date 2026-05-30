/**
 * Expenses - Create expense tests
 *
 * TC-EXP-001: Create expense - all fields
 * TC-EXP-002: Create expense - minimal fields
 * TC-EXP-003: Create expense - multiple date ranges
 */

import { test, expect } from '../fixtures/auth.setup'
import { ExpensesPage } from '../pages'

test.describe('Expenses - Create', () => {
  let expensesPage: ExpensesPage

  test.beforeEach(async ({ page }) => {
    expensesPage = new ExpensesPage(page)
    await expensesPage.goto()

    // Ensure user is authenticated (localStorage has session)
    await page.evaluate(() => {
      // Check if auth store has valid session
      const store = localStorage.getItem('auth-store')
      if (!store) {
        console.warn('No auth-store found - test may fail')
      }
    })
  })

  test('TC-EXP-001: Create expense with all fields', async ({ page }) => {
    // Open add expense drawer
    await expensesPage.openAddExpenseDrawer()

    // Fill step 1: Amount and category
    const amount = Math.floor(Math.random() * 500000) + 10000
    await page.locator('[data-testid="amount-input"], [name="amount"]').fill(amount.toString())
    await page.locator('[data-testid="category-picker"]').click()
    await page.getByRole('option', { name: 'food' }).click()

    // Fill title
    await page.locator('[data-testid="title-input"], [name="title"]').fill('Test expense - full fields')

    // Step navigation if needed
    const nextButton = page.getByRole('button', { name: /next|continue/i })
    if (await nextButton.isVisible()) {
      await nextButton.click()
    }

    // Fill step 2: Source and date
    await page.locator('[data-testid="source-picker"]').click()
    await page.getByRole('option', { name: 'card' }).click()
    await page.locator('[data-testid="date-picker"], [name="occurredAt"]').fill('2026-05-15')

    // Step navigation if needed
    if (await nextButton.isVisible()) {
      await nextButton.click()
    }

    // Submit
    await page.getByRole('button', { name: /submit|save|create/i }).click()

    // Verify expense appears in list
    await expect(page.getByText('Test expense - full fields')).toBeVisible({ timeout: 10000 })
  })

  test('TC-EXP-002: Create expense with minimal fields', async ({ page }) => {
    await expensesPage.openAddExpenseDrawer()

    // Fill minimal fields only
    const amount = 50000
    await page.locator('[data-testid="amount-input"], [name="amount"]').fill(amount.toString())
    await page.locator('[data-testid="category-picker"]').click()
    await page.getByRole('option', { name: 'transport' }).click()
    await page.locator('[data-testid="title-input"], [name="title"]').fill('Minimal expense')

    // Submit directly
    await page.getByRole('button', { name: /submit|save|create/i }).click()

    // Verify
    await expect(page.getByText('Minimal expense')).toBeVisible({ timeout: 10000 })
  })

  test('TC-EXP-003: Create expenses across multiple date ranges', async ({ page }) => {
    // Day range - today
    await expensesPage.openAddExpenseDrawer()
    await page.locator('[data-testid="amount-input"], [name="amount"]').fill('50000')
    await page.locator('[data-testid="category-picker"]').click()
    await page.getByRole('option', { name: 'food' }).click()
    await page.locator('[name="title"]').fill('Today expense')
    await page.locator('[data-testid="date-picker"]').fill(new Date().toISOString().split('T')[0])
    await page.getByRole('button', { name: /submit/i }).click()
    await expect(page.getByText('Today expense')).toBeVisible({ timeout: 10000 })

    // Week range - 7 days ago
    await expensesPage.openAddExpenseDrawer()
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    await page.locator('[name="amount"]').fill('75000')
    await page.locator('[data-testid="category-picker"]').click()
    await page.getByRole('option', { name: 'transport' }).click()
    await page.locator('[name="title"]').fill('Week ago expense')
    await page.locator('[data-testid="date-picker"]').fill(weekAgo.toISOString().split('T')[0])
    await page.getByRole('button', { name: /submit/i }).click()
    await expect(page.getByText('Week ago expense')).toBeVisible({ timeout: 10000 })

    // Month range - 1 month ago
    await expensesPage.openAddExpenseDrawer()
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await page.locator('[name="amount"]').fill('100000')
    await page.locator('[data-testid="category-picker"]').click()
    await page.getByRole('option', { name: 'shopping' }).click()
    await page.locator('[name="title"]').fill('Month ago expense')
    await page.locator('[data-testid="date-picker"]').fill(monthAgo.toISOString().split('T')[0])
    await page.getByRole('button', { name: /submit/i }).click()
    await expect(page.getByText('Month ago expense')).toBeVisible({ timeout: 10000 })
  })
})
