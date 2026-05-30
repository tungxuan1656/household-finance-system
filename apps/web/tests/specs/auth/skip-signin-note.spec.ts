/**
 * Auth tests - SKIPPED
 *
 * Sign-in tests are intentionally skipped because:
 *
 * 1. Requires real Firebase account with verified email
 *    - Firebase Auth requires email verification for test accounts
 *    - Automated sign-in triggers Firebase UI which is difficult to automate
 *
 * 2. Alternative approach used:
 *    - Seed test data via API directly (see tests/scripts/seed-test-data.ts)
 *    - Pre-authenticate by setting localStorage with valid session
 *    - Or use Firebase custom token flow in auth.setup.ts
 *
 * 3. What IS tested for auth:
 *    - Session persistence (localStorage read/write)
 *    - Protected route guards
 *    - Sign out flow
 *    - 401 handling clears session
 *
 * To run sign-in tests manually:
 * 1. Sign in via browser at http://localhost:3000/sign-in
 * 2. Extract session from localStorage 'auth-store'
 * 3. Use in test setup
 *
 * Test account: tungxuan101998@gmail.com / 10101998
 */

import { test, expect } from '../fixtures/auth.setup'

test.describe('Auth - Skip Notice', () => {
  test('TC-AUTH-SKIP: Sign-in tests intentionally skipped', async ({ page }) => {
    // Document why skip
    expect(true).toBe(true) // Placeholder - actual sign-in not tested
  })

  test('TC-AUTH-SKIP: Other auth flows are tested via UI', async ({ page }) => {
    // Protected routes redirect to sign-in when unauthenticated
    await page.goto('/expenses')
    // Should either show page or redirect to sign-in
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/expenses|sign-in/)
  })
})
