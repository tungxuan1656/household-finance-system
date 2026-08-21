import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import {
  RootErrorElement,
  RouteErrorBoundary,
} from '@/components/shared/route-error-boundary'
import { FatalLaunchPage } from '@/features/auth/pages/fatal-launch-page'
import { BudgetDetailPage } from '@/features/budgets/pages/budget-detail-page'
import { BudgetListPage } from '@/features/budgets/pages/budget-list-page'
import { CreateBudgetPage } from '@/features/budgets/pages/create-budget-page'
import { AddExpenseCategoryPage } from '@/features/expenses/pages/add-expense-category-page'
import { AddExpenseChatPage } from '@/features/expenses/pages/add-expense-chat-page'
import { AddExpenseContextPage } from '@/features/expenses/pages/add-expense-context-page'
import { AddExpenseDetailsPage } from '@/features/expenses/pages/add-expense-details-page'
import { AddExpenseImportPreviewPage } from '@/features/expenses/pages/add-expense-import-preview-page'
import { ExpenseDetailPage } from '@/features/expenses/pages/expense-detail-page'
import { ExpenseEditCategoryPage } from '@/features/expenses/pages/expense-edit-category-page'
import { ExpenseEditPage } from '@/features/expenses/pages/expense-edit-page'
import { ExpenseFilterPage } from '@/features/expenses/pages/expense-filter-page'
import { ExpensesPage } from '@/features/expenses/pages/expense-list-page'
import { CreateGroupPage } from '@/features/groups/pages/create-group-page'
import { GroupDetailPage } from '@/features/groups/pages/group-detail-page'
import { GroupListPage } from '@/features/groups/pages/group-list-page'
import { HomePage } from '@/features/home/pages/home-page'
import { StatisticsPage } from '@/features/home/pages/statistics-page'
import { CreateHouseholdPage } from '@/features/households/pages/create-household-page'
import { HouseholdDetailPage } from '@/features/households/pages/household-detail-page'
import { HouseholdListPage } from '@/features/households/pages/household-list-page'
import { AddIncomePage } from '@/features/incomes/pages/add-income-page'
import { IncomesPage } from '@/features/incomes/pages/income-list-page'
import { AcceptInvitationPage } from '@/features/invitations/pages/accept-invitation-page'
import { PeriodPickerPage } from '@/features/period/pages/period-picker-page'
import { TMA_PATHS } from '@/lib/constants/routes'

import RootLayout from './root-layout'

const renderRoute = (Component: React.ComponentType) => (
  <RouteErrorBoundary>
    <Component />
  </RouteErrorBoundary>
)

export const router = createBrowserRouter([
  {
    path: TMA_PATHS.root,
    errorElement: <RootErrorElement />,
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: renderRoute(HomePage),
      },
      {
        path: TMA_PATHS.period,
        element: renderRoute(PeriodPickerPage),
      },
      {
        path: TMA_PATHS.statistics,
        element: renderRoute(StatisticsPage),
      },
      {
        path: TMA_PATHS.expenses,
        element: renderRoute(ExpensesPage),
      },
      {
        path: `${TMA_PATHS.expenses}/:id`,
        element: renderRoute(ExpenseDetailPage),
      },
      {
        path: TMA_PATHS.expensesFilter,
        element: renderRoute(ExpenseFilterPage),
      },
      {
        path: `${TMA_PATHS.expenses}/:id/edit`,
        element: renderRoute(ExpenseEditPage),
      },
      {
        path: `${TMA_PATHS.expenses}/:id/edit/category`,
        element: renderRoute(ExpenseEditCategoryPage),
      },
      {
        path: TMA_PATHS.expensesNewCategory,
        element: renderRoute(AddExpenseCategoryPage),
      },
      {
        path: TMA_PATHS.expensesNewDetails,
        element: renderRoute(AddExpenseDetailsPage),
      },
      {
        path: TMA_PATHS.expensesNewContext,
        element: renderRoute(AddExpenseContextPage),
      },
      {
        path: TMA_PATHS.expensesNewChat,
        element: renderRoute(AddExpenseChatPage),
      },
      {
        path: TMA_PATHS.expensesNewImport,
        element: renderRoute(AddExpenseImportPreviewPage),
      },
      {
        path: TMA_PATHS.incomes,
        element: renderRoute(IncomesPage),
      },
      {
        path: TMA_PATHS.incomesNew,
        element: renderRoute(AddIncomePage),
      },
      {
        path: TMA_PATHS.households,
        element: renderRoute(HouseholdListPage),
      },
      {
        path: TMA_PATHS.householdsNew,
        element: renderRoute(CreateHouseholdPage),
      },
      {
        path: `${TMA_PATHS.households}/:id`,
        element: renderRoute(HouseholdDetailPage),
      },
      {
        path: `${TMA_PATHS.invitations}/:token`,
        element: renderRoute(AcceptInvitationPage),
      },
      {
        path: TMA_PATHS.groups,
        element: renderRoute(GroupListPage),
      },
      {
        path: TMA_PATHS.groupsNew,
        element: renderRoute(CreateGroupPage),
      },
      {
        path: `${TMA_PATHS.groups}/:id`,
        element: renderRoute(GroupDetailPage),
      },
      {
        path: TMA_PATHS.budgets,
        element: renderRoute(BudgetListPage),
      },
      {
        path: TMA_PATHS.budgetsNew,
        element: renderRoute(CreateBudgetPage),
      },
      {
        path: `${TMA_PATHS.budgets}/:id`,
        element: renderRoute(BudgetDetailPage),
      },
      {
        path: TMA_PATHS.fatal,
        element: renderRoute(FatalLaunchPage),
      },
    ],
  },
])

export const AppRouter = () => <RouterProvider router={router} />
