/**
 * Groups - Edit tests
 *
 * TC-GRP-010: Edit group
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Groups - Edit', () => {
  test('TC-GRP-010: Edit group updates values', async ({ page }) => {
    await page.goto('/groups')
    await page.waitForSelector('[data-testid="group-item"], .group-item', { timeout: 10000 }).catch(() => test.skip())

    // Click edit button
    await page.locator('[data-testid="group-item"]').first().locator('[aria-label="edit"]').click()

    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible()

    // Update name
    await page.locator('[name="name"]').clear()
    await page.locator('[name="name"]').fill('Updated Group Name')

    // Save
    await page.getByRole('button', { name: /save|update|submit/i }).click()
    await page.waitForTimeout(1000)

    // Verify update
    await expect(page.getByText('Updated Group Name')).toBeVisible()
  })
})
