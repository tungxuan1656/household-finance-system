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
      <div className='mx-auto grid min-h-svh w-full md:grid-cols-[240px_minmax(0,1fr)] lg:max-w-7xl lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 lg:p-8'>
        {/* Desktop Sidebar (hidden on mobile) */}
        {!isMobile && (
          <div className='hidden md:block'>
            <div className='sticky top-8 h-[calc(100svh-4rem)]'>
              <AppSidebar onSignOut={handleSignOut} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className='flex w-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-8 lg:pb-0'>
          <section className='flex-1 rounded-none bg-background/85 p-4 shadow-sm backdrop-blur sm:p-6 md:rounded-lg md:border-x'>
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
