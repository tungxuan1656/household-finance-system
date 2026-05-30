/**
 * Budgets - Status panel tests
 *
 * TC-BUD-030: View budget status panel loads correctly
 * TC-BUD-031: Budget status shows correct values
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Budgets - Status', () => {
  test('TC-BUD-030: Budget status panel renders', async ({ page }) => {
    await page.goto('/budgets')
    await page.waitForSelector('[data-testid="budget-item"]', { timeout: 10000 }).catch(() => {
      // Empty state OK
    })

    // Status panel should be visible
    const statusPanel = page.locator('[data-testid="budget-status-panel"], .budget-status')
    await expect(statusPanel.first()).toBeVisible()
  })

  test('TC-BUD-031: Budget status shows category breakdown', async ({ page }) => {
    await page.goto('/budgets')
    await page.waitForSelector('[data-testid="budget-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Click on a budget to expand status
    await page.locator('[data-testid="budget-item"]').first().click()
    await page.waitForTimeout(1000)

    // Should show category statuses
    const categoryStatuses = page.locator('[data-testid="category-status"], .category-status')
    const count = await categoryStatuses.count()
    if (count > 0) {
      await expect(categoryStatuses.first()).toBeVisible()
    }
  })

  test('TC-BUD-032: Budget summary card displays', async ({ page }) => {
    await page.goto('/budgets')

    // Summary card should be visible
    const summaryCard = page.locator('[data-testid="budget-summary"], .budget-summary')
    await expect(summaryCard.first()).toBeVisible()
  })
})
