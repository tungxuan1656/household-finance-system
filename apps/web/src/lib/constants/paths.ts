export const PATHS = {
  LANDING: '/',
  // Public routes
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',

  // Protected shell base
  APP_ROOT: '/expenses',
  HOME: '/home',

  // Protected features
  ONBOARDING: '/onboarding',
  EXPENSES: '/expenses',
  EXPENSE_DETAIL: '/expenses/[id]',
  EDIT_EXPENSE: '/expenses/[id]/edit',
  EXPENSE_TRASH: '/expenses/deleted',
  GROUPS: '/groups',
  BUDGETS: '/budgets',
  INSIGHTS: '/insights',
  HOUSEHOLDS: '/households',
  SETTINGS: '/settings',
  ACCOUNT: '/account',
  MORE: '/more',
} as const

export const getHouseholdHref = (householdId: string) =>
  `${PATHS.HOUSEHOLDS}/${householdId}`
