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
  households: '/households',
  householdsNew: '/households/new',
  groups: '/groups',
  groupsNew: '/groups/new',
  budgets: '/budgets',
  budgetsNew: '/budgets/new',
  fatal: '/fatal',
} as const

export const getExpenseDetailPath = (expenseId: string): string =>
  `${TMA_PATHS.expenses}/${expenseId}`

export const getExpenseEditPath = (expenseId: string): string =>
  `${getExpenseDetailPath(expenseId)}/edit`

export const getExpenseEditCategoryPath = (expenseId: string): string =>
  `${getExpenseEditPath(expenseId)}/category`

export const getExpenseEditSourcePath = (expenseId: string): string =>
  `${getExpenseEditPath(expenseId)}/source`

export const getExpenseEditHouseholdPath = (expenseId: string): string =>
  `${getExpenseEditPath(expenseId)}/household`

export const getHouseholdDetailPath = (householdId: string): string =>
  `${TMA_PATHS.households}/${householdId}`

export const getGroupDetailPath = (groupId: string): string =>
  `${TMA_PATHS.groups}/${groupId}`

export const getBudgetDetailPath = (budgetId: string): string =>
  `${TMA_PATHS.budgets}/${budgetId}`
