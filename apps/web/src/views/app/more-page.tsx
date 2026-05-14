'use client'

import { PageShell } from '@/components/ui/page-shell'
import { t } from '@/lib/i18n/t'
import { MoreShortcutsCard } from '@/views/app/more/more-shortcuts-card'

import rootPackage from '../../../../../package.json'

const { version } = rootPackage

function MorePage() {
  return (
    <PageShell title={t('app.more.title')}>
      <div className='flex flex-col gap-4'>
        <p className='text-sm text-muted-foreground'>
          {t('app.more.description')}
        </p>

        <MoreShortcutsCard />
        <p className='text-center text-sm text-muted-foreground'>
          {t('app.more.version', { version })}
        </p>
      </div>
    </PageShell>
  )
}

export { MorePage }
