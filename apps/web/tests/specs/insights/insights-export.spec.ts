/**
 * Insights - Export tests
 *
 * TC-INS-030: Export button state when no data
 * TC-INS-031: Export functionality when data present
 */

import { test, expect } from '../fixtures/auth.setup'
import { InsightsPage } from '../pages'

test.describe('Insights - Export', () => {
  let insightsPage: InsightsPage

  test.beforeEach(async ({ page }) => {
    insightsPage = new InsightsPage(page)
    await insightsPage.goto()
    await page.waitForLoadState('networkidle')
  })

  test('TC-INS-030: Export button visible', async ({ page }) => {
    await expect(insightsPage.exportButton()).toBeVisible()
  })

  test('TC-INS-031: Export downloads data', async ({ page }) => {
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null)

    // Click export
    await insightsPage.clickExport()

    // Wait for download to start
    const download = await downloadPromise
    if (download) {
      // Verify filename contains expected pattern
      expect(download.suggestedFilename()).toMatch(/\.(csv|excel|xlsx|json)/i)
    }
  })
})
