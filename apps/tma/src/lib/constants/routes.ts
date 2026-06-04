export const TMA_PATHS = {
  root: '/',
  home: '/home',
  statistics: '/statistics',
  expenses: '/expenses',
  expensesNewCategory: '/expenses/new/category',
  expensesNewDetails: '/expenses/new/details',
  expensesNewContext: '/expenses/new/context',
  households: '/households',
  fatal: '/fatal',
} as const

export const getHouseholdDetailPath = (householdId: string): string =>
  `${TMA_PATHS.households}/${householdId}`
