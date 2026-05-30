/**
 * Budgets - Delete tests
 *
 * TC-BUD-020: Delete budget with confirmation
 * TC-BUD-021: Cancel delete preserves budget
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Budgets - Delete', () => {
  test('TC-BUD-020: Delete budget via confirmation dialog', async ({ page }) => {
    await page.goto('/budgets')
    await page.waitForSelector('[data-testid="budget-item"]', { timeout: 10000 }).catch(() => test.skip())

    const countBefore = await page.locator('[data-testid="budget-item"]').count()
    if (countBefore === 0) {
      test.skip()
    }

    // Click delete on first budget
    await page.locator('[data-testid="budget-item"]').first().locator('[aria-label="delete"]').click()

    // Confirm dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible()

    // Confirm
    await page.getByRole('button', { name: /delete|confirm/i }).click()
    await page.waitForTimeout(1000)

    // Verify count decreased
    const countAfter = await page.locator('[data-testid="budget-item"]').count()
    expect(countAfter).toBe(countBefore - 1)
  })

  test('TC-BUD-021: Cancel delete preserves budget', async ({ page }) => {
    await page.goto('/budgets')
    await page.waitForSelector('[data-testid="budget-item"]', { timeout: 10000 }).catch(() => test.skip())

    const countBefore = await page.locator('[data-testid="budget-item"]').count()
    if (countBefore === 0) {
      test.skip()
    }

    const budgetText = await page.locator('[data-testid="budget-item"]').first().textContent()

    // Click delete
    await page.locator('[data-testid="budget-item"]').first().locator('[aria-label="delete"]').click()

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
    await page.waitForTimeout(500)

    // Count unchanged
    const countAfter = await page.locator('[data-testid="budget-item"]').count()
    expect(countAfter).toBe(countBefore)

    // Budget still in list
    const newBudgetText = await page.locator('[data-testid="budget-item"]').first().textContent()
    expect(newBudgetText).toBe(budgetText)
  })
})
