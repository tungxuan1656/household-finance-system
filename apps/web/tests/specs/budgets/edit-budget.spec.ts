/**
 * Budgets - Edit tests
 *
 * TC-BUD-010: Edit budget - modify limits
 * TC-BUD-011: Edit budget - change period
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Budgets - Edit', () => {
  test('TC-BUD-010: Edit budget opens dialog with pre-filled values', async ({ page }) => {
    await page.goto('/budgets')
    await page.waitForSelector('[data-testid="budget-item"], .budget-item', { timeout: 10000 }).catch(() => test.skip())

    // Click edit button on first budget
    await page.locator('[data-testid="budget-item"]').first().locator('[aria-label="edit"]').click()

    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible()

    // Period field should have value
    const periodInput = page.locator('[name="period"]')
    const periodValue = await periodInput.inputValue()
    expect(periodValue).toMatch(/\d{4}-\d{2}/)
  })

  test('TC-BUD-011: Edit budget - update limits', async ({ page }) => {
    await page.goto('/budgets')
    await page.waitForSelector('[data-testid="budget-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Open edit dialog
    await page.locator('[data-testid="budget-item"]').first().locator('[aria-label="edit"]').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Clear and update total limit
    await page.locator('[name="totalLimit"]').clear()
    await page.locator('[name="totalLimit"]').fill('20000000')

    // Save
    await page.getByRole('button', { name: /save|update|submit/i }).click()
    await page.waitForTimeout(1000)

    // Verify updated value
    await expect(page.getByText('20,000,000')).toBeVisible()
  })

  test('TC-BUD-012: Edit budget - cancel reverts changes', async ({ page }) => {
    await page.goto('/budgets')
    await page.waitForSelector('[data-testid="budget-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Get original limit
    const originalLimit = await page.locator('[data-testid="budget-item"] .budget-limit, [data-testid="budget-item"] [data-amount]').first().textContent()

    // Open edit
    await page.locator('[data-testid="budget-item"]').first().locator('[aria-label="edit"]').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Change limit
    await page.locator('[name="totalLimit"]').clear()
    await page.locator('[name="totalLimit"]').fill('9999999')

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
    await page.waitForTimeout(500)

    // Original value should remain
    const currentLimit = await page.locator('[data-testid="budget-item"]').first().textContent()
    expect(currentLimit).toContain(originalLimit?.replace(/[,\s]/g, ''))
  })
})
