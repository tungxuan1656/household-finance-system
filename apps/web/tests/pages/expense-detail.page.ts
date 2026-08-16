/**
 * Expense detail page object
 */

import { Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class ExpenseDetailPage extends BasePage {
  constructor(page: Page, expenseId?: string) {
    super(page)
    this._expenseId = expenseId
  }

  private _expenseId?: string

  readonly url = () => `/expenses/${this._expenseId ?? '[:id]'}/`

  // Selectors
  expenseTitle(): Locator {
    return this.page.locator(
      '[data-testid="expense-title"], .expense-title, h1',
    )
  }

  expenseAmount(): Locator {
    return this.page.locator('[data-testid="expense-amount"], .expense-amount')
  }

  expenseCategory(): Locator {
    return this.page.locator(
      '[data-testid="expense-category"], .expense-category',
    )
  }

  expenseSource(): Locator {
    return this.page.locator('[data-testid="expense-source"], .expense-source')
  }

  expenseDate(): Locator {
    return this.page.locator('[data-testid="expense-date"], .expense-date')
  }

  expenseNote(): Locator {
    return this.page.locator('[data-testid="expense-note"], .expense-note')
  }

  editButton(): Locator {
    return this.page.getByRole('button', { name: /edit/i })
  }

  deleteButton(): Locator {
    return this.page.getByRole('button', { name: /delete/i })
  }

  backButton(): Locator {
    return this.page.getByRole('button', { name: /back|back to list/i })
  }

  // Actions
  async clickEdit(): Promise<void> {
    await this.editButton().click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  async clickDelete(): Promise<void> {
    await this.deleteButton().click()
    await this.page.getByRole('button', { name: /confirm|delete/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async clickBack(): Promise<void> {
    await this.backButton().click()
  }

  async getExpenseData(): Promise<{
    title: string
    amount: string
    category: string
    source: string
    date: string
    note: string | null
  }> {
    return {
      title: (await this.expenseTitle().textContent()) ?? '',
      amount: (await this.expenseAmount().textContent()) ?? '',
      category: (await this.expenseCategory().textContent()) ?? '',
      source: (await this.expenseSource().textContent()) ?? '',
      date: (await this.expenseDate().textContent()) ?? '',
      note: (await this.expenseNote().isVisible())
        ? await this.expenseNote().textContent()
        : null,
    }
  }
}
