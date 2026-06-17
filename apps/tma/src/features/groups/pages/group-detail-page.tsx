import { useMemo, useState } from 'react'
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
  GROUP_CONTEXT_PERSONAL_LABEL,
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
    ? (householdNameById.get(group.householdId) ?? 'Household')
    : GROUP_CONTEXT_PERSONAL_LABEL
  const totalSpendMinor =
    summary?.totalSpendMinor ?? group?.totalSpendMinor ?? null
  const progress = group
    ? getGroupProgress(totalSpendMinor ?? 0, group.eventBudgetMinor)
    : null
  const isGroupMissing = !groupQuery.isLoading && !groupQuery.isError && !group

  if (!id) {
    return (
      <TmaPageShell title='Chi tiết group'>
        <Card>
          <CardTitle>Group không hợp lệ</CardTitle>
          <CardDescription>
            Đường dẫn hiện tại thiếu mã group để tải chi tiết.
          </CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title='Chi tiết group'>
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
        emptyDescription='Group này không còn tồn tại hoặc bạn không có quyền truy cập.'
        emptyTitle='Không tìm thấy group'
        errorDescription='Group này có thể không còn truy cập được, hoặc phiên đăng nhập hiện tại đã hết hạn.'
        errorTitle='Không tải được group'
        isEmpty={isGroupMissing}
        isError={groupQuery.isError && !group}
        isLoading={groupQuery.isLoading && !group}
        loadingDescription='Thông tin group và summary sẽ hiện ngay sau khi đồng bộ xong.'
        loadingTitle='Đang tải chi tiết group'
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
                <Chip tone='success'>{getGroupStatusLabel(group.status)}</Chip>
                <Chip>{getGroupDateRangeLabel(group)}</Chip>
              </div>
            </Card>

            <Section>
              <SectionHeader title='Tổng quan' />
              <DataState
                errorDescription='Không tải được tổng hợp chi tiêu của group này.'
                errorTitle='Summary đang lỗi'
                isError={summaryQuery.isError && !summary}
                isLoading={summaryQuery.isLoading && !summary}
                loadingDescription='Tổng chi, số khoản và đóng góp sẽ hiện sau khi API trả dữ liệu.'
                loadingTitle='Đang tải summary'
                retryAction={summaryQuery.refetch}>
                <Card className='grid gap-4'>
                  <div className='grid grid-cols-2 gap-2.5'>
                    <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
                      <Eyebrow>Tổng chi</Eyebrow>
                      <MoneyLabel className='text-base font-extrabold'>
                        {totalSpendMinor != null
                          ? formatCurrencyMinor(totalSpendMinor, 'VND')
                          : '-'}
                      </MoneyLabel>
                    </div>
                    <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
                      <Eyebrow>Số khoản</Eyebrow>
                      <strong className='text-base text-tma-text-strong'>
                        {summary?.expenseCount ?? 0}
                      </strong>
                    </div>
                    <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
                      <Eyebrow>Ngân sách</Eyebrow>
                      <strong className='text-sm text-tma-text-strong'>
                        {getGroupBudgetLabel(group)}
                      </strong>
                    </div>
                    <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
                      <Eyebrow>Còn lại</Eyebrow>
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
                        <span>Tiến độ ngân sách</span>
                        <span>{progress.percentUsed}%</span>
                      </div>
                      <div className='h-2 overflow-hidden rounded-full bg-black/[0.06]'>
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
                <SectionHeader title='Thành viên' />
                <Card className='grid gap-2'>
                  {summary.memberContributions.map((member) => (
                    <article
                      key={member.userId}
                      className='flex items-center justify-between gap-3 rounded-[18px] bg-black/[0.04] p-3'>
                      <div className='min-w-0'>
                        <h3 className='m-0 truncate text-sm font-bold text-tma-text-strong'>
                          {member.displayName ?? 'Thành viên'}
                        </h3>
                        <CardDescription>
                          {member.expenseCount} khoản
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
              title='Chi tiêu trong group'
              viewAllHref={TMA_PATHS.expenses}
            />
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
