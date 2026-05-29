'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { AppTopNav } from '@/components/layouts/app-top-nav'
import { BottomTab } from '@/components/layouts/bottom-tab'
import { AddExpenseDialogProvider } from '@/features/expenses/components/add-expense/provider'
import { useIsMobile } from '@/hooks/shared/use-mobile'
import { signOutCurrentSession } from '@/lib/auth/session-service'
import { PATHS } from '@/lib/constants/paths'

function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isMobile = useIsMobile()

  const handleSignOut = async () => {
    await signOutCurrentSession()
    router.replace(PATHS.SIGN_IN)
  }

  return (
    <AddExpenseDialogProvider>
      <div className='flex min-h-svh flex-col bg-background'>
        {/* Desktop Top Nav (hidden on mobile) */}
        {!isMobile && <AppTopNav onSignOut={handleSignOut} />}

        {/* Main Content Area */}
        <main className='flex flex-1 flex-col px-4 py-6'>
          <div className='mx-auto w-full max-w-5xl'>{children}</div>
        </main>

        {/* Mobile Bottom Tab (hidden on desktop) */}
        {isMobile && <BottomTab />}
      </div>
    </AddExpenseDialogProvider>
  )
}

export { MainLayout }
