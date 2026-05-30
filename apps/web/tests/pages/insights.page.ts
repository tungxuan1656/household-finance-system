/**
 * Insights page object
 */

import { Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class InsightsPage extends BasePage {
  readonly url = () => '/insights'

  // Selectors
  readonly overviewPanel(): Locator {
    return this.page.locator('[data-testid="insights-overview"], .overview-panel')
  }

  readonly chartsSection(): Locator {
    return this.page.locator('[data-testid="insights-charts"], .charts-section')
  }

  readonly comparisonPanel(): Locator {
    return this.page.locator('[data-testid="comparison-panel"], .comparison-panel')
  }

  readonly groupsPanel(): Locator {
    return this.page.locator('[data-testid="groups-panel"], .groups-panel')
  }

  readonly periodSelector(): Locator {
    return this.page.locator('[data-testid="period-selector"], [name="period"]')
  }

  readonly householdSelector(): Locator {
    return this.page.locator('[data-testid="household-selector"], [name="household"]')
  }

  readonly exportButton(): Locator {
    return this.page.getByRole('button', { name: /export/i })
  }

  readonly weekOption(): Locator {
    return this.page.getByRole('option', { name: /week/i })
  }

  readonly monthOption(): Locator {
    return this.page.getByRole('option', { name: /month/i })
  }

  readonly quarterOption(): Locator {
    return this.page.getByRole('option', { name: /quarter/i })
  }

  readonly yearOption(): Locator {
    return this.page.getByRole('option', { name: /year/i })
  }

  readonly emptyState(): Locator {
    return this.page.locator('[data-testid="empty-state"], .empty-state, [data-testid="no-data"]')
  }

  // Actions
  async selectPeriod(period: 'week' | 'month' | 'quarter' | 'year'): Promise<void> {
    await this.periodSelector().click()
    switch (period) {
      case 'week':
        await this.weekOption().click()
        break
      case 'month':
        await this.monthOption().click()
        break
      case 'quarter':
        await this.quarterOption().click()
        break
      case 'year':
        await this.yearOption().click()
        break
    }
    await this.page.waitForTimeout(1000) // Wait for data to load
  }

  async selectHousehold(householdId: string): Promise<void> {
    await this.householdSelector().selectOption(householdId)
    await this.page.waitForTimeout(1000)
  }

  async clickExport(): Promise<void> {
    await this.exportButton().click()
    await this.page.waitForTimeout(1000)
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.emptyState().isVisible()
  }

  async getChartData(): Promise<unknown> {
    // Get chart SVG data
    const chart = this.page.locator('.recharts-wrapper, [data-testid="chart"]')
    if (await chart.isVisible()) {
      return await chart.textContent()
    }
    return null
  }

  async getComparisonData(): Promise<{ current: string; previous: string; delta: string }> {
    const panel = this.comparisonPanel()
    const text = await panel.textContent()
    // Parse comparison data from text
    return {
      current: '',
      previous: '',
      delta: '',
    }
  }
}
