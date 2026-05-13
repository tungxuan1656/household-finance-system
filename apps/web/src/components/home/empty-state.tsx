'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { t } from '@/lib/i18n/t'

type EmptyStateProps = {
  onAddFirstExpense: () => void
}

function EmptyState({ onAddFirstExpense }: EmptyStateProps) {
  return (
    <Card className='mx-auto max-w-md'>
      <CardContent className='p-8 text-center'>
        <h2 className='mb-2 text-xl font-semibold'>
          {t('app.overview.homeEmpty.title')}
        </h2>
        <p className='mx-auto mb-6 max-w-sm text-sm text-muted-foreground'>
          {t('app.overview.homeEmpty.description')}
        </p>
        <Button size='lg' onClick={onAddFirstExpense}>
          <Plus className='mr-1.5 size-5' />
          {t('app.overview.homeEmpty.cta')}
        </Button>
      </CardContent>
    </Card>
  )
}

export type { EmptyStateProps }
export { EmptyState }
