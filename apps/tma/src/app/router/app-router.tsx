import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { LoadingFallback } from '@/components/shared/loading-fallback'
import { TMA_PATHS } from '@/lib/constants/routes'
import { NotFoundPage } from '@/routes/not-found'

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
  const module = await import('@/routes/expense-filter')

  return { default: module.ExpenseFilterRoute }
})

const ExpenseEditPage = lazy(async () => {
  const module = await import('@/routes/expense-edit')

  return { default: module.ExpenseEditPage }
})

const ExpenseEditCategoryPage = lazy(async () => {
  const module = await import('@/routes/expense-edit')

  return { default: module.ExpenseEditCategoryPage }
})

const ExpenseEditSourcePage = lazy(async () => {
  const module = await import('@/routes/expense-edit')

  return { default: module.ExpenseEditSourcePage }
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

const HouseholdsPage = lazy(async () => {
  const module = await import('@/routes/households')

  return { default: module.HouseholdsPage }
})

const GroupsPage = lazy(async () => {
  const module = await import('@/routes/groups')

  return { default: module.GroupsPage }
})

const BudgetsPage = lazy(async () => {
  const module = await import('@/routes/budgets')

  return { default: module.BudgetsPage }
})

const PeriodRoute = lazy(async () => {
  const module = await import('@/routes/period')

  return { default: module.PeriodRoute }
})

const CreateHouseholdRoute = lazy(async () => {
  const module = await import('@/routes/create-household')

  return { default: module.CreateHouseholdRoute }
})

const HouseholdDetailRoute = lazy(async () => {
  const module = await import('@/routes/household-detail')

  return { default: module.HouseholdDetailRoute }
})

const CreateGroupRoute = lazy(async () => {
  const module = await import('@/routes/create-group')

  return { default: module.CreateGroupRoute }
})

const GroupDetailRoute = lazy(async () => {
  const module = await import('@/routes/group-detail')

  return { default: module.GroupDetailRoute }
})

const CreateBudgetRoute = lazy(async () => {
  const module = await import('@/routes/create-budget')

  return { default: module.CreateBudgetRoute }
})

const BudgetDetailRoute = lazy(async () => {
  const module = await import('@/routes/budget-detail')

  return { default: module.BudgetDetailRoute }
})

const FatalLaunchPage = lazy(async () => {
  const module = await import('@/routes/fatal-launch')

  return { default: module.FatalLaunchPage }
})

const renderLazyRoute = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  {
    path: TMA_PATHS.root,
    errorElement: <NotFoundPage />,
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
        path: `${TMA_PATHS.expenses}/:id/edit/source`,
        element: renderLazyRoute(ExpenseEditSourcePage),
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
