import { Route, Routes } from 'react-router-dom'

import { MainLayout } from '@/components/layouts/main-layout'
import { ProtectedRoute } from '@/components/layouts/protected-route'
import { PublicLayout } from '@/components/layouts/public-layout'
import { PublicRoute } from '@/components/layouts/public-route'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n'
import { OnboardingPage } from '@/pages/app/onboarding-page'
import { OverviewPage } from '@/pages/app/overview-page'
import { PlaceholderPage } from '@/pages/app/placeholder-page'
import { ProfileSettingsPage } from '@/pages/app/profile-settings-page'
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
        <Route element={<MainLayout />} path={PATHS.APP_ROOT}>
          <Route index element={<OverviewPage />} />
          <Route
            element={<OnboardingPage />}
            path={PATHS.ONBOARDING.replace('/', '')}
          />
          <Route
            element={
              <PlaceholderPage
                description={t('app.placeholder.expenses.description')}
                title={t('app.placeholder.expenses.title')}
              />
            }
            path={PATHS.EXPENSES.replace('/', '')}
          />
          <Route
            element={
              <PlaceholderPage
                description={t('app.placeholder.budgets.description')}
                title={t('app.placeholder.budgets.title')}
              />
            }
            path={PATHS.BUDGETS.replace('/', '')}
          />
          <Route
            element={
              <PlaceholderPage
                description={t('app.placeholder.insights.description')}
                title={t('app.placeholder.insights.title')}
              />
            }
            path={PATHS.INSIGHTS.replace('/', '')}
          />
          <Route
            element={<ProfileSettingsPage />}
            path={PATHS.SETTINGS.replace('/', '')}
          />
          <Route
            element={
              <PlaceholderPage
                description={t('app.placeholder.more.description')}
                title={t('app.placeholder.more.title')}
              />
            }
            path={PATHS.MORE.replace('/', '')}
          />
        </Route>
      </Route>
      <Route element={<NotFoundPage />} path='*' />
    </Routes>
  )
}
export { AppRoutes }
