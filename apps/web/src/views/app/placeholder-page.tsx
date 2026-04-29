'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n'

function PlaceholderPage({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <span aria-hidden='true'>▣</span>
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant='outline'>
          <Link href={PATHS.APP_ROOT}>
            {t('common.actions.backToOverview')}
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export { PlaceholderPage }
