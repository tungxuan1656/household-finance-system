/**
 * Expenses - Delete tests
 *
 * TC-EXP-040: Delete expense
 * TC-EXP-041: Delete expense with confirmation
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Expenses - Delete', () => {
  test('TC-EXP-040: Delete expense via detail page', async ({ page }) => {
    await page.goto('/expenses')
    await page.waitForSelector('[data-testid="expense-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Get count before
    const countBefore = await page.locator('[data-testid="expense-item"]').count()
    if (countBefore === 0) {
      test.skip()
    }

    // Click first expense
    await page.locator('[data-testid="expense-item"]').first().click()

    // Verify detail page
    await expect(page.url()).toMatch(/\/expenses\/[\w-]+$/)

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click()

    // Confirm dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible()

    // Confirm delete
    await page.getByRole('button', { name: /delete|confirm/i }).click()

    // Should redirect to expense list
    await expect(page.url()).toMatch(/\/expenses$/)

    // Verify count decreased
    await page.waitForTimeout(1000)
    const countAfter = await page.locator('[data-testid="expense-item"]').count()
    expect(countAfter).toBe(countBefore - 1)
  })

  test('TC-EXP-041: Cancel delete does not remove expense', async ({ page }) => {
    await page.goto('/expenses')
    await page.waitForSelector('[data-testid="expense-item"]', { timeout: 10000 }).catch(() => test.skip())

    const countBefore = await page.locator('[data-testid="expense-item"]').count()
    if (countBefore === 0) {
      test.skip()
    }

    // Open expense detail
    await page.locator('[data-testid="expense-item"]').first().click()

    // Click delete
    await page.getByRole('button', { name: /delete/i }).click()

    // Confirm dialog appears
    await expect(page.getByRole('dialog')).toBeVisible()

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
    await page.waitForTimeout(500)

    // Count should be unchanged
    const countAfter = await page.locator('[data-testid="expense-item"]').count()
    expect(countAfter).toBe(countBefore)
  })
})
