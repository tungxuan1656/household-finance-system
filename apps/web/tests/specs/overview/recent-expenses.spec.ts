/**
 * Overview/Home - Recent expenses tests
 *
 * TC-OVW-010: Recent expenses section shows
 * TC-OVW-011: Clicking expense navigates to detail
 */

import { test, expect } from '../fixtures/auth.setup'
import { HomePage } from '../pages'

test.describe('Overview - Recent Expenses', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
    await page.waitForLoadState('networkidle')
  })

  test('TC-OVW-010: Recent expenses section visible', async ({ page }) => {
    const recentSection = homePage.recentExpensesSection()
    await expect(recentSection.first()).toBeVisible()
  })

  test('TC-OVW-011: Click expense navigates to detail', async ({ page }) => {
    // Find first expense item
    const expenseItem = page.locator('[data-testid="recent-expense-item"], .recent-expense-item').first()

    const isVisible = await expenseItem.isVisible().catch(() => false)
    if (!isVisible) {
      // No recent expenses - skip
      test.skip()
    }

    // Click it
    await expenseItem.click()
    await page.waitForTimeout(500)

    // Should navigate to expense detail
    await expect(page.url()).toMatch(/\/expenses\/[\w-]+/)
  })
})
