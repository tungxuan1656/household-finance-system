'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { t } from '@/lib/i18n/t'

type EmptyStateProps = {
  onAddFirstExpense: () => void
}

function EmptyState({ onAddFirstExpense }: EmptyStateProps) {
  return (
    <Card className='mx-auto max-w-md'>
      <CardHeader>
        <CardTitle>{t('app.overview.homeEmpty.title')}</CardTitle>
        <CardDescription>
          {t('app.overview.homeEmpty.description')}
        </CardDescription>
      </CardHeader>
      <CardContent />
      <CardFooter>
        <Button onClick={onAddFirstExpense}>
          <Plus data-icon />
          {t('app.overview.homeEmpty.cta')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export type { EmptyStateProps }
export { EmptyState }
