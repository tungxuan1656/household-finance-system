/**
 * Seed script types and constants
 */

import type { CategoryKey, SourceKey } from '../../src/types/reference-data'
import type { CreateExpenseRequest } from '../../src/features/expenses/types/expense'
import type { CreateBudgetRequest } from '../../src/features/budgets/types/budget'
import type { CreateExpenseGroupRequest } from '../../src/features/groups/types/group'
import type { CreateHouseholdRequest } from '../../src/features/households/types/household'

// Test account credentials
export const TEST_EMAIL = process.env.TEST_ACCOUNT_EMAIL ?? 'tungxuan101998@gmail.com'
export const TEST_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD ?? '10101998'

// API base URL (Cloudflare Workers default port)
export const API_BASE = 'http://localhost:8787/api/v1'

// Categories and sources for test data
export const CATEGORIES: CategoryKey[] = [
  'food',
  'transport',
  'shopping',
  'health',
  'social',
  'education',
  'travel',
  'other',
]
export const SOURCES: SourceKey[] = ['cash', 'card', 'bank-transfer', 'other']

// Track created entities for cleanup
export interface CreatedIds {
  expenses: string[]
  budgets: string[]
  groups: string[]
  households: string[]
}

export const createdIds: CreatedIds = {
  expenses: [],
  budgets: [],
  groups: [],
  households: [],
}

// Global access token
let _accessToken = ''
export const getAccessToken = () => _accessToken
export const setAccessToken = (token: string) => { _accessToken = token }

// Request types
export type { CreateExpenseRequest, CreateBudgetRequest, CreateExpenseGroupRequest, CreateHouseholdRequest }