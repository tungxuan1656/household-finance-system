'use client'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n'

export default function LandingPage() {
  return (
    <div className='flex min-h-dvh items-center justify-center bg-background p-6'>
      <main className='mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-lg border border-border/70 bg-background/85 p-8 shadow-sm backdrop-blur'>
        <Badge className='w-fit' variant='secondary'>
          {t('shell.protected.badge')}
        </Badge>
        <h1 className='font-heading text-3xl tracking-tight'>
          {t('app.overview.title')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t('app.overview.description')}
        </p>
        <div className='flex flex-wrap gap-3'>
          <Button asChild>
            <Link href={PATHS.APP_ROOT}>{t('common.actions.backToShell')}</Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href={PATHS.SIGN_IN}>{t('common.actions.signIn')}</Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href={PATHS.SIGN_UP}>
              {t('common.actions.createAccount')}
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
