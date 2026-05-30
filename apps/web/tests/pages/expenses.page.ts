/**
 * Expenses page object
 */

import { Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class ExpensesPage extends BasePage {
  readonly url = () => '/expenses'

  // Selectors
  readonly addExpenseButton(): Locator {
    return this.page.getByRole('button', { name: /add expense|new expense/i })
  }

  readonly expenseList(): Locator {
    return this.page.locator('[data-testid="expense-list"], [data-expense-list], .expense-list')
  }

  readonly expenseItems(): Locator {
    return this.page.locator('[data-testid="expense-item"], [data-expense-item]')
  }

  readonly filterBar(): Locator {
    return this.page.locator('[data-testid="filter-bar"], .filters')
  }

  readonly categoryFilter(): Locator {
    return this.page.locator('[data-testid="category-filter"], [name="category"]')
  }

  readonly dateRangeFilter(): Locator {
    return this.page.locator('[data-testid="date-range-filter"], [name="dateRange"]')
  }

  readonly householdFilter(): Locator {
    return this.page.locator('[data-testid="household-filter"], [name="household"]')
  }

  readonly groupFilter(): Locator {
    return this.page.locator('[data-testid="group-filter"], [name="group"]')
  }

  // Actions
  async openAddExpenseDrawer(): Promise<void> {
    await this.addExpenseButton().click()
    await this.page.waitForSelector('[role="dialog"], [role="presentation"]', { state: 'visible' })
  }

  async filterByCategory(category: string): Promise<void> {
    await this.categoryFilter().click()
    await this.page.getByRole('option', { name: category }).click()
  }

  async filterByHousehold(householdId: string): Promise<void> {
    await this.householdFilter().selectOption(householdId)
  }

  async filterByDateRange(from: Date, to: Date): Promise<void> {
    await this.dateRangeFilter().click()
    // Date picker implementation
  }

  async getExpenseCount(): Promise<number> {
    return this.expenseItems().count()
  }

  async clickExpense(index: number = 0): Promise<void> {
    const items = await this.expenseItems().all()
    if (items[index]) {
      await items[index].click()
    }
  }
}
