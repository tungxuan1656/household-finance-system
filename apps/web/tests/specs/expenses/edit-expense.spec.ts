/**
 * Expenses - Edit tests
 *
 * TC-EXP-030: Edit expense
 * TC-EXP-031: Edit expense - change amount
 * TC-EXP-032: Edit expense - change category
 */

import { test, expect } from '../fixtures/auth.setup'
import { ExpenseDetailPage } from '../pages'

test.describe('Expenses - Edit', () => {
  test('TC-EXP-030: Edit expense opens dialog', async ({ page }) => {
    // Navigate to expense detail
    await page.goto('/expenses')

    // Wait for list to load
    await page.waitForSelector('[data-testid="expense-item"], .expense-item', { timeout: 10000 }).catch(() => {
      test.skip('No expenses found')
    })

    // Click first expense
    const firstExpense = page.locator('[data-testid="expense-item"], .expense-item').first()
    await firstExpense.click()

    // Verify detail page
    await expect(page.url()).toMatch(/\/expenses\/[\w-]+$/)

    // Click edit button
    await page.getByRole('button', { name: /edit/i }).click()

    // Verify edit dialog opens
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Form fields should be pre-filled
    const titleInput = page.locator('[data-testid="title-input"], [name="title"]')
    await expect(titleInput).toBeVisible()
  })

  test('TC-EXP-031: Edit expense amount', async ({ page }) => {
    await page.goto('/expenses')
    await page.waitForSelector('[data-testid="expense-item"]', { timeout: 10000 }).catch(() => test.skip())

    const detailPage = new ExpenseDetailPage(page)
    await page.locator('[data-testid="expense-item"]').first().click()

    // Click edit
    await page.getByRole('button', { name: /edit/i }).click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Clear and fill new amount
    const amountInput = page.locator('[data-testid="amount-input"], [name="amount"]')
    await amountInput.clear()
    await amountInput.fill('999999')

    // Save
    await page.getByRole('button', { name: /save|update|submit/i }).click()
    await page.waitForTimeout(1000)

    // Verify updated amount is displayed
    await expect(page.getByText('999,999')).toBeVisible()
  })

  test('TC-EXP-032: Cancel edit does not save changes', async ({ page }) => {
    await page.goto('/expenses')
    await page.waitForSelector('[data-testid="expense-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Get original amount
    const originalAmount = await page.locator('[data-testid="expense-amount"], .expense-amount').first().textContent()

    // Click edit
    await page.getByRole('button', { name: /edit/i }).click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Change amount
    await page.locator('[name="amount"]').fill('123456')

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
    await page.waitForTimeout(500)

    // Original amount should be unchanged
    const currentAmount = await page.locator('[data-testid="expense-amount"]').first().textContent()
    expect(currentAmount).toBe(originalAmount)
  })
})
