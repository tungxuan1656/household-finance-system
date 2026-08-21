import { Link } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

import { GroupGlyph } from '../components/group-glyph'
import { GroupListCard } from '../components/group-list-card'
import { useGroupList } from '../hooks/use-group-list'

export const GroupListPage = () => {
  const { t, groupListQuery, handleRefetch, totalCount } = useGroupList()

  return (
    <TmaPageShell
      contentClassName='flex flex-col gap-4'
      title={t('groups.title')}
      onRefresh={handleRefetch}>
      <Card size='sm'>
        <CardHeader>
          <div className='flex items-start justify-between gap-3'>
            <div className='grid gap-1'>
              <CardDescription>{t('groups.title')}</CardDescription>
              <CardTitle className='text-2xl leading-none font-extrabold tabular-nums'>
                {totalCount}
              </CardTitle>
            </div>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <GroupGlyph />
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className='flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='m-0 text-sm font-bold tracking-tight'>
            {t('groups.header')}
          </h2>
          <Link
            className={buttonVariants({ size: 'sm', variant: 'secondary' })}
            to={TMA_PATHS.groupsNew}
            onClick={() => impact('light')}>
            {t('groups.create')}
          </Link>
        </div>

        <QueryState
          empty={{
            title: t('groups.emptyTitle'),
            description: t('groups.emptyDesc'),
            action: (
              <Link
                className={buttonVariants({
                  size: 'sm',
                  variant: 'secondary',
                })}
                to={TMA_PATHS.groupsNew}
                onClick={() => impact('light')}>
                {t('groups.createTitle')}
              </Link>
            ),
          }}
          error={{
            title: t('groups.loadError'),
            description: t('groups.loadErrorDesc'),
          }}
          isEmpty={(data) => data.length === 0}
          pending={{
            title: t('groups.loadingTitle'),
            description: t('groups.loadingDesc'),
          }}
          query={groupListQuery}
          retryAction={handleRefetch}
          variant='card'>
          {(items) => {
            const sorted = [...items].sort(
              (a, b) => b.group.createdAt - a.group.createdAt,
            )

            return (
              <div className='grid gap-3'>
                {sorted.map((item) => (
                  <GroupListCard key={item.group.id} item={item} />
                ))}
              </div>
            )
          }}
        </QueryState>
      </section>
    </TmaPageShell>
  )
}
