/**
 * Households page object
 */

import { Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class HouseholdsPage extends BasePage {
  readonly url = () => '/households'

  // Selectors
  createHouseholdButton(): Locator {
    return this.page.getByRole('button', {
      name: /create household|new household/i,
    })
  }

  householdList(): Locator {
    return this.page.locator('[data-testid="household-list"], .household-list')
  }

  householdItems(): Locator {
    return this.page.locator('[data-testid="household-item"], .household-item')
  }

  inviteMemberButton(): Locator {
    return this.page.getByRole('button', { name: /invite member/i })
  }

  removeMemberButton(): Locator {
    return this.page.getByRole('button', { name: /remove member/i })
  }

  leaveHouseholdButton(): Locator {
    return this.page.getByRole('button', { name: /leave household/i })
  }

  archiveHouseholdButton(): Locator {
    return this.page.getByRole('button', { name: /archive household/i })
  }

  memberList(): Locator {
    return this.page.locator('[data-testid="member-list"], .member-list')
  }

  settingsCard(): Locator {
    return this.page.locator(
      '[data-testid="household-settings"], .settings-card',
    )
  }

  // Actions
  async openCreateHouseholdDialog(): Promise<void> {
    await this.createHouseholdButton().click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  async createHousehold(name: string): Promise<void> {
    await this.openCreateHouseholdDialog()
    await this.page
      .locator('[data-testid="household-name"], [name="name"]')
      .fill(name)
    await this.page.getByRole('button', { name: /submit|save|create/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async clickHouseholdCard(householdName: string): Promise<void> {
    const card = this.householdItems()
      .filter({ hasText: householdName })
      .first()
    await card.click()
    await this.page.waitForLoadState('networkidle')
  }

  async inviteMember(): Promise<void> {
    await this.inviteMemberButton().click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
    // Generate link and copy
    await this.page
      .getByRole('button', { name: /generate|crate invite/i })
      .click()
    await this.page.waitForTimeout(500)
  }

  async removeMember(memberName: string): Promise<void> {
    const memberItem = this.memberList().locator('.member-item', {
      hasText: memberName,
    })
    await memberItem.locator('[aria-label="remove"], button').click()
    await this.page.getByRole('button', { name: /confirm|remove/i }).click()
    await this.page.waitForTimeout(500)
  }

  async leaveHousehold(): Promise<void> {
    await this.leaveHouseholdButton().click()
    await this.page.getByRole('button', { name: /confirm|leave/i }).click()
    await this.page.waitForTimeout(500)
  }

  async archiveHousehold(): Promise<void> {
    await this.archiveHouseholdButton().click()
    await this.page.getByRole('button', { name: /confirm|archive/i }).click()
    await this.page.waitForTimeout(500)
  }

  async getHouseholdCount(): Promise<number> {
    return this.householdItems().count()
  }
}
