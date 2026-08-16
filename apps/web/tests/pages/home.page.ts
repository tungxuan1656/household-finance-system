/**
 * Home/Dashboard page object
 */

import { Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class HomePage extends BasePage {
  readonly url = () => '/home'

  // Selectors
  heroStatsCard(): Locator {
    return this.page.locator(
      '[data-testid="hero-stats"], .hero-stats, .stats-card',
    )
  }

  recentExpensesSection(): Locator {
    return this.page.locator(
      '[data-testid="recent-expenses"], .recent-expenses',
    )
  }

  categoryStatsSection(): Locator {
    return this.page.locator('[data-testid="category-stats"], .category-stats')
  }

  personalTab(): Locator {
    return this.page.getByRole('tab', { name: /personal/i })
  }

  householdTab(): Locator {
    return this.page.getByRole('tab', { name: /household/i })
  }

  budgetLimitDisplay(): Locator {
    return this.page.locator('[data-testid="budget-limit"], .budget-limit')
  }

  daysRemaining(): Locator {
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

  async getHeroStats(): Promise<{
    spend: string
    budget: string
    daysRemaining: string
  }> {
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
