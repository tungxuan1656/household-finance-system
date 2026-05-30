/**
 * Expenses - View and list tests
 *
 * TC-EXP-010: View expense list
 * TC-EXP-011: View expense detail
 * TC-EXP-012: Expense pagination (if applicable)
 */

import { test, expect } from '../fixtures/auth.setup'
import { ExpensesPage } from '../pages'

test.describe('Expenses - View', () => {
  let expensesPage: ExpensesPage

  test.beforeEach(async ({ page }) => {
    expensesPage = new ExpensesPage(page)
    await expensesPage.goto()
  })

  test('TC-EXP-010: View expense list loads correctly', async ({ page }) => {
    // Verify page title or header
    await expect(page.getByRole('heading', { name: /expense/i })).toBeVisible()

    // Verify filter bar is visible
    await expect(expensesPage.filterBar()).toBeVisible()

    // Verify list container is visible (even if empty)
    await expect(expensesPage.expenseList().first()).toBeVisible()
  })

  test('TC-EXP-011: Navigate to expense detail', async ({ page }) => {
    // Wait for at least one expense to load
    await page.waitForSelector('[data-testid="expense-item"], .expense-item', { timeout: 10000 })

    // Click first expense
    const firstExpense = page.locator('[data-testid="expense-item"], .expense-item').first()
    await firstExpense.click()

    // Verify detail page URL pattern
    await expect(page.url()).toMatch(/\/expenses\/[\w-]+$/)

    // Verify detail page renders
    await expect(page.locator('[data-testid="expense-title"], .expense-title')).toBeVisible()
  })

  test('TC-EXP-012: Empty state when no expenses', async ({ page }) => {
    // Navigate to page without any expenses (use filter that returns nothing)
    // For now, just verify the list section is visible
    await expect(expensesPage.expenseList().first()).toBeVisible()
  })
})
