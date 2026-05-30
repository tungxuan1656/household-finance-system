/**
 * Home/Dashboard page object
 */

import { Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class HomePage extends BasePage {
  readonly url = () => '/home'

  // Selectors
  readonly heroStatsCard(): Locator {
    return this.page.locator('[data-testid="hero-stats"], .hero-stats, .stats-card')
  }

  readonly recentExpensesSection(): Locator {
    return this.page.locator('[data-testid="recent-expenses"], .recent-expenses')
  }

  readonly categoryStatsSection(): Locator {
    return this.page.locator('[data-testid="category-stats"], .category-stats')
  }

  readonly personalTab(): Locator {
    return this.page.getByRole('tab', { name: /personal/i })
  }

  readonly householdTab(): Locator {
    return this.page.getByRole('tab', { name: /household/i })
  }

  readonly budgetLimitDisplay(): Locator {
    return this.page.locator('[data-testid="budget-limit"], .budget-limit')
  }

  readonly daysRemaining(): Locator {
    return this.page.locator('[data-testid="days-remaining"], .days-remaining')
  }

  // Actions
  async switchToPersonalView(): Promise<void> {
    await this.personalTab().click()
    await this.page.waitForTimeout(500)
  }

  async switchToHouseholdView(): Promise<void> {
    await this.householdTab().click()
    await this.page.waitForTimeout(500)
  }

  async getHeroStats(): Promise<{ spend: string; budget: string; daysRemaining: string }> {
    const stats: Record<string, string> = {}
    const heroText = await this.heroStatsCard().textContent()
    // Parse stats from text content
    return {
      spend: stats['spend'] ?? '0',
      budget: stats['budget'] ?? '0',
      daysRemaining: stats['daysRemaining'] ?? '0',
    }
  }
}

export class DashboardPage extends HomePage {
  // Alias for HomePage
}
