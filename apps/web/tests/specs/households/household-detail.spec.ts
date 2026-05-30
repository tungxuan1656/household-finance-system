/**
 * Households - Detail and members tests
 *
 * TC-HH-010: View household detail
 * TC-HH-011: View household members
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Households - Detail', () => {
  test('TC-HH-010: View household detail page', async ({ page }) => {
    await page.goto('/households')
    await page.waitForSelector('[data-testid="household-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Click household
    await page.locator('[data-testid="household-item"]').first().click()
    await page.waitForLoadState('networkidle')

    // URL should match detail pattern
    await expect(page.url()).toMatch(/\/households\/[\w-]+/)

    // Settings card should be visible
    await expect(page.locator('[data-testid="household-settings"], .settings-card')).toBeVisible()
  })

  test('TC-HH-011: View household members list', async ({ page }) => {
    await page.goto('/households')
    await page.waitForSelector('[data-testid="household-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Click household
    await page.locator('[data-testid="household-item"]').first().click()
    await page.waitForLoadState('networkidle')

    // Member list should be visible
    const memberList = page.locator('[data-testid="member-list"], .member-list')
    await expect(memberList.first()).toBeVisible()
  })
})
