export const PATHS = {
  LANDING: '/',
  // Public routes
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',

  // Protected shell base
  APP_ROOT: '/expenses',
  HOME: '/home',

  // Protected features
  EXPENSES: '/expenses',
  EXPENSE_DETAIL: '/expenses/[id]',
  EDIT_EXPENSE: '/expenses/[id]/edit',
  GROUPS: '/groups',
  BUDGETS: '/budgets',
  INSIGHTS: '/insights',
  HOUSEHOLDS: '/households',
  ACCOUNT: '/account',
  SETTINGS: '/account/settings',
} as const

export const getHouseholdHref = (householdId: string) =>
  `${PATHS.HOUSEHOLDS}/${householdId}`
