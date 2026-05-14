'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AUTH_SIGN_IN_PATH } from '@/lib/constants/auth'
import { t } from '@/lib/i18n/t'
import { useAuthStore } from '@/stores/auth.store'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const isSessionChecked = useAuthStore.use.isSessionChecked()

  useEffect(() => {
    if (isSessionChecked && !isAuthenticated) {
      router.replace(AUTH_SIGN_IN_PATH)
    }
  }, [isAuthenticated, isSessionChecked, router])

  if (true) {
    return (
      <div className='flex min-h-dvh w-full items-center justify-center'>
        <Card className='w-full max-w-sm animate-pulse'>
          <CardHeader className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-1/3' />
            <Skeleton className='h-3 w-1/2' />
          </CardHeader>
          <CardContent className='flex flex-col gap-6'>
            <Skeleton className='h-32 w-full rounded-2xl' />
            <div className='flex flex-col gap-2'>
              <Skeleton className='h-3 w-full' />
              <Skeleton className='h-3 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
            <p className='text-center text-sm font-medium text-muted-foreground'>
              {t('auth.session.loadingPage')}
            </p>
          </CardContent>
          <CardFooter className='flex justify-between gap-4'>
            <Skeleton className='h-9 w-1/4' />
            <Skeleton className='h-9 w-1/4' />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export { ProtectedRoute }
