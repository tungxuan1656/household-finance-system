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
  Field,
  FieldLabel,
  IconBadge,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import {
  NativePicker,
  type NativePickerOption,
} from '@/components/ui/native-picker'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatCurrencyMinor } from '@/features/home/presentation'
import type { HouseholdDTO } from '@/features/home/types'
import { getBudgetDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

import { useBudgetListQuery } from '../api'
import {
  formatBudgetPeriodLabel,
  getBudgetScopeLabel,
  getLatestBudget,
} from '../presentation'
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

type ScopeFilter = 'all' | 'household' | 'personal'

const SCOPE_FILTER_OPTIONS: { label: string; value: ScopeFilter }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Household', value: 'household' },
  { label: 'Cá nhân', value: 'personal' },
]

const ScopeFilterChip = ({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean
  label: string
  onClick: () => void
}) => (
  <button
    className={cn(
      'inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition active:scale-95',
      isSelected
        ? 'bg-tma-primary/12 text-tma-primary'
        : 'bg-black/[0.06] text-tma-text-strong',
    )}
    type='button'
    onClick={onClick}>
    {label}
  </button>
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
      <div className='flex flex-wrap gap-1.5'>
        <Chip tone='primary'>{formatBudgetPeriodLabel(budget.period)}</Chip>
        <Chip
          className={
            budget.scope === 'personal'
              ? 'bg-tma-warning/20 text-[#8a6800]'
              : undefined
          }
          tone={budget.scope === 'personal' ? 'warning' : 'muted'}>
          {getBudgetScopeLabel(budget.scope, household)}
        </Chip>
      </div>
    </div>

    <div className='min-w-0'>
      <CardTitle className='truncate'>
        {budget.scope === 'personal'
          ? 'Ngân sách cá nhân'
          : (household?.name ?? 'Household')}
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
  const adminHouseholds = households.filter(
    (household) => household.role === 'admin',
  )
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('')
  const selectedHousehold = households.find(
    (household) => household.id === selectedHouseholdId,
  )

  const householdOptions: NativePickerOption[] = useMemo(() => {
    if (households.length === 0) {
      return [{ value: '', label: 'Chưa có household' }]
    }

    return households.map((h) => ({ value: h.id, label: h.name }))
  }, [households])

  const listParams = useMemo(() => {
    if (scopeFilter === 'personal') {
      return { scope: 'personal' as const }
    }
    if (scopeFilter === 'household') {
      return {
        scope: 'household' as const,
        householdId: selectedHouseholdId || undefined,
      }
    }

    return {}
  }, [scopeFilter, selectedHouseholdId])

  const budgetsQuery = useBudgetListQuery(listParams)
  const budgets = useMemo(
    () =>
      [...(budgetsQuery.data?.items ?? [])].sort((left, right) =>
        right.period.localeCompare(left.period),
      ),
    [budgetsQuery.data?.items],
  )

  const filteredBudgets = useMemo(() => {
    if (scopeFilter === 'all') return budgets

    return budgets.filter((budget) => budget.scope === scopeFilter)
  }, [budgets, scopeFilter])

  const latestBudget = getLatestBudget(filteredBudgets)

  useEffect(() => {
    if (!selectedHouseholdId && adminHouseholds[0]) {
      setSelectedHouseholdId(adminHouseholds[0].id)
    }
  }, [adminHouseholds, selectedHouseholdId])

  const isInitialLoading =
    (householdsQuery.isLoading && households.length === 0) ||
    (budgetsQuery.isLoading && budgets.length === 0)
  const isInitialError =
    (householdsQuery.isError && households.length === 0) ||
    (budgetsQuery.isError && budgets.length === 0)

  const canCreateBudget =
    scopeFilter === 'personal' ||
    scopeFilter === 'all' ||
    adminHouseholds.length > 0

  const emptyTitle =
    scopeFilter === 'personal'
      ? 'Chưa có ngân sách cá nhân'
      : scopeFilter === 'household'
        ? 'Chưa có ngân sách household'
        : 'Chưa có ngân sách'

  const emptyDescription =
    scopeFilter === 'personal'
      ? 'Tạo ngân sách cá nhân để theo dõi chi tiêu của bạn theo tháng.'
      : scopeFilter === 'household'
        ? 'Tạo ngân sách tháng đầu tiên cho household để xem planned vs actual.'
        : 'Tạo ngân sách để theo dõi chi tiêu theo tháng.'

  return (
    <TmaPageShell title='Ngân sách'>
      <Card className='grid gap-3 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <strong className='mt-1 block text-[30px] leading-none font-extrabold text-tma-text-strong'>
              {filteredBudgets.length}
            </strong>
          </div>
          <IconBadge accent={budgetAccent}>
            <BudgetGlyph />
          </IconBadge>
        </div>
      </Card>

      <Section>
        <SectionHeader
          action={
            canCreateBudget ? (
              <Link
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
                to={TMA_PATHS.budgetsNew}
                onClick={() => selection()}>
                Tạo mới
              </Link>
            ) : null
          }
          title='Ngân sách'
        />

        <div className='mb-3 flex flex-wrap gap-2'>
          {SCOPE_FILTER_OPTIONS.map((option) => (
            <ScopeFilterChip
              key={option.value}
              isSelected={scopeFilter === option.value}
              label={option.label}
              onClick={() => setScopeFilter(option.value)}
            />
          ))}
        </div>

        {scopeFilter === 'household' ? (
          <Card className='mb-3 grid gap-2'>
            <Field>
              <FieldLabel>Household</FieldLabel>
              <NativePicker
                fullWidth
                aria-label='Chọn household'
                disabled={householdsQuery.isLoading || households.length === 0}
                options={householdOptions}
                value={selectedHouseholdId}
                onChange={(next) => setSelectedHouseholdId(next)}
              />
            </Field>
            {selectedHousehold?.role !== 'admin' ? (
              <CardDescription>
                Bạn có thể xem ngân sách household này. Tạo, sửa, xóa cần quyền
                admin.
              </CardDescription>
            ) : null}
          </Card>
        ) : null}

        {latestBudget ? (
          <Card className='mb-3 grid gap-2 border-tma-warning/30 bg-[#fff9e6]'>
            <Eyebrow>Budget mới nhất</Eyebrow>
            <div className='flex items-end justify-between gap-3'>
              <div>
                <CardTitle>
                  {formatBudgetPeriodLabel(latestBudget.period)}
                </CardTitle>
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
            budgets.length === 0 && !isInitialLoading && canCreateBudget ? (
              <Link
                className={buttonVariants({ variant: 'secondary' })}
                to={TMA_PATHS.budgetsNew}
                onClick={() => selection()}>
                Tạo ngân sách
              </Link>
            ) : null
          }
          emptyDescription={emptyDescription}
          emptyTitle={emptyTitle}
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
            {filteredBudgets.map((budget) => (
              <BudgetListCard
                key={budget.id}
                budget={budget}
                household={households.find(
                  (household) => household.id === budget.householdId,
                )}
              />
            ))}
          </div>
        </DataState>
      </Section>
    </TmaPageShell>
  )
}
