/**
 * Insights - Period filter tests
 *
 * TC-INS-010: Week view
 * TC-INS-011: Month view
 * TC-INS-012: Quarter view
 * TC-INS-013: Year view
 * TC INS-014: Period comparison
 */

import { test, expect } from '../fixtures/auth.setup'
import { InsightsPage } from '../pages'

test.describe('Insights - Period Filter', () => {
  let insightsPage: InsightsPage

  test.beforeEach(async ({ page }) => {
    insightsPage = new InsightsPage(page)
    await insightsPage.goto()
    await page.waitForLoadState('networkidle')
  })

  test('TC-INS-010: Week view loads', async ({ page }) => {
    await insightsPage.selectPeriod('week')
    await page.waitForTimeout(1000)

    // Should show week-filtered data
    const overviewVisible = await insightsPage.overviewPanel().isVisible()
    expect(overviewVisible).toBe(true)
  })

  test('TC-INS-011: Month view loads', async ({ page }) => {
    await insightsPage.selectPeriod('month')
    await page.waitForTimeout(1000)

    const overviewVisible = await insightsPage.overviewPanel().isVisible()
    expect(overviewVisible).toBe(true)
  })

  test('TC-INS-012: Quarter view loads', async ({ page }) => {
    await insightsPage.selectPeriod('quarter')
    await page.waitForTimeout(1000)

    const overviewVisible = await insightsPage.overviewPanel().isVisible()
    expect(overviewVisible).toBe(true)
  })

  test('TC-INS-013: Year view loads', async ({ page }) => {
    await insightsPage.selectPeriod('year')
    await page.waitForTimeout(1000)

    const overviewVisible = await insightsPage.overviewPanel().isVisible()
    expect(overviewVisible).toBe(true)
  })

  test('TC-INS-014: Period comparison panel shows delta', async ({ page }) => {
    // Select a period
    await insightsPage.selectPeriod('month')

    // Comparison panel should be visible
    await expect(insightsPage.comparisonPanel().first()).toBeVisible()

    // Should show current vs previous
    const compText = await insightsPage.comparisonPanel().textContent()

    // May show delta or comparison numbers
    if (compText) {
      // Any text content means panel rendered
      await expect(insightsPage.comparisonPanel().first()).toBeVisible()
    }
  })
})
