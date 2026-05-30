/**
 * Account page object
 */

import { Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

export class AccountPage extends BasePage {
  readonly url = () => '/account'

  // Selectors
  readonly profileSection(): Locator {
    return this.page.locator('[data-testid="profile-section"], .profile-section')
  }

  readonly avatarDisplay(): Locator {
    return this.page.locator('[data-testid="avatar"], .avatar, img[alt="avatar"]')
  }

  readonly displayNameInput(): Locator {
    return this.page.locator('[data-testid="display-name"], [name="displayName"]')
  }

  readonly emailDisplay(): Locator {
    return this.page.locator('[data-testid="email"], .email')
  }

  readonly changePasswordButton(): Locator {
    return this.page.getByRole('button', { name: /change password/i })
  }

  readonly signOutButton(): Locator {
    return this.page.getByRole('button', { name: /sign out|logout/i })
  }

  readonly themeSelector(): Locator {
    return this.page.locator('[data-testid="theme-selector"], [name="theme"]')
  }

  readonly settingsSection(): Locator {
    return this.page.locator('[data-testid="settings-section"], .settings-section')
  }

  // Actions
  async updateDisplayName(name: string): Promise<void> {
    await this.displayNameInput().clear()
    await this.displayNameInput().fill(name)
    await this.page.getByRole('button', { name: /save|update/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async openChangePasswordDialog(): Promise<void> {
    await this.changePasswordButton().click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.openChangePasswordDialog()
    await this.page.locator('[name="currentPassword"], [data-testid="current-password"]').fill(currentPassword)
    await this.page.locator('[name="newPassword"], [data-testid="new-password"]').fill(newPassword)
    await this.page.locator('[name="confirmPassword"], [data-testid="confirm-password"]').fill(newPassword)
    await this.page.getByRole('button', { name: /submit|change|save/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await this.themeSelector().click()
    await this.page.getByRole('option', { name: theme }).click()
    await this.page.waitForTimeout(500)
  }

  async signOut(): Promise<void> {
    await this.signOutButton().click()
    await this.page.getByRole('button', { name: /confirm|sign out/i }).click()
    await this.page.waitForTimeout(1000)
  }

  async getDisplayName(): Promise<string | null> {
    return this.displayNameInput().inputValue()
  }
}
