/**
 * Shared test helpers for Playwright E2E tests
 */

import type { Page } from '@playwright/test'

// ============================================================
// WAIT HELPERS
// ============================================================

export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' },
) {
  await page.waitForSelector(selector, {
    timeout: options?.timeout ?? 10000,
    state: options?.state ?? 'visible',
  })
}

export async function waitForElements(page: Page, selector: string) {
  return page.locator(selector).waitFor()
}

// ============================================================
// FORM HELPERS
// ============================================================

export async function fillFormField(page: Page, selector: string, value: string) {
  await page.fill(selector, value)
}

export async function selectFormOption(page: Page, selector: string, value: string) {
  await page.selectOption(selector, value)
}

export async function clickButton(page: Page, text: string | RegExp) {
  await page.getByRole('button', { name: text }).click()
}

// ============================================================
// DIALOG/DRAWER HELPERS
// ============================================================

export async function openDrawer(page: Page, drawerTriggerSelector: string) {
  await page.click(drawerTriggerSelector)
  await waitForElement(page, '[role="dialog"], [role="presentation"]', { state: 'visible' })
}

export async function closeDrawer(page: Page) {
  // Press Escape or click outside
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
}

// ============================================================
// DATA HELPERS
// ============================================================

export function generateRandomAmount(min: number = 10000, max: number = 500000) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateRandomDate(daysAgo: number = 30) {
  const now = Date.now()
  const msPerDay = 24 * 60 * 60 * 1000
  return now - Math.floor(Math.random() * daysAgo * msPerDay)
}

export function formatDateForInput(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toISOString().split('T')[0]
}

// ============================================================
// ASSERTION HELPERS
// ============================================================

export async function assertTextVisible(page: Page, text: string | RegExp) {
  const locator = typeof text === 'string'
    ? page.getByText(text)
    : page.getByText(text)
  await expect(locator).toBeVisible()
}

export async function assertElementVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible()
}

export async function assertElementHidden(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeHidden()
}

// ============================================================
// NAVIGATION HELPERS
// ============================================================

export async function navigateTo(page: Page, path: string, baseUrl?: string) {
  const url = baseUrl ? `${baseUrl}${path}` : path
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle')
}
