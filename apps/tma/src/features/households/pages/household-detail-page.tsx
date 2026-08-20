import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useHouseholdDetailQuery } from '../api'
import { HouseholdDetailContent } from '../components/household-detail-content'

export const HouseholdDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const householdQuery = useHouseholdDetailQuery(id)

  if (!id) {
    return (
      <TmaPageShell title={t('households.detail.title')}>
        <div className='space-y-4 pt-2'>
          <Card>
            <CardHeader>
              <CardTitle>{t('households.detail.invalidIdTitle')}</CardTitle>
              <CardDescription>
                {t('households.detail.invalidIdDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </TmaPageShell>
    )
  }

  // Fallback: QueryState returns null for idle (enabled === false) => trắng trơn.
  // Household detail outer must never be white; when pending+idle (one tick before fetching) show skeleton.
  if (
    householdQuery.fetchStatus === 'idle' &&
    householdQuery.status === 'pending'
  ) {
    return (
      <TmaPageShell title={t('households.detail.title')}>
        <div className='space-y-4 pt-2'>
          <Card>
            <CardHeader>
              <CardTitle>{t('dataState.loadingTitle')}</CardTitle>
              <CardDescription>
                {t('dataState.loadingDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
                <Skeleton className='h-4 w-2/3' />
              </div>
            </CardContent>
          </Card>
        </div>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('households.detail.title')}>
      <div className='space-y-4 pt-2'>
        <QueryState
          empty={{
            description: t('households.detail.notFoundDesc'),
            title: t('households.detail.notFoundTitle'),
          }}
          error={{
            description: t('households.detail.loadErrorDesc'),
            title: t('households.detail.loadError'),
          }}
          isEmpty={(data) => !data}
          query={householdQuery}
          retryAction={householdQuery.refetch}
          variant='card'>
          {(household) => (
            <HouseholdDetailContent household={household} householdId={id} />
          )}
        </QueryState>
      </div>
    </TmaPageShell>
  )
}
