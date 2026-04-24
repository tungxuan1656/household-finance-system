import { Route, Routes } from 'react-router-dom'

import { MainLayout } from '@/components/layouts/main-layout'
import { ProtectedRoute } from '@/components/layouts/protected-route'
import { PublicLayout } from '@/components/layouts/public-layout'
import { PublicRoute } from '@/components/layouts/public-route'
import { t } from '@/lib/i18n'
import { OnboardingPage } from '@/pages/app/onboarding-page'
import { OverviewPage } from '@/pages/app/overview-page'
import { PlaceholderPage } from '@/pages/app/placeholder-page'
import { SignInPage } from '@/pages/auth/sign-in-page'
import { SignUpPage } from '@/pages/auth/sign-up-page'
import { NotFoundPage } from '@/pages/not-found-page'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<PublicLayout />}>
          <Route element={<SignInPage />} path='/sign-in' />
          <Route element={<SignUpPage />} path='/sign-up' />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />} path='/'>
          <Route index element={<OverviewPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />} path='/app'>
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
      <Route element={<NotFoundPage />} path='*' />
    </Routes>
  )
}
export { AppRoutes }
