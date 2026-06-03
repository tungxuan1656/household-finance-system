import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AddExpenseCategoryPage } from '@/routes/add-expense-category'
import { AddExpenseContextPage } from '@/routes/add-expense-context'
import { AddExpenseDetailsPage } from '@/routes/add-expense-details'
import { ExpensesPage } from '@/routes/expenses'
import { FatalLaunchPage } from '@/routes/fatal-launch'
import { HomePage } from '@/routes/home'
import { NotFoundPage } from '@/routes/not-found'
import { StatisticsPage } from '@/routes/statistics'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/statistics',
    element: <StatisticsPage />,
  },
  {
    path: '/expenses',
    element: <ExpensesPage />,
  },
  {
    path: '/expenses/new/category',
    element: <AddExpenseCategoryPage />,
  },
  {
    path: '/expenses/new/details',
    element: <AddExpenseDetailsPage />,
  },
  {
    path: '/expenses/new/context',
    element: <AddExpenseContextPage />,
  },
  {
    path: '/fatal',
    element: <FatalLaunchPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export const AppRouter = () => <RouterProvider router={router} />
