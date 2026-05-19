'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'

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

type EmptyStateProps = { addExpenseHref: string }

function EmptyState({ addExpenseHref }: EmptyStateProps) {
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
        <Button asChild>
          <Link href={addExpenseHref}>
            <Plus data-icon />
            {t('app.overview.homeEmpty.cta')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export type { EmptyStateProps }
export { EmptyState }
