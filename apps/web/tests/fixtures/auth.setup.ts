/**
 * Test fixtures for Playwright E2E tests
 * Skip sign-in by using pre-authenticated state via Firebase custom token
 */

import { test as base, type Page } from '@playwright/test'

// Test account - credentials stored in .env.test (gitignored)
export const TEST_ACCOUNTS = {
  primary: {
    email: process.env.TEST_ACCOUNT_EMAIL ?? 'tungxuan101998@gmail.com',
    password: process.env.TEST_ACCOUNT_PASSWORD ?? '10101998',
  },
} as const

export { expect } from '@playwright/test'

// Custom fixture types
export interface AuthenticatedPage extends Page {
  // Add authenticated page methods here if needed
}

// Derive fixtures from Playwright's base
export const test = base.extend<{
  authenticatedPage: Page
}>({
  authenticatedPage: async ({ page }, use) => {
    // Store original localStorage before test
    const localStorageBefore = await page.evaluate(() => {
      const store: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          store[key] = localStorage.getItem(key) ?? ''
        }
      }
      return store
    })

    await use(page)

    // Restore localStorage after test (optional cleanup)
    await page.evaluate((store) => {
      localStorage.clear()
      for (const [key, value] of Object.entries(store)) {
        localStorage.setItem(key, value)
      }
    }, localStorageBefore)
  },
})

// Re-export everything from @playwright/test
export * from '@playwright/test'
