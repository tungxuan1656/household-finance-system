/**
 * Account - Theme toggle tests
 *
 * TC-ACC-020: Theme switcher visible
 * TC-ACC-021: Switch to light theme
 * TC-ACC-022: Switch to dark theme
 * TC-ACC-023: Switch to system theme
 */

import { test, expect } from '../fixtures/auth.setup'
import { AccountPage } from '../pages'

test.describe('Account - Theme Toggle', () => {
  let accountPage: AccountPage

  test.beforeEach(async ({ page }) => {
    accountPage = new AccountPage(page)
    await accountPage.goto()
  })

  test('TC-ACC-020: Theme selector visible', async ({ page }) => {
    await expect(accountPage.themeSelector().first()).toBeVisible()
  })

  test('TC-ACC-021: Switch to light theme', async ({ page }) => {
    await accountPage.setTheme('light')
    await page.waitForTimeout(500)

    // LocalStorage should have light theme
    const theme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(theme).toBe('light')
  })

  test('TC-ACC-022: Switch to dark theme', async ({ page }) => {
    await accountPage.setTheme('dark')
    await page.waitForTimeout(500)

    const theme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(theme).toBe('dark')
  })

  test('TC-ACC-023: Switch to system theme', async ({ page }) => {
    await accountPage.setTheme('system')
    await page.waitForTimeout(500)

    const theme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(theme).toBe('system')
  })
})
