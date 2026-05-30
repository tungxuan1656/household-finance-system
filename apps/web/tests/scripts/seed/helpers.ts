/**
 * Seed script API helpers and entity creation
 */

import { API_ENDPOINTS } from '../../../../src/api/endpoints'
import { API_BASE, CATEGORIES, SOURCES, getAccessToken } from './types'
import type { CreateExpenseRequest, CreateBudgetRequest, CreateExpenseGroupRequest } from './types'

// ============================================================
// API HELPERS (bypass axios interceptor for seeding)
// ============================================================

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(body),
  })
  const json = await response.json()
  if (!response.ok) {
    throw new Error(`API POST ${path} failed: ${response.status} ${JSON.stringify(json)}`)
  }
  return json.data ?? json
}

export async function apiDelete(path: string): Promise<void> {
  await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  })
}

// ============================================================
// EXPENSE HELPERS
// ============================================================

export async function createExpense(data: Partial<CreateExpenseRequest>): Promise<string> {
  const payload: CreateExpenseRequest = {
    amount: data.amount ?? Math.floor(Math.random() * 500000) + 10000,
    categoryKey: data.categoryKey ?? CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    sourceKey: data.sourceKey ?? SOURCES[Math.floor(Math.random() * SOURCES.length)],
    title: data.title ?? 'Test expense',
    occurredAt: data.occurredAt ?? Date.now(),
    note: data.note,
    householdId: data.householdId,
    groupIds: data.groupIds,
  }
  const result = await apiPost<{ id: string }>(API_ENDPOINTS.expenses.create, payload)
  return result.id
}

export async function deleteExpense(id: string): Promise<void> {
  await apiDelete(API_ENDPOINTS.expenses.detail(id))
}

// ============================================================
// BUDGET HELPERS
// ============================================================

export async function createBudget(data: Partial<CreateBudgetRequest>): Promise<string> {
  const payload: CreateBudgetRequest = {
    householdId: data.householdId ?? '',
    period: data.period ?? '2026-06',
    totalLimit: data.totalLimit ?? 10000000,
    categoryLimits: data.categoryLimits,
  }
  const result = await apiPost<{ id: string }>(API_ENDPOINTS.budgets.create, payload)
  return result.id
}

// ============================================================
// GROUP HELPERS
// ============================================================

export async function createGroup(data: Partial<CreateExpenseGroupRequest>): Promise<string> {
  const payload: CreateExpenseGroupRequest = {
    name: data.name ?? 'Test Group',
    description: data.description,
    householdId: data.householdId,
    startDate: data.startDate,
    endDate: data.endDate,
    eventBudget: data.eventBudget,
  }
  const result = await apiPost<{ id: string }>(API_ENDPOINTS.groups.create, payload)
  return result.id
}

// ============================================================
// HOUSEHOLD HELPERS
// ============================================================

export async function createHousehold(name: string): Promise<string> {
  const response = await fetch(`${API_BASE}/households`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ name }),
  })
  const json = await response.json()
  if (!response.ok) {
    throw new Error(`Create household failed: ${response.status} ${JSON.stringify(json)}`)
  }
  return (json.data ?? json).id
}

// ============================================================
// GET HOUSEHOLD ID
// ============================================================

export async function getFirstHouseholdId(): Promise<string | null> {
  const response = await fetch(`${API_BASE}${API_ENDPOINTS.households.list}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  })
  const data = await response.json()
  return data.data?.items?.[0]?.id ?? null
}