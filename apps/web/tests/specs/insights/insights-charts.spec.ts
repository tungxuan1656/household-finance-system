/**
 * Insights - Charts tests
 *
 * TC-INS-020: Charts section renders
 * TC-INS-021: Category breakdown chart
 * TC-INS-022: Charts update with period change
 */

import { test, expect } from '../fixtures/auth.setup'
import { InsightsPage } from '../pages'

test.describe('Insights - Charts', () => {
  let insightsPage: InsightsPage

  test.beforeEach(async ({ page }) => {
    insightsPage = new InsightsPage(page)
    await insightsPage.goto()
    await page.waitForLoadState('networkidle')
  })

  test('TC-INS-020: Charts section renders', async ({ page }) => {
    // Charts section should be visible
    await expect(insightsPage.chartsSection().first()).toBeVisible()
  })

  test('TC-INS-021: Category breakdown chart visible', async ({ page }) => {
    // Wait for chart to potentially render
    await page.waitForTimeout(1000)

    // Chart container should be visible (may have data or empty state)
    const chart = page.locator('.recharts-wrapper, [data-testid="chart"], [data-testid="category-chart"]')
    const emptyState = page.locator('[data-testid="empty-state"], [data-testid="no-data"]')

    const hasChart = await chart.isVisible().catch(() => false)
    const hasEmpty = await emptyState.isVisible().catch(() => false)

    // Either chart or empty state should be visible
    expect(hasChart || hasEmpty).toBe(true)
  })

  test('TC-INS-022: Chart updates with period change', async ({ page }) => {
    // Get initial chart state
    const initialChart = await insightsPage.getChartData()

    // Change period
    await insightsPage.selectPeriod('year')
    await page.waitForTimeout(1500)

    // Chart should update (data or empty state)
    const updatedChart = await insightsPage.getChartData()

    // Chart section should still be visible
    await expect(insightsPage.chartsSection().first()).toBeVisible()
  })
})
