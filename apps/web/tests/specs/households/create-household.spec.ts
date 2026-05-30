/**
 * Households - Create tests
 *
 * TC-HH-001: Create household
 */

import { test, expect } from '../fixtures/auth.setup'
import { HouseholdsPage } from '../pages'

test.describe('Households - Create', () => {
  let householdsPage: HouseholdsPage

  test.beforeEach(async ({ page }) => {
    householdsPage = new HouseholdsPage(page)
    await householdsPage.goto()
  })

  test('TC-HH-001: Create household with name', async ({ page }) => {
    await householdsPage.openCreateHouseholdDialog()

    // Fill name
    await page.locator('[data-testid="household-name"], [name="name"]').fill('Test Household')

    // Submit
    await page.getByRole('button', { name: /submit|create|save/i }).click()
    await page.waitForTimeout(1000)

    // Verify in list
    await expect(page.getByText('Test Household')).toBeVisible({ timeout: 10000 })
  })
})
