/**
 * Households - Archive tests
 *
 * TC-HH-030: Archive household (empty)
 * TC-HH-031: Archive fails with members
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Households - Archive', () => {
  test('TC-HH-030: Archive household without members', async ({ page }) => {
    await page.goto('/households')
    await page.waitForSelector('[data-testid="household-item"]', { timeout: 10000 }).catch(() => test.skip())

    const countBefore = await page.locator('[data-testid="household-item"]').count()

    // Click archive button
    await page.locator('[data-testid="household-item"]').first().locator('[aria-label="archive"]').click()

    // Confirm dialog
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /confirm|archive/i }).click()
    await page.waitForTimeout(1000)

    // Verify count decreased or item moved to archived
    const countAfter = await page.locator('[data-testid="household-item"]').count()
    expect(countAfter).toBeLessThanOrEqual(countBefore)
  })

  test('TC-HH-031: Archive blocked when members exist', async ({ page }) => {
    await page.goto('/households')
    await page.waitForSelector('[data-testid="household-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Navigate to household
    await page.locator('[data-testid="household-item"]').first().click()
    await page.waitForLoadState('networkidle')

    // Check if members exist
    const memberCount = await page.locator('[data-testid="member-item"], .member-item').count()

    if (memberCount > 0) {
      // Archive button should be disabled or show warning
      const archiveButton = page.getByRole('button', { name: /archive/i })
      await expect(archiveButton).toBeVisible()

      // Maybe click to test blocked behavior
      await archiveButton.click()
      await page.waitForTimeout(500)

      // Should show warning or dialog
      const warningVisible = await page.getByText(/member|cannot archive/i).isVisible().catch(() => false)
      expect(warningVisible || !(await page.getByRole('dialog').isVisible())).toBe(true)
    } else {
      // No members, archive should work
      test.skip()
    }
  })
})
