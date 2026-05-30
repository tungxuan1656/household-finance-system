/**
 * Groups - Create tests
 *
 * TC-GRP-001: Create group with all fields
 * TC-GRP-002: Create group with minimal fields
 */

import { test, expect } from '../fixtures/auth.setup'
import { GroupsPage } from '../pages'

test.describe('Groups - Create', () => {
  let groupsPage: GroupsPage

  test.beforeEach(async ({ page }) => {
    groupsPage = new GroupsPage(page)
    await groupsPage.goto()
  })

  test('TC-GRP-001: Create group with all fields', async ({ page }) => {
    await groupsPage.openCreateGroupDialog()

    // Fill form
    await groupsPage.fillGroupForm({
      name: 'Weekend Trip',
      description: 'Trip expenses budget',
      budget: 5000000,
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    })

    // Submit
    await page.getByRole('button', { name: /submit|create|save/i }).click()
    await page.waitForTimeout(1000)

    // Verify group appears in list
    await expect(page.getByText('Weekend Trip')).toBeVisible({ timeout: 10000 })
  })

  test('TC-GRP-002: Create group with minimal fields', async ({ page }) => {
    await groupsPage.openCreateGroupDialog()

    await groupsPage.fillGroupForm({
      name: `Minimal Group ${Date.now()}`,
    })

    await page.getByRole('button', { name: /submit|create|save/i }).click()
    await page.waitForTimeout(1000)

    await expect(page.getByText(/Minimal Group/)).toBeVisible({ timeout: 10000 })
  })
})
