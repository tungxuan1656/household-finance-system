'use client'

import Link from 'next/link'

import { ExpenseFeedList } from '@/components/expense/expense-feed-list'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

function ExpensesPage() {
  return (
    <div className='flex flex-col gap-6'>
      <header className='flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('expense.feed.title')}
          </h1>
        </div>
        <Button asChild>
          <Link href={PATHS.ADD_EXPENSE}>{t('expense.addTitle')}</Link>
        </Button>
      </header>

      <ExpenseFeedList />
    </div>
  )
}

export { ExpensesPage }
