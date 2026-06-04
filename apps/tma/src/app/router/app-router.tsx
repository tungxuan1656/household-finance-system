import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { TMA_PATHS } from '@/lib/constants/routes'
import { AddExpenseCategoryPage } from '@/routes/add-expense-category'
import { AddExpenseContextPage } from '@/routes/add-expense-context'
import { AddExpenseDetailsPage } from '@/routes/add-expense-details'
import { ExpenseDetailPage } from '@/routes/expense-detail'
import { ExpensesPage } from '@/routes/expenses'
import { FatalLaunchPage } from '@/routes/fatal-launch'
import { HomePage } from '@/routes/home'
import { HouseholdDetailRoute } from '@/routes/household-detail'
import { HouseholdsPage } from '@/routes/households'
import { NotFoundPage } from '@/routes/not-found'
import { StatisticsPage } from '@/routes/statistics'

const router = createBrowserRouter([
  {
    path: TMA_PATHS.root,
    element: <HomePage />,
  },
  {
    path: TMA_PATHS.home,
    element: <HomePage />,
  },
  {
    path: TMA_PATHS.statistics,
    element: <StatisticsPage />,
  },
  {
    path: TMA_PATHS.expenses,
    element: <ExpensesPage />,
  },
  {
    path: `${TMA_PATHS.expenses}/:id`,
    element: <ExpenseDetailPage />,
  },
  {
    path: TMA_PATHS.expensesNewCategory,
    element: <AddExpenseCategoryPage />,
  },
  {
    path: TMA_PATHS.expensesNewDetails,
    element: <AddExpenseDetailsPage />,
  },
  {
    path: TMA_PATHS.expensesNewContext,
    element: <AddExpenseContextPage />,
  },
  {
    path: TMA_PATHS.households,
    element: <HouseholdsPage />,
  },
  {
    path: `${TMA_PATHS.households}/:id`,
    element: <HouseholdDetailRoute />,
  },
  {
    path: TMA_PATHS.fatal,
    element: <FatalLaunchPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export const AppRouter = () => <RouterProvider router={router} />
