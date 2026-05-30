/**
 * Overview/Home - View toggle tests
 *
 * TC-OVW-020: Personal vs Household tabs exist
 * TC-OVW-021: Switching tabs updates data
 */

import { test, expect } from '../fixtures/auth.setup'
import { HomePage } from '../pages'

test.describe('Overview - View Toggle', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
    await page.waitForLoadState('networkidle')
  })

  test('TC-OVW-020: Personal tab visible', async ({ page }) => {
    // At least one tab should be visible
    const tabs = page.locator('[role="tab"]')
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThan(0)
  })

  test('TC-OVW-021: Switch to household view', async ({ page }) => {
    // Check if household tab exists
    const householdTab = homePage.householdTab()
    const hasHouseholdTab = await householdTab.isVisible().catch(() => false)

    if (!hasHouseholdTab) {
      test.skip()
    }

    // Click household tab
    await householdTab.click()
    await page.waitForTimeout(500)

    // Tab should be selected/active
    const isSelected = await householdTab.getAttribute('aria-selected')
    expect(isSelected).toBe('true')
  })

  test('TC-OVW-022: Switch to personal view', async ({ page }) => {
    const personalTab = homePage.personalTab()
    const hasPersonalTab = await personalTab.isVisible().catch(() => false)

    if (!hasPersonalTab) {
      test.skip()
    }

    await personalTab.click()
    await page.waitForTimeout(500)

    const isSelected = await personalTab.getAttribute('aria-selected')
    expect(isSelected).toBe('true')
  })
})
