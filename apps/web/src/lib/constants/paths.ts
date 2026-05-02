export const PATHS = {
  LANDING: '/',
  // Public routes
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',

  // Protected shell base
  APP_ROOT: '/home',

  // Protected features
  ONBOARDING: '/onboarding',
  EXPENSES: '/expenses',
  ADD_EXPENSE: '/expenses/new',
  EXPENSE_DETAIL: '/expenses/[id]',
  BUDGETS: '/budgets',
  INSIGHTS: '/insights',
  HOUSEHOLDS: '/households',
  SETTINGS: '/settings',
  MORE: '/more',
} as const
