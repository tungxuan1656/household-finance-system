import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { LoadingFallback } from '@/components/shared/loading-fallback'
import {
  RootErrorElement,
  RouteErrorBoundary,
} from '@/components/shared/route-error-boundary'
import { TMA_PATHS } from '@/lib/constants/routes'

import RootLayout from './root-layout'

const HomePage = lazy(async () => {
  const module = await import('@/routes/home')

  return { default: module.HomePage }
})

const StatisticsPage = lazy(async () => {
  const module = await import('@/routes/statistics')

  return { default: module.StatisticsPage }
})

const ExpensesPage = lazy(async () => {
  const module = await import('@/routes/expenses')

  return { default: module.ExpensesPage }
})

const ExpenseDetailPage = lazy(async () => {
  const module = await import('@/routes/expense-detail')

  return { default: module.ExpenseDetailPage }
})

const ExpenseFilterPage = lazy(async () => {
  const module = await import('@/features/expenses/pages/expense-filter-page')

  return { default: module.ExpenseFilterPage }
})

const ExpenseEditPage = lazy(async () => {
  const module = await import('@/routes/expense-edit')

  return { default: module.ExpenseEditPage }
})

const ExpenseEditCategoryPage = lazy(async () => {
  const module = await import('@/routes/expense-edit-category')

  return { default: module.ExpenseEditCategoryPage }
})

const AddExpenseCategoryPage = lazy(async () => {
  const module = await import('@/routes/add-expense-category')

  return { default: module.AddExpenseCategoryPage }
})

const AddExpenseDetailsPage = lazy(async () => {
  const module = await import('@/routes/add-expense-details')

  return { default: module.AddExpenseDetailsPage }
})

const AddExpenseContextPage = lazy(async () => {
  const module = await import('@/routes/add-expense-context')

  return { default: module.AddExpenseContextPage }
})

const AddExpenseChatPage = lazy(async () => {
  const module = await import('@/routes/add-expense-chat')

  return { default: module.AddExpenseChatPage }
})

const AddExpenseImportPreviewPage = lazy(async () => {
  const module = await import('@/routes/add-expense-import-preview')

  return { default: module.AddExpenseImportPreviewPage }
})

const HouseholdsPage = lazy(async () => {
  const module = await import('@/features/households/pages/household-list-page')

  return { default: module.HouseholdListPage }
})

const GroupsPage = lazy(async () => {
  const module = await import('@/features/groups/pages/group-list-page')

  return { default: module.GroupListPage }
})

const BudgetsPage = lazy(async () => {
  const module = await import('@/features/budgets/pages/budget-list-page')

  return { default: module.BudgetListPage }
})

const PeriodRoute = lazy(async () => {
  const module = await import('@/features/period/pages/period-picker-page')

  return { default: module.PeriodPickerPage }
})

const CreateHouseholdRoute = lazy(async () => {
  const module =
    await import('@/features/households/pages/create-household-page')

  return { default: module.CreateHouseholdPage }
})

const HouseholdDetailRoute = lazy(async () => {
  const module =
    await import('@/features/households/pages/household-detail-page')

  return { default: module.HouseholdDetailPage }
})

const AcceptInvitationRoute = lazy(async () => {
  const module =
    await import('@/features/invitations/pages/accept-invitation-page')

  return { default: module.AcceptInvitationPage }
})

const CreateGroupRoute = lazy(async () => {
  const module = await import('@/features/groups/pages/create-group-page')

  return { default: module.CreateGroupPage }
})

const GroupDetailRoute = lazy(async () => {
  const module = await import('@/features/groups/pages/group-detail-page')

  return { default: module.GroupDetailPage }
})

const CreateBudgetRoute = lazy(async () => {
  const module = await import('@/features/budgets/pages/create-budget-page')

  return { default: module.CreateBudgetPage }
})

const BudgetDetailRoute = lazy(async () => {
  const module = await import('@/features/budgets/pages/budget-detail-page')

  return { default: module.BudgetDetailPage }
})

const FatalLaunchPage = lazy(async () => {
  const module = await import('@/routes/fatal-launch')

  return { default: module.FatalLaunchPage }
})

const renderLazyRoute = (Component: React.ComponentType) => (
  <RouteErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  </RouteErrorBoundary>
)

const router = createBrowserRouter([
  {
    path: TMA_PATHS.root,
    errorElement: <RootErrorElement />,
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: renderLazyRoute(HomePage),
      },
      {
        path: TMA_PATHS.period,
        element: renderLazyRoute(PeriodRoute),
      },
      {
        path: TMA_PATHS.statistics,
        element: renderLazyRoute(StatisticsPage),
      },
      {
        path: TMA_PATHS.expenses,
        element: renderLazyRoute(ExpensesPage),
      },
      {
        path: `${TMA_PATHS.expenses}/:id`,
        element: renderLazyRoute(ExpenseDetailPage),
      },
      {
        path: TMA_PATHS.expensesFilter,
        element: renderLazyRoute(ExpenseFilterPage),
      },
      {
        path: `${TMA_PATHS.expenses}/:id/edit`,
        element: renderLazyRoute(ExpenseEditPage),
      },
      {
        path: `${TMA_PATHS.expenses}/:id/edit/category`,
        element: renderLazyRoute(ExpenseEditCategoryPage),
      },
      {
        path: TMA_PATHS.expensesNewCategory,
        element: renderLazyRoute(AddExpenseCategoryPage),
      },
      {
        path: TMA_PATHS.expensesNewDetails,
        element: renderLazyRoute(AddExpenseDetailsPage),
      },
      {
        path: TMA_PATHS.expensesNewContext,
        element: renderLazyRoute(AddExpenseContextPage),
      },
      {
        path: TMA_PATHS.expensesNewChat,
        element: renderLazyRoute(AddExpenseChatPage),
      },
      {
        path: TMA_PATHS.expensesNewImport,
        element: renderLazyRoute(AddExpenseImportPreviewPage),
      },
      {
        path: TMA_PATHS.households,
        element: renderLazyRoute(HouseholdsPage),
      },
      {
        path: TMA_PATHS.householdsNew,
        element: renderLazyRoute(CreateHouseholdRoute),
      },
      {
        path: `${TMA_PATHS.households}/:id`,
        element: renderLazyRoute(HouseholdDetailRoute),
      },
      {
        path: `${TMA_PATHS.invitations}/:token`,
        element: renderLazyRoute(AcceptInvitationRoute),
      },
      {
        path: TMA_PATHS.groups,
        element: renderLazyRoute(GroupsPage),
      },
      {
        path: TMA_PATHS.groupsNew,
        element: renderLazyRoute(CreateGroupRoute),
      },
      {
        path: `${TMA_PATHS.groups}/:id`,
        element: renderLazyRoute(GroupDetailRoute),
      },
      {
        path: TMA_PATHS.budgets,
        element: renderLazyRoute(BudgetsPage),
      },
      {
        path: TMA_PATHS.budgetsNew,
        element: renderLazyRoute(CreateBudgetRoute),
      },
      {
        path: `${TMA_PATHS.budgets}/:id`,
        element: renderLazyRoute(BudgetDetailRoute),
      },
      {
        path: TMA_PATHS.fatal,
        element: renderLazyRoute(FatalLaunchPage),
      },
    ],
  },
])

export const AppRouter = () => <RouterProvider router={router} />
