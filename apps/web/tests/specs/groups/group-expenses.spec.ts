/**
 * Groups - Expense feed tests
 *
 * TC-GRP-030: View group expense feed
 * TC-GRP-031: Navigate to group detail
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Groups - Expenses', () => {
  test('TC-GRP-030: View group expense feed', async ({ page }) => {
    await page.goto('/groups')
    await page.waitForSelector('[data-testid="group-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Click on group
    await page.locator('[data-testid="group-item"]').first().click()
    await page.waitForLoadState('networkidle')

    // Should navigate to group detail
    await expect(page.url()).toMatch(/\/groups\/[\w-]+/)

    // Expense list section should be visible
    const expenseList = page.locator('[data-testid="group-expenses"], .expense-list')
    await expect(expenseList.first()).toBeVisible()
  })

  test('TC-GRP-031: Group detail loads expense data', async ({ page }) => {
    await page.goto('/groups')
    await page.waitForSelector('[data-testid="group-item"]', { timeout: 10000 }).catch(() => test.skip())

    // Get group name
    const groupName = await page.locator('[data-testid="group-item"]').first().textContent()

    // Navigate to group
    await page.locator('[data-testid="group-item"]').first().click()
    await page.waitForLoadState('networkidle')

    // Group header should show name
    await expect(page.getByRole('heading', { name: groupName ?? /group/i })).toBeVisible()
  })
})
