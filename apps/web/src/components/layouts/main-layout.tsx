'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { QuickAddExpenseTrigger } from '@/components/expense/quick-add-expense-trigger'
import { AppSidebar } from '@/components/layouts/app-sidebar'
import { BottomTab } from '@/components/layouts/bottom-tab'
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
    <div className='min-h-svh bg-background'>
      {/* Desktop Wrapper */}
      <div className='mx-auto grid min-h-svh w-full md:grid-cols-[240px_minmax(0,1fr)] lg:max-w-5xl lg:gap-8 lg:p-8'>
        {/* Desktop Sidebar (hidden on mobile) */}
        {!isMobile && (
          <div className='hidden md:block'>
            <div className='sticky top-8 h-[calc(100svh-4rem)]'>
              <AppSidebar onSignOut={handleSignOut} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className='flex w-full flex-col pb-24 md:pb-8'>
          <section className='flex-1 bg-background p-4 md:p-6 lg:p-8'>
            {children}
          </section>
        </main>
      </div>

      {/* Mobile Bottom Tab (hidden on desktop) */}
      {isMobile && <BottomTab />}

      <QuickAddExpenseTrigger />
    </div>
  )
}

export { MainLayout }
