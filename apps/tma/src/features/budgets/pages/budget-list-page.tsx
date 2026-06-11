import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  buttonVariants,
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
import type { HouseholdDTO } from '@/features/home/types'
import { getBudgetDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

import { useBudgetListQuery } from '../api'
import { formatBudgetPeriodLabel, getLatestBudget } from '../presentation'
import type { BudgetDTO } from '../types'

const budgetAccent = { background: '#fff6d9', foreground: '#b48800' }

const BudgetGlyph = () => (
  <svg
    fill='none'
    height='20'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    viewBox='0 0 24 24'
    width='20'>
    <path d='M5 8.5c0-2.5 3.1-4.5 7-4.5 2.5 0 4.7.8 6 2.1' />
    <path d='M4.5 12c0-1.8 1.7-3.3 4.1-3.9' />
    <path d='M6 18c1.2 1.3 3.4 2 6 2 4.1 0 7-1.8 7-4.5 0-2.5-2.4-4.2-5.8-4.5' />
    <path d='M12 10v6' />
    <path d='M9.5 12.5c.4-.9 1.3-1.5 2.5-1.5 1.4 0 2.5.8 2.5 1.8S13.4 14.6 12 15c-1.4.3-2.5 1-2.5 2 0 1 .9 1.8 2.5 1.8 1.3 0 2.2-.5 2.6-1.4' />
  </svg>
)

const BudgetListCard = ({
  budget,
  household,
}: {
  budget: BudgetDTO
  household?: HouseholdDTO
}) => (
  <Link
    className='grid gap-3 rounded-3xl bg-white p-4 shadow-tma-card transition active:scale-[0.99]'
    to={getBudgetDetailPath(budget.id)}
    onClick={() => selection()}>
    <div className='flex items-start justify-between gap-3'>
      <IconBadge accent={budgetAccent}>
        <BudgetGlyph />
      </IconBadge>
      <Chip tone='primary'>{formatBudgetPeriodLabel(budget.period)}</Chip>
    </div>

    <div className='min-w-0'>
      <CardTitle className='truncate'>
        {household?.name ?? 'Household'}
      </CardTitle>
      <CardDescription className='mt-1'>
        {budget.categoryLimits.length > 0
          ? `${budget.categoryLimits.length} danh mục có hạn mức riêng`
          : 'Chỉ đặt tổng ngân sách tháng'}
      </CardDescription>
    </div>

    <div className='grid grid-cols-2 gap-2.5'>
      <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
        <Eyebrow>Tổng limit</Eyebrow>
        <MoneyLabel className='text-sm font-bold'>
          {formatCurrencyMinor(budget.totalLimitMinor, budget.currencyCode)}
        </MoneyLabel>
      </div>
      <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
        <Eyebrow>Danh mục</Eyebrow>
        <strong className='text-sm text-tma-text-strong'>
          {budget.categoryLimits.length}
        </strong>
      </div>
    </div>
  </Link>
)

export const BudgetListPage = () => {
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('')
  const selectedHousehold = households.find(
    (household) => household.id === selectedHouseholdId,
  )
  const budgetsQuery = useBudgetListQuery(selectedHouseholdId || undefined)
  const budgets = useMemo(
    () =>
      [...(budgetsQuery.data?.items ?? [])].sort((left, right) =>
        right.period.localeCompare(left.period),
      ),
    [budgetsQuery.data?.items],
  )
  const latestBudget = getLatestBudget(budgets)

  useEffect(() => {
    if (!selectedHouseholdId && households[0]) {
      setSelectedHouseholdId(households[0].id)
    }
  }, [households, selectedHouseholdId])

  const isInitialLoading =
    (householdsQuery.isLoading && households.length === 0) ||
    (budgetsQuery.isLoading && budgets.length === 0)
  const isInitialError =
    (householdsQuery.isError && households.length === 0) ||
    (budgetsQuery.isError && budgets.length === 0)

  return (
    <TmaPageShell title='Ngân sách'>
      <Card className='grid gap-3 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <Eyebrow>Budget hub</Eyebrow>
            <strong className='mt-1 block text-[30px] leading-none font-extrabold text-tma-text-strong'>
              {budgets.length}
            </strong>
          </div>
          <IconBadge accent={budgetAccent}>
            <BudgetGlyph />
          </IconBadge>
        </div>
        <CardDescription>
          Theo dõi ngân sách tháng theo household. Detail sẽ dùng API status để
          hiển thị planned vs actual và cảnh báo 80% / vượt ngưỡng.
        </CardDescription>
      </Card>

      <Section>
        <SectionHeader
          action={
            selectedHousehold?.role === 'admin' ? (
              <Link
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
                to={TMA_PATHS.budgetsNew}
                onClick={() => selection()}>
                Tạo mới
              </Link>
            ) : null
          }
          eyebrow={selectedHousehold?.name ?? 'Household'}
          title='Budget của household'
        />

        <Card className='mb-3 grid gap-2'>
          <label className='grid gap-2'>
            <span className='text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase'>
              Household
            </span>
            <select
              className={cn(
                'min-h-14 w-full rounded-[18px] border border-tma-line bg-black/[0.04] px-4 text-base text-tma-text-strong transition outline-none focus:border-tma-primary/30 focus:ring-4 focus:ring-tma-primary/10 disabled:opacity-70',
              )}
              disabled={householdsQuery.isLoading || households.length === 0}
              value={selectedHouseholdId}
              onChange={(event) => setSelectedHouseholdId(event.target.value)}>
              {households.length === 0 ? (
                <option value=''>Chưa có household</option>
              ) : null}
              {households.map((household) => (
                <option key={household.id} value={household.id}>
                  {household.name}
                </option>
              ))}
            </select>
          </label>
          {selectedHousehold?.role !== 'admin' ? (
            <CardDescription>
              Bạn có thể xem ngân sách household này. Tạo, sửa, xóa cần quyền
              admin.
            </CardDescription>
          ) : null}
        </Card>

        {latestBudget ? (
          <Card className='mb-3 grid gap-2 border-tma-warning/30 bg-[#fff9e6]'>
            <Eyebrow>Budget mới nhất</Eyebrow>
            <div className='flex items-end justify-between gap-3'>
              <div>
                <CardTitle>
                  {formatBudgetPeriodLabel(latestBudget.period)}
                </CardTitle>
                <CardDescription>
                  Tháng đang được theo dõi gần nhất
                </CardDescription>
              </div>
              <MoneyLabel className='text-lg font-extrabold'>
                {formatCurrencyMinor(
                  latestBudget.totalLimitMinor,
                  latestBudget.currencyCode,
                )}
              </MoneyLabel>
            </div>
          </Card>
        ) : null}

        <DataState
          customAction={
            budgets.length === 0 &&
            !isInitialLoading &&
            selectedHousehold?.role === 'admin' ? (
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to={TMA_PATHS.budgetsNew}
                onClick={() => selection()}>
                Tạo ngân sách
              </Link>
            ) : null
          }
          emptyDescription='Tạo ngân sách tháng đầu tiên cho household để xem planned vs actual.'
          emptyTitle='Chưa có ngân sách'
          errorDescription='API budget hoặc household đang lỗi. Thử tải lại sau khi phiên đăng nhập ổn định.'
          errorTitle='Không tải được ngân sách'
          isEmpty={!isInitialLoading && !isInitialError && budgets.length === 0}
          isError={isInitialError}
          isLoading={isInitialLoading}
          loadingDescription='Danh sách budget sẽ hiện sau khi truy vấn household và budget hoàn tất.'
          loadingTitle='Đang tải ngân sách'
          retryAction={async () => {
            await Promise.all([
              householdsQuery.refetch(),
              budgetsQuery.refetch(),
            ])
          }}>
          <div className='grid gap-3'>
            {budgets.map((budget) => (
              <BudgetListCard
                key={budget.id}
                budget={budget}
                household={selectedHousehold}
              />
            ))}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
