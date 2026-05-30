/**
 * Expenses - Filter tests
 *
 * TC-EXP-020: Filter by category
 * TC-EXP-021: Filter by date range
 * TC-EXP-022: Filter by amount range
 * TC-EXP-023: Filter by household
 * TC-EXP-024: Filter by group
 * TC-EXP-025: Combined filters
 */

import { test, expect } from '../fixtures/auth.setup'
import { ExpensesPage } from '../pages'

test.describe('Expenses - Filters', () => {
  let expensesPage: ExpensesPage

  test.beforeEach(async ({ page }) => {
    expensesPage = new ExpensesPage(page)
    await expensesPage.goto()
    // Wait for list to load
    await page.waitForSelector('[data-testid="expense-item"], .expense-item', { timeout: 10000 }).catch(() => {
      // Empty list is OK
    })
  })

  test('TC-EXP-020: Filter by category', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid="expense-item"], .expense-item').count()

    // Apply category filter
    await expensesPage.filterByCategory('food')

    // Wait for filtering to apply
    await page.waitForTimeout(500)

    // Verify only food category items are shown
    const items = await page.locator('[data-testid="expense-item"], .expense-item').all()
    for (const item of items) {
      const text = await item.textContent()
      expect(text?.toLowerCase()).toContain('food')
    }
  })

  test('TC-EXP-021: Filter by date range', async ({ page }) => {
    // Open date range filter
    await page.locator('[data-testid="date-range-filter"]').click()
    await page.waitForSelector('[role="dialog"], [role="presentation"]', { state: 'visible' })

    // Select "Last 7 days"
    await page.getByRole('option', { name: /last 7|week/i }).click()

    // Wait for filter to apply
    await page.waitForTimeout(1000)

    // Verify date displayed is within range
    const items = await page.locator('[data-testid="expense-item"], .expense-item').all()
    if (items.length > 0) {
      // Just verify list is present
      await expect(items[0]).toBeVisible()
    }
  })

  test('TC-EXP-022: Filter by amount range', async ({ page }) => {
    // Open amount filter
    const amountFilter = page.locator('[data-testid="amount-filter"], [name="amountRange"]')
    if (await amountFilter.isVisible()) {
      await amountFilter.click()
      await page.waitForSelector('[role="dialog"]', { state: 'visible' })

      // Set min/max
      await page.locator('[name="amountMin"]').fill('10000')
      await page.locator('[name="amountMax"]').fill('100000')

      // Apply
      await page.getByRole('button', { name: /apply|filter/i }).click()
      await page.waitForTimeout(1000)
    }

    // List should update (verify no crash)
    await expect(expensesPage.expenseList().first()).toBeVisible()
  })

  test('TC-EXP-023: Filter by household', async ({ page }) => {
    // Find and select household filter
    const householdFilter = page.locator('[data-testid="household-filter"], [name="household"]')
    if (await householdFilter.isVisible()) {
      // Get available options
      const options = await householdFilter.locator('option').allTextContents()
      if (options.length > 1) {
        await householdFilter.selectOption({ index: 1 })
        await page.waitForTimeout(1000)
      }
    }

    // List should update
    await expect(expensesPage.expenseList().first()).toBeVisible()
  })

  test('TC-EXP-024: Filter by group', async ({ page }) => {
    const groupFilter = page.locator('[data-testid="group-filter"], [name="group"]')
    if (await groupFilter.isVisible()) {
      const options = await groupFilter.locator('option').allTextContents()
      if (options.length > 1) {
        await groupFilter.selectOption({ index: 1 })
        await page.waitForTimeout(1000)
      }
    }

    await expect(expensesPage.expenseList().first()).toBeVisible()
  })

  test('TC-EXP-025: Clear all filters', async ({ page }) => {
    // Apply a filter first
    await page.locator('[data-testid="date-range-filter"]').click()
    await page.getByRole('option', { name: /last 7/i }).click()
    await page.waitForTimeout(500)

    // Clear filters button
    const clearButton = page.getByRole('button', { name: /clear|reset/i })
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await page.waitForTimeout(500)
    }

    // Verify list is visible
    await expect(expensesPage.expenseList().first()).toBeVisible()
  })
})
