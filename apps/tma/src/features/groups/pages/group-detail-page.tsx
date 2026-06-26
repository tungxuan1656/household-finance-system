import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { RecentExpenses } from '@/components/finance'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
  CardTitle,
  Chip,
  DataState,
  Eyebrow,
  IconBadge,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatCurrencyMinor } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'

import { useExpenseGroupDetailQuery, useGroupSummaryQuery } from '../api'
import {
  formatOptionalGroupMoney,
  getGroupBudgetLabel,
  getGroupDateRangeLabel,
  getGroupProgress,
  getGroupStatusLabel,
} from '../presentation'

type GroupPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

const groupAccent = { background: '#fff3e8', foreground: '#ff8a3d' }

const GroupGlyph = () => (
  <svg
    fill='none'
    height='20'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    viewBox='0 0 24 24'
    width='20'>
    <circle cx='9' cy='9' r='2.5' />
    <circle cx='16.5' cy='10' r='2' />
    <path d='M5.5 17c.8-2 2.3-3 4.5-3s3.7 1 4.5 3' />
    <path d='M14.5 17c.4-1.3 1.4-2.1 3-2.4' />
  </svg>
)

export const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { t } = useTranslation()
  const groupQuery = useExpenseGroupDetailQuery(id)
  const summaryQuery = useGroupSummaryQuery(id)
  const householdsQuery = useHouseholdsQuery()
  const [feedback] = useState<GroupPageFeedback | null>(
    () =>
      (location.state as { feedback?: GroupPageFeedback } | null)?.feedback ??
      null,
  )

  const group = groupQuery.data
  const summary = summaryQuery.data
  const householdNameById = useMemo(
    () =>
      new Map(
        (householdsQuery.data?.items ?? []).map((household) => [
          household.id,
          household.name,
        ]),
      ),
    [householdsQuery.data?.items],
  )
  const contextLabel = group?.householdId
    ? (householdNameById.get(group.householdId) ?? t('groups.contextHousehold'))
    : t('groups.contextPersonal')
  const totalSpendMinor =
    summary?.totalSpendMinor ?? group?.totalSpendMinor ?? null
  const progress = group
    ? getGroupProgress(totalSpendMinor ?? 0, group.eventBudgetMinor)
    : null
  const isGroupMissing = !groupQuery.isLoading && !groupQuery.isError && !group

  if (!id) {
    return (
      <TmaPageShell title={t('groups.detail.title')}>
        <Card>
          <CardTitle>{t('groups.detail.invalidIdTitle')}</CardTitle>
          <CardDescription>{t('groups.detail.invalidIdDesc')}</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('groups.detail.title')}>
      {feedback ? (
        <Card
          className={
            feedback.tone === 'error'
              ? 'mb-3 border-[#d93838]/20 bg-[#ffeded]/90'
              : 'mb-3 border-tma-positive/20 bg-tma-positive/10'
          }>
          <CardDescription
            className={
              feedback.tone === 'error' ? 'text-[#d93838]' : 'text-[#2f9b44]'
            }>
            {feedback.message}
          </CardDescription>
        </Card>
      ) : null}

      <DataState
        emptyDescription={t('groups.detail.notFoundDesc')}
        emptyTitle={t('groups.detail.notFoundTitle')}
        errorDescription={t('groups.detail.loadErrorDesc')}
        errorTitle={t('groups.detail.loadError')}
        isEmpty={isGroupMissing}
        isError={groupQuery.isError && !group}
        isLoading={groupQuery.isLoading && !group}
        loadingDescription={t('groups.detail.loadingDesc')}
        loadingTitle={t('groups.detail.loading')}
        retryAction={groupQuery.refetch}>
        {group ? (
          <>
            <Card className='grid gap-4 p-5'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <Eyebrow>{contextLabel}</Eyebrow>
                  <h1 className='m-0 mt-1 text-2xl leading-tight font-extrabold text-tma-text-strong'>
                    {group.name}
                  </h1>
                  {group.description ? (
                    <CardDescription className='mt-2'>
                      {group.description}
                    </CardDescription>
                  ) : null}
                </div>
                <IconBadge accent={groupAccent}>
                  <GroupGlyph />
                </IconBadge>
              </div>

              <div className='flex flex-wrap gap-2'>
                <Chip tone='success'>
                  {getGroupStatusLabel(group.status, t)}
                </Chip>
                <Chip>{getGroupDateRangeLabel(group, t)}</Chip>
              </div>
            </Card>

            <Section>
              <SectionHeader title={t('groups.detail.sectionOverview')} />
              <DataState
                errorDescription={t('groups.detail.overviewErrorDesc')}
                errorTitle={t('groups.detail.overviewErrorTitle')}
                isError={summaryQuery.isError && !summary}
                isLoading={summaryQuery.isLoading && !summary}
                loadingDescription={t('groups.detail.overviewLoadingDesc')}
                loadingTitle={t('groups.detail.overviewLoadingTitle')}
                retryAction={summaryQuery.refetch}>
                <Card className='grid gap-4'>
                  <div className='grid grid-cols-2 gap-2.5'>
                    <div className='grid gap-1 rounded-[18px] bg-black/4 p-3'>
                      <Eyebrow>{t('groups.detail.statTotalSpent')}</Eyebrow>
                      <MoneyLabel className='text-base font-extrabold'>
                        {totalSpendMinor != null
                          ? formatCurrencyMinor(totalSpendMinor, 'VND')
                          : '-'}
                      </MoneyLabel>
                    </div>
                    <div className='grid gap-1 rounded-[18px] bg-black/4 p-3'>
                      <Eyebrow>{t('groups.detail.statExpenseCount')}</Eyebrow>
                      <strong className='text-base text-tma-text-strong'>
                        {summary?.expenseCount ?? 0}
                      </strong>
                    </div>
                    <div className='grid gap-1 rounded-[18px] bg-black/4 p-3'>
                      <Eyebrow>{t('groups.detail.statBudget')}</Eyebrow>
                      <strong className='text-sm text-tma-text-strong'>
                        {getGroupBudgetLabel(group, t)}
                      </strong>
                    </div>
                    <div className='grid gap-1 rounded-[18px] bg-black/4 p-3'>
                      <Eyebrow>{t('groups.detail.statRemaining')}</Eyebrow>
                      <MoneyLabel
                        className={
                          summary?.budgetRemainingMinor != null &&
                          summary.budgetRemainingMinor < 0
                            ? 'text-sm font-bold text-[#d93838]'
                            : 'text-sm font-bold'
                        }>
                        {formatOptionalGroupMoney(
                          summary?.budgetRemainingMinor ?? null,
                        )}
                      </MoneyLabel>
                    </div>
                  </div>

                  {progress ? (
                    <div className='grid gap-1.5'>
                      <div className='flex items-center justify-between text-sm text-tma-text-muted'>
                        <span>{t('groups.detail.statProgress')}</span>
                        <span>{progress.percentUsed}%</span>
                      </div>
                      <div className='h-2 overflow-hidden rounded-full bg-black/6'>
                        <div
                          className={
                            progress.isOverBudget
                              ? 'h-full rounded-full bg-[#d93838]'
                              : 'h-full rounded-full bg-tma-primary'
                          }
                          style={{ width: `${progress.widthPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </Card>
              </DataState>
            </Section>

            {summary?.memberContributions.length ? (
              <Section>
                <SectionHeader title={t('groups.detail.sectionMembers')} />
                <Card className='grid gap-2'>
                  {summary.memberContributions.map((member) => (
                    <article
                      key={member.userId}
                      className='flex items-center justify-between gap-3 rounded-[18px] bg-black/4 p-3'>
                      <div className='min-w-0'>
                        <h3 className='m-0 truncate text-sm font-bold text-tma-text-strong'>
                          {member.displayName ??
                            t('groups.detail.memberFallback')}
                        </h3>
                        <CardDescription>
                          {t('statistics.expenseCount', {
                            count: member.expenseCount,
                          })}
                        </CardDescription>
                      </div>
                      <MoneyLabel className='shrink-0 text-sm font-bold'>
                        {formatCurrencyMinor(member.totalSpendMinor, 'VND')}
                      </MoneyLabel>
                    </article>
                  ))}
                </Card>
              </Section>
            ) : null}

            <RecentExpenses
              groupId={group.id}
              householdId={group.householdId ?? undefined}
              showHouseholdLabel={group.householdId == null}
              title={t('groups.detail.sectionExpenses')}
              viewAllHref={TMA_PATHS.expenses}
              viewAllState={{ appliedGroupId: group.id }}
            />
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
