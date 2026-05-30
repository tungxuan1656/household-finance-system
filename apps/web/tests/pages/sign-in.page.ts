/**
 * Sign-in page object (for documentation - tests skipped)
 * Sign-in tests are skipped because:
 * 1. Requires real Firebase account with verified email
 * 2. Real auth flow involves Firebase UI which is hard to automate
 * 3. Other tests use pre-authenticated state via localStorage
 */

import { type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class SignInPage extends BasePage {
  readonly url = () => '/sign-in'

  readonly emailInput(): ReturnType<Page['locator']> {
    return this.page.locator('[name="email"], [type="email"], input[type="email"]')
  }

  readonly passwordInput(): ReturnType<Page['locator']> {
    return this.page.locator('[name="password"], [type="password"], input[type="password"]')
  }

  readonly submitButton(): ReturnType<Page['locator']> {
    return this.page.getByRole('button', { name: /sign in|login|submit/i })
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.emailInput().fill(email)
    await this.passwordInput().fill(password)
    await this.submitButton().click()
    await this.page.waitForURL('**/home', { timeout: 15000 })
  }
}

export class SignUpPage extends BasePage {
  readonly url = () => '/sign-up'
}
