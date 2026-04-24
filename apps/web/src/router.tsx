import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedShell } from '@/components/layouts/protected-shell'
import { PublicRoute } from '@/components/layouts/public-route'
import { PublicShell } from '@/components/layouts/public-shell'
import { ShellGuard } from '@/components/layouts/shell-guard'
import { t } from '@/lib/i18n'
import { OnboardingPage } from '@/pages/app/onboarding-page'
import { OverviewPage } from '@/pages/app/overview-page'
import { PlaceholderPage } from '@/pages/app/placeholder-page'
import { SignInPage } from '@/pages/auth/sign-in-page'
import { SignUpPage } from '@/pages/auth/sign-up-page'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Navigate replace to='/sign-in' />} path='/' />
      <Route element={<PublicRoute />}>
        <Route element={<PublicShell />}>
          <Route element={<SignInPage />} path='/sign-in' />
          <Route element={<SignUpPage />} path='/sign-up' />
        </Route>
      </Route>
      <Route element={<ShellGuard />}>
        <Route element={<ProtectedShell />} path='/app'>
          <Route index element={<OverviewPage />} />
          <Route element={<OnboardingPage />} path='onboarding' />
          <Route
            element={
              <PlaceholderPage
                description={t('app.placeholder.expenses.description')}
                title={t('app.placeholder.expenses.title')}
              />
            }
            path='expenses'
          />
          <Route
            element={
              <PlaceholderPage
                description={t('app.placeholder.budgets.description')}
                title={t('app.placeholder.budgets.title')}
              />
            }
            path='budgets'
          />
          <Route
            element={
              <PlaceholderPage
                description={t('app.placeholder.insights.description')}
                title={t('app.placeholder.insights.title')}
              />
            }
            path='insights'
          />
          <Route
            element={
              <PlaceholderPage
                description={t('app.placeholder.settings.description')}
                title={t('app.placeholder.settings.title')}
              />
            }
            path='settings'
          />
        </Route>
      </Route>
      <Route element={<Navigate replace to='/sign-in' />} path='*' />
    </Routes>
  )
}
export { AppRoutes }
