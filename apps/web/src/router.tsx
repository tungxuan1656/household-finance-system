import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedShell } from '@/components/layouts/protected-shell'
import { PublicShell } from '@/components/layouts/public-shell'
import { OnboardingPage } from '@/pages/app/onboarding-page'
import { OverviewPage } from '@/pages/app/overview-page'
import { PlaceholderPage } from '@/pages/app/placeholder-page'
import { SignInPage } from '@/pages/auth/sign-in-page'
import { SignUpPage } from '@/pages/auth/sign-up-page'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Navigate replace to='/sign-in' />} path='/' />
      <Route element={<PublicShell />}>
        <Route element={<SignInPage />} path='/sign-in' />
        <Route element={<SignUpPage />} path='/sign-up' />
      </Route>
      <Route element={<ProtectedShell />} path='/app'>
        <Route index element={<OverviewPage />} />
        <Route element={<OnboardingPage />} path='onboarding' />
        <Route element={<PlaceholderPage title='Expenses' />} path='expenses' />
        <Route element={<PlaceholderPage title='Budgets' />} path='budgets' />
        <Route element={<PlaceholderPage title='Insights' />} path='insights' />
        <Route element={<PlaceholderPage title='Settings' />} path='settings' />
      </Route>
      <Route element={<Navigate replace to='/sign-in' />} path='*' />
    </Routes>
  )
}
export { AppRoutes }
