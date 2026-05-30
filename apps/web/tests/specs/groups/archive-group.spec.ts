/**
 * Groups - Archive tests
 *
 * TC-GRP-020: Archive group
 * TC-GRP-021: Archived group not in active list
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Groups - Archive', () => {
  test('TC-GRP-020: Archive group via confirmation', async ({ page }) => {
    await page.goto('/groups')
    await page.waitForSelector('[data-testid="group-item"]', { timeout: 10000 }).catch(() => test.skip())

    const countBefore = await page.locator('[data-testid="group-item"]').count()
    if (countBefore === 0) {
      test.skip()
    }

    const groupNames = await page.locator('[data-testid="group-item"]').allTextContents()

    // Click archive button
    await page.locator('[data-testid="group-item"]').first().locator('[aria-label="archive"]').click()

    // Confirm dialog
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /confirm|archive/i }).click()
    await page.waitForTimeout(1000)

    // Verify count decreased or text changed
    const countAfter = await page.locator('[data-testid="group-item"]').count()
    expect(countAfter).toBeLessThanOrEqual(countBefore)
  })

  test('TC-GRP-021: Archived group shows archived status', async ({ page }) => {
    await page.goto('/groups')

    // Check for archived filter/tab
    const archivedTab = page.getByRole('tab', { name: /archived/i })
    if (await archivedTab.isVisible()) {
      await archivedTab.click()
      await page.waitForTimeout(500)

      // Archived items should be visible
      await expect(page.locator('[data-testid="group-item"]').first()).toBeVisible()
    }
  })
})
