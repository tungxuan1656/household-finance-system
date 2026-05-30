/**
 * Budgets page object
 */

import { Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class BudgetsPage extends BasePage {
  readonly url = () => '/budgets'

  // Selectors
  readonly createBudgetButton(): Locator {
    return this.page.getByRole('button', { name: /create budget|new budget/i })
  }

  readonly budgetList(): Locator {
    return this.page.locator('[data-testid="budget-list"], .budget-list')
  }

  readonly budgetItems(): Locator {
    return this.page.locator('[data-testid="budget-item"], .budget-item')
  }

  readonly budgetStatusPanel(): Locator {
    return this.page.locator('[data-testid="budget-status-panel"], .budget-status')
  }

  readonly periodSelector(): Locator {
    return this.page.locator('[data-testid="period-selector"], [name="period"]')
  }

  readonly totalLimitInput(): Locator {
    return this.page.locator('[data-testid="total-limit"], [name="totalLimit"]')
  }

  readonly categoryLimitsSection(): Locator {
    return this.page.locator('[data-testid="category-limits"], .category-limits')
  }

  // Actions
  async openCreateBudgetDialog(): Promise<void> {
    await this.createBudgetButton().click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  async setPeriod(period: string): Promise<void> {
    await this.periodSelector().fill(period)
  }

  async setTotalLimit(amount: number): Promise<void> {
    await this.totalLimitInput().fill(amount.toString())
  }

  async addCategoryLimit(categoryKey: string, limit: number): Promise<void> {
    // Click add category limit button
    await this.page.getByRole('button', { name: /add category|add limit/i }).click()
    // Select category
    await this.page.getByRole('combobox').first().click()
    await this.page.getByRole('option', { name: categoryKey }).click()
    // Enter limit
    await this.page.locator('input[type="number"]').last().fill(limit.toString())
  }

  async submitBudget(): Promise<void> {
    await this.page.getByRole('button', { name: /submit|save|create/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async getBudgetCount(): Promise<number> {
    return this.budgetItems().count()
  }
}
