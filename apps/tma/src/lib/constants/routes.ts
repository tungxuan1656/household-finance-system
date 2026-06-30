export const TMA_PATHS = {
  root: '/',
  home: '/home',
  period: '/period',
  statistics: '/statistics',
  expenses: '/expenses',
  expensesFilter: '/expenses/filter',
  expensesNewCategory: '/expenses/new/category',
  expensesNewDetails: '/expenses/new/details',
  expensesNewContext: '/expenses/new/context',
  expensesNewChat: '/expenses/new/chat',
  expensesNewImport: '/expenses/new/import',
  households: '/households',
  householdsNew: '/households/new',
  groups: '/groups',
  groupsNew: '/groups/new',
  budgets: '/budgets',
  budgetsNew: '/budgets/new',
  invitations: '/invitations',
  fatal: '/fatal',
} as const

export const getExpenseDetailPath = (expenseId: string): string =>
  `${TMA_PATHS.expenses}/${expenseId}`

export const getExpenseEditPath = (expenseId: string): string =>
  `${getExpenseDetailPath(expenseId)}/edit`

export const getExpenseEditCategoryPath = (expenseId: string): string =>
  `${getExpenseEditPath(expenseId)}/category`

export const getHouseholdDetailPath = (householdId: string): string =>
  `${TMA_PATHS.households}/${householdId}`

export const getGroupDetailPath = (groupId: string): string =>
  `${TMA_PATHS.groups}/${groupId}`

export const getBudgetDetailPath = (budgetId: string): string =>
  `${TMA_PATHS.budgets}/${budgetId}`

export const getInvitationAcceptPath = (token: string): string =>
  `${TMA_PATHS.invitations}/${token}`

/**
 * Returns `true` when `pathname` follows the expense-edit flow pattern
 * `/expenses/:id/edit` (with or without a trailing sub‑path).
 *
 * When `expenseId` is provided the check is scoped to that specific expense;
 * the pathname must reference the same expense id.  This lets callers
 * distinguish "still inside the same edit flow" from "left the edit flow
 * entirely" – the core distinction needed to decide whether to preserve
 * or discard the edit draft on component unmount.
 */
export const isExpenseEditFlowPathname = (
  pathname: string,
  expenseId?: string,
): boolean => {
  const match = pathname.match(/^\/expenses\/([^/]+)\/edit(?:\/|$)/)
  if (!match) return false
  if (expenseId !== undefined) return match[1] === expenseId

  return true
}
