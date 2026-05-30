/**
 * Groups page object
 */

import { Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class GroupsPage extends BasePage {
  readonly url = () => '/groups'

  // Selectors
  readonly createGroupButton(): Locator {
    return this.page.getByRole('button', { name: /create group|new group/i })
  }

  readonly groupList(): Locator {
    return this.page.locator('[data-testid="group-list"], .group-list')
  }

  readonly groupItems(): Locator {
    return this.page.locator('[data-testid="group-item"], .group-item')
  }

  readonly groupNameInput(): Locator {
    return this.page.locator('[name="name"], [data-testid="group-name"]')
  }

  readonly groupDescriptionInput(): Locator {
    return this.page.locator('[name="description"], [data-testid="group-description"]')
  }

  readonly groupBudgetInput(): Locator {
    return this.page.locator('[name="eventBudget"], [data-testid="group-budget"]')
  }

  readonly startDateInput(): Locator {
    return this.page.locator('[name="startDate"], [data-testid="start-date"]')
  }

  readonly endDateInput(): Locator {
    return this.page.locator('[name="endDate"], [data-testid="end-date"]')
  }

  readonly archiveButton(): Locator {
    return this.page.getByRole('button', { name: /archive/i })
  }

  // Actions
  async openCreateGroupDialog(): Promise<void> {
    await this.createGroupButton().click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  async fillGroupForm(data: { name: string; description?: string; budget?: number; startDate?: string; endDate?: string }): Promise<void> {
    await this.groupNameInput().fill(data.name)
    if (data.description) {
      await this.groupDescriptionInput().fill(data.description)
    }
    if (data.budget) {
      await this.groupBudgetInput().fill(data.budget.toString())
    }
    if (data.startDate) {
      await this.startDateInput().fill(data.startDate)
    }
    if (data.endDate) {
      await this.endDateInput().fill(data.endDate)
    }
  }

  async submitGroup(): Promise<void> {
    await this.page.getByRole('button', { name: /submit|save|create/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async archiveGroup(groupName: string): Promise<void> {
    const groupItem = this.page.locator('.group-item', { hasText: groupName })
    await groupItem.locator('[aria-label="archive"], [data-testid="archive-btn"]').click()
    // Confirm dialog
    await this.page.getByRole('button', { name: /confirm|archive/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async getGroupCount(): Promise<number> {
    return this.groupItems().count()
  }
}
