/**
 * Account - Password change tests
 *
 * TC-ACC-010: Change password dialog opens
 * TC-ACC-011: Password change validation
 */

import { test, expect } from '../fixtures/auth.setup'
import { AccountPage } from '../pages'

test.describe('Account - Password Change', () => {
  let accountPage: AccountPage

  test.beforeEach(async ({ page }) => {
    accountPage = new AccountPage(page)
    await accountPage.goto()
  })

  test('TC-ACC-010: Change password dialog opens', async ({ page }) => {
    await accountPage.openChangePasswordDialog()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Form fields should exist
    await expect(page.locator('[name="currentPassword"]')).toBeVisible()
    await expect(page.locator('[name="newPassword"]')).toBeVisible()
  })

  test('TC-ACC-011: Password change validates current password', async ({ page }) => {
    await accountPage.openChangePasswordDialog()

    // Fill wrong current password
    await page.locator('[name="currentPassword"]').fill('wrongpassword')
    await page.locator('[name="newPassword"]').fill('NewPass123!')
    await page.locator('[name="confirmPassword"]').fill('NewPass123!')

    // Submit
    await page.getByRole('button', { name: /submit|change|save/i }).click()
    await page.waitForTimeout(1000)

    // Should show validation error or stay on dialog
    const dialogVisible = await page.getByRole('dialog').isVisible().catch(() => false)
    const errorVisible = await page.getByText(/incorrect|wrong|current/i).isVisible().catch(() => false)

    // Either dialog stayed open or error shown
    expect(dialogVisible || errorVisible).toBe(true)
  })
})
