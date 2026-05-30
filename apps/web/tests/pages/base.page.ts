/**
 * Base page object with common functionality
 */

import type { Page, Locator } from '@playwright/test'

export abstract class BasePage {
  constructor(protected page: Page) {}

  abstract url(): string

  async goto(): Promise<void> {
    await this.page.goto(this.url())
    await this.page.waitForLoadState('networkidle')
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'): Promise<void> {
    await this.page.waitForLoadState(state)
  }

  async getByRole(role: 'button' | 'link' | 'heading' | 'textbox', options: { name: string | RegExp }): Promise<Locator> {
    return this.page.getByRole(role, options)
  }

  async click(text: string | RegExp): Promise<void> {
    const locator = typeof text === 'string'
      ? this.page.getByRole('button', { name: text })
      : this.page.getByRole('button', { name: text })
    await locator.click()
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value)
  }

  async isVisible(selector: string): Promise<boolean> {
    return this.page.locator(selector).isVisible()
  }

  async waitForSelector(selector: string, options?: { timeout?: number; state?: 'visible' | 'hidden' }): Promise<void> {
    await this.page.waitForSelector(selector, {
      timeout: options?.timeout ?? 10000,
      state: options?.state ?? 'visible',
    })
  }

  async snapshot(label?: string): Promise<string> {
    if (label) {
      return `Snapshot: ${label}`
    }
    return JSON.stringify(await this.page.content())
  }
}
