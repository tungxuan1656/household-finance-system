import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Chip,
  DataState,
  Eyebrow,
  Field,
  FieldLabel,
  IconBadge,
  Input,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import { useAuthStore } from '@/features/auth/store'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatCurrencyMinor } from '@/features/home/presentation'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'
import { impact } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

import {
  useBudgetDetailQuery,
  useBudgetStatusQuery,
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from '../api'
import {
  type BudgetMutationFormValues,
  buildBudgetMutationRequest,
  formatBudgetPeriodLabel,
  getBudgetProgress,
  getBudgetScopeLabel,
  parseBudgetAmountInputToMinor,
} from '../presentation'

type BudgetFeedback = {
  message: string
  tone: 'error' | 'success'
}

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

const StatTile = ({
  label,
  tone = 'default',
  value,
}: {
  label: string
  tone?: 'default' | 'warning'
  value: string
}) => (
  <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
    <Eyebrow>{label}</Eyebrow>
    <strong
      className={cn(
        'text-base font-extrabold',
        tone === 'warning' ? 'text-[#d93838]' : 'text-tma-text-strong',
      )}>
      {value}
    </strong>
  </div>
)

export const BudgetDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const currentUserId = useAuthStore((state) => state.user?.id ?? null)

  const detailQuery = useBudgetDetailQuery(id ?? '')
  const statusQuery = useBudgetStatusQuery(id ?? '')
  const householdsQuery = useHouseholdsQuery()
  const updateMutation = useUpdateBudgetMutation()
  const deleteMutation = useDeleteBudgetMutation()

  const budget = detailQuery.data
  const status = statusQuery.data
  const households = householdsQuery.data?.items ?? []
  const household = useMemo(
    () => households.find((entry) => entry.id === budget?.householdId) ?? null,
    [households, budget?.householdId],
  )

  const [feedback, setFeedback] = useState<BudgetFeedback | null>(
    () =>
      (location.state as { feedback?: BudgetFeedback } | null)?.feedback ??
      null,
  )

  const [isEditing, setIsEditing] = useState(false)

  const [totalLimitInput, setTotalLimitInput] = useState(
    formatAmountInput(String(budget?.totalLimitMinor ?? 0)),
  )

  useEffect(() => {
    if (isEditing) return

    setTotalLimitInput(formatAmountInput(String(budget?.totalLimitMinor ?? 0)))
  }, [budget?.totalLimitMinor, isEditing])

  const canEdit = useMemo(() => {
    if (!budget) return false
    if (budget.scope === 'household') {
      return budget.createdByUserId === currentUserId
    }
    if (budget.scope === 'personal') {
      return budget.ownerUserId === currentUserId
    }

    return false
  }, [budget, currentUserId])

  const handleUpdate = async (values: BudgetMutationFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: budget!.id,
        payload: buildBudgetMutationRequest(values),
      })

      impact('light')
      setFeedback({ message: 'Đã cập nhật ngân sách.', tone: 'success' })
      setIsEditing(false)
      await statusQuery.refetch()
    } catch {
      setFeedback({
        message: 'Không thể cập nhật ngân sách lúc này.',
        tone: 'error',
      })
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Xóa ngân sách này? Ngân sách sẽ biến mất khỏi danh sách đang hoạt động.',
    )

    if (!confirmed) return

    try {
      await deleteMutation.mutateAsync(budget!.id)

      impact('medium')

      navigate(TMA_PATHS.budgets, {
        replace: true,
        state: {
          feedback: { message: 'Đã xóa ngân sách.', tone: 'success' },
        },
      })
    } catch {
      setFeedback({
        message: 'Không thể xóa ngân sách lúc này.',
        tone: 'error',
      })
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const totalLimitMinor = parseBudgetAmountInputToMinor(totalLimitInput)

    if (!totalLimitMinor || totalLimitMinor <= 0) return

    handleUpdate({
      mode: 'edit',
      period: budget!.period,
      scope: budget!.scope,
      totalLimitMinor,
    })
  }

  if (!id) {
    return (
      <TmaPageShell title='Chi tiết ngân sách'>
        <Card>
          <CardTitle>Ngân sách không hợp lệ</CardTitle>
          <CardDescription>
            Đường dẫn hiện tại thiếu mã budget để tải chi tiết.
          </CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  const isBudgetMissing =
    !detailQuery.isLoading && !detailQuery.isError && !budget

  const progress = status
    ? getBudgetProgress(status.totalActualMinor, status.totalPlannedMinor)
    : null
  const isOver = status ? status.totalRemainingMinor < 0 : false

  return (
    <TmaPageShell title='Chi tiết ngân sách'>
      {feedback ? (
        <Card
          className={cn(
            'mb-3',
            feedback.tone === 'error'
              ? 'border-[#d93838]/20 bg-[#ffeded]/90'
              : 'border-tma-positive/20 bg-tma-positive/10',
          )}>
          <CardDescription
            className={
              feedback.tone === 'error' ? 'text-[#d93838]' : 'text-[#2f9b44]'
            }>
            {feedback.message}
          </CardDescription>
        </Card>
      ) : null}

      <DataState
        emptyDescription='Ngân sách này không còn tồn tại hoặc bạn không có quyền truy cập.'
        emptyTitle='Không tìm thấy ngân sách'
        errorDescription='Ngân sách này có thể không còn truy cập được, hoặc phiên đăng nhập hiện tại đã hết hạn.'
        errorTitle='Không tải được ngân sách'
        isEmpty={isBudgetMissing}
        isError={detailQuery.isError && !budget}
        isLoading={detailQuery.isLoading && !budget}
        loadingDescription='Thông tin ngân sách và tiến độ sẽ hiện ngay sau khi đồng bộ xong.'
        loadingTitle='Đang tải ngân sách'
        retryAction={detailQuery.refetch}>
        {budget ? (
          <>
            {/* Hero */}
            <Card className='grid gap-4 p-5'>
              <div className='flex items-start justify-between gap-3'>
                <div className='flex flex-wrap gap-1.5'>
                  <Chip tone='primary'>
                    {formatBudgetPeriodLabel(budget.period)}
                  </Chip>
                  <Chip
                    className={
                      budget.scope === 'personal'
                        ? 'bg-tma-warning/20 text-[#8a6800]'
                        : undefined
                    }
                    tone={budget.scope === 'personal' ? 'warning' : 'muted'}>
                    {getBudgetScopeLabel(budget.scope, household ?? undefined)}
                  </Chip>
                </div>
                <IconBadge accent={budgetAccent}>
                  <BudgetGlyph />
                </IconBadge>
              </div>
              <div>
                <Eyebrow>Tổng hạn mức</Eyebrow>
                <MoneyLabel className='text-[28px] leading-tight font-extrabold'>
                  {formatCurrencyMinor(
                    status?.totalPlannedMinor ?? budget.totalLimitMinor,
                    budget.currencyCode,
                  )}
                </MoneyLabel>
              </div>
            </Card>

            {/* Progress */}
            {status && progress ? (
              <Section>
                <SectionHeader title='Tiến độ' />
                <Card className='grid gap-4'>
                  <div className='grid grid-cols-2 gap-2.5'>
                    <StatTile
                      label='Đã chi'
                      value={formatCurrencyMinor(
                        status.totalActualMinor,
                        status.currencyCode,
                      )}
                    />
                    <StatTile
                      label='Còn lại'
                      tone={isOver ? 'warning' : 'default'}
                      value={formatCurrencyMinor(
                        status.totalRemainingMinor,
                        status.currencyCode,
                      )}
                    />
                  </div>

                  <div className='grid gap-1.5'>
                    <div className='flex items-center justify-between text-sm text-tma-text-muted'>
                      <span>Tiến độ ngân sách</span>
                      <span>{progress.percentUsed}%</span>
                    </div>
                    <div className='h-2 overflow-hidden rounded-full bg-black/[0.06]'>
                      <div
                        className={cn(
                          'h-full rounded-full',
                          isOver ? 'bg-[#d93838]' : 'bg-tma-primary',
                        )}
                        style={{ width: `${progress.widthPercent}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </Section>
            ) : null}

            {/* Management */}
            {canEdit ? (
              <Section>
                <SectionHeader title='Quản lý' />
                <Card>
                  <form className='grid gap-3.5' onSubmit={handleSubmit}>
                    <Field>
                      <FieldLabel>Tổng hạn mức</FieldLabel>
                      <Input
                        disabled={!isEditing || updateMutation.isPending}
                        inputMode='numeric'
                        value={totalLimitInput}
                        onChange={(event) =>
                          setTotalLimitInput(
                            formatAmountInput(event.target.value),
                          )
                        }
                      />
                    </Field>

                    {isEditing ? (
                      <div className='flex justify-end gap-2'>
                        <Button
                          disabled={updateMutation.isPending}
                          type='button'
                          variant='ghost'
                          onClick={() => {
                            setIsEditing(false)

                            setTotalLimitInput(
                              formatAmountInput(String(budget.totalLimitMinor)),
                            )
                          }}>
                          Huỷ
                        </Button>
                        <Button
                          disabled={updateMutation.isPending}
                          type='submit'
                          variant='secondary'>
                          {updateMutation.isPending
                            ? 'Đang lưu...'
                            : 'Lưu thay đổi'}
                        </Button>
                      </div>
                    ) : (
                      <div className='flex justify-end gap-2'>
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={() => setIsEditing(true)}>
                          Chỉnh sửa
                        </Button>
                        <Button
                          disabled={deleteMutation.isPending}
                          type='button'
                          variant='danger'
                          onClick={handleDelete}>
                          {deleteMutation.isPending ? 'Đang xoá...' : 'Xoá'}
                        </Button>
                      </div>
                    )}
                  </form>
                </Card>
              </Section>
            ) : null}
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
