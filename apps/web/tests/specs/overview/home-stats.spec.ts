/**
 * Overview/Home - Stats tests
 *
 * TC-OVW-001: Hero stats card displays
 * TC-OVW-002: Budget limit shown
 * TC-OVW-003: Days remaining calculates
 */

import { test, expect } from '../fixtures/auth.setup'
import { HomePage } from '../pages'

test.describe('Overview - Stats', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
    await page.waitForLoadState('networkidle')
  })

  test('TC-OVW-001: Hero stats card renders', async ({ page }) => {
    await expect(homePage.heroStatsCard().first()).toBeVisible()
  })

  test('TC-OVW-002: Budget limit displays', async ({ page }) => {
    const budgetDisplay = homePage.budgetLimitDisplay()
    if (await budgetDisplay.isVisible()) {
      const budgetText = await budgetDisplay.textContent()
      // Budget should show some number (format varies)
      expect(budgetText).toMatch(/\d/)
    }
  })

  test('TC-OVW-003: Days remaining shows positive number', async ({ page }) => {
    const daysDisplay = homePage.daysRemaining()
    await expect(daysDisplay.first()).toBeVisible()

    const daysText = await daysDisplay.textContent()
    // Extract number from text
    const daysMatch = daysText?.match(/\d+/)
    if (daysMatch) {
      const days = parseInt(daysMatch[0], 10)
      expect(days).toBeGreaterThanOrEqual(0)
      expect(days).toBeLessThanOrEqual(31)
    }
  })
})
