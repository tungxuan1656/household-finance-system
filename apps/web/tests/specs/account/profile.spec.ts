/**
 * Account - Profile tests
 *
 * TC-ACC-001: View profile
 * TC-ACC-002: Update display name
 */

import { test, expect } from '../fixtures/auth.setup'
import { AccountPage } from '../pages'

test.describe('Account - Profile', () => {
  let accountPage: AccountPage

  test.beforeEach(async ({ page }) => {
    accountPage = new AccountPage(page)
    await accountPage.goto()
    await page.waitForLoadState('networkidle')
  })

  test('TC-ACC-001: Profile section renders', async ({ page }) => {
    await expect(accountPage.profileSection()).toBeVisible()

    // Avatar should be visible
    const avatar = accountPage.avatarDisplay()
    await expect(avatar.first()).toBeVisible()

    // Display name should have value
    const nameInput = accountPage.displayNameInput()
    await expect(nameInput).toBeVisible()
  })

  test('TC-ACC-002: Update display name', async ({ page }) => {
    // Get current name
    const currentName = await accountPage.displayNameInput().inputValue()

    // Update
    await accountPage.updateDisplayName('Updated Test Name')

    // Verify updated
    const newName = await accountPage.displayNameInput().inputValue()
    expect(newName).toBe('Updated Test Name')
  })
})
