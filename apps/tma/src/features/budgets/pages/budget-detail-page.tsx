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
  Input,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import { useAuthStore } from '@/features/auth/store'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
} from '@/features/home/presentation'
import type { ReferenceCategoryDTO } from '@/features/home/types'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'
import { impact } from '@/lib/telegram/haptics'

import {
  useBudgetDetailQuery,
  useBudgetStatusQuery,
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from '../api'
import {
  BudgetCategoryLimitFields,
  type CategoryLimitInputMap,
  getExpenseBudgetCategories,
} from '../components/budget-category-limit-fields'
import {
  buildBudgetMutationRequest,
  buildCategoryLimitMap,
  formatBudgetPeriodLabel,
  getBudgetProgress,
  getBudgetScopeLabel,
  getBudgetStatusCopy,
  parseBudgetAmountInputToMinor,
} from '../presentation'
import type { BudgetCategoryLimitDTO, BudgetThresholdStatus } from '../types'

type BudgetFeedback = {
  message: string
  tone: 'error' | 'success'
}

const toCategoryLimitInputs = (
  limits: BudgetCategoryLimitDTO[],
): CategoryLimitInputMap => {
  const map = buildCategoryLimitMap(limits)

  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [
      key,
      formatAmountInput(String(value)),
    ]),
  ) as CategoryLimitInputMap
}

const toCategoryLimits = (
  inputs: CategoryLimitInputMap,
): BudgetCategoryLimitDTO[] =>
  Object.entries(inputs)
    .map(([categoryKey, value]) => ({
      categoryKey: categoryKey as BudgetCategoryLimitDTO['categoryKey'],
      limitMinor: parseBudgetAmountInputToMinor(value ?? '') ?? 0,
    }))
    .filter((limit) => limit.limitMinor > 0)

const statusTone = (status: BudgetThresholdStatus) =>
  getBudgetStatusCopy(status).tone

const isReferenceCategoryDTO = (
  value: ReferenceCategoryDTO | undefined,
): value is ReferenceCategoryDTO => value !== undefined

export const BudgetDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const budgetQuery = useBudgetDetailQuery(id)
  const statusQuery = useBudgetStatusQuery(id)
  const householdsQuery = useHouseholdsQuery()
  const categoriesQuery = useReferenceCategoriesQuery()
  const updateBudgetMutation = useUpdateBudgetMutation()
  const deleteBudgetMutation = useDeleteBudgetMutation()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const [feedback, setFeedback] = useState<BudgetFeedback | null>(
    () =>
      (location.state as { feedback?: BudgetFeedback } | null)?.feedback ??
      null,
  )
  const [isEditing, setIsEditing] = useState(false)
  const [totalLimitInput, setTotalLimitInput] = useState('')
  const [categoryLimitInputs, setCategoryLimitInputs] =
    useState<CategoryLimitInputMap>({})

  const budget = budgetQuery.data
  const status = statusQuery.data
  const households = householdsQuery.data?.items ?? []
  const household = households.find(
    (candidate) => candidate.id === budget?.householdId,
  )
  const canManage =
    budget?.scope === 'personal'
      ? budget.ownerUserId === currentUserId
      : household?.role === 'admin'
  const expenseCategories = getExpenseBudgetCategories(
    categoriesQuery.data?.items ?? [],
  )
  const categoryByKey = useMemo(
    () =>
      new Map(expenseCategories.map((category) => [category.key, category])),
    [expenseCategories],
  )
  const isBudgetMissing =
    !budgetQuery.isLoading && !budgetQuery.isError && !budget

  useEffect(() => {
    if (!budget || isEditing) return

    setTotalLimitInput(formatAmountInput(String(budget.totalLimitMinor)))
    setCategoryLimitInputs(toCategoryLimitInputs(budget.categoryLimits))
  }, [budget, isEditing])

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!budget) return

    const totalLimitMinor = parseBudgetAmountInputToMinor(totalLimitInput)

    if (!totalLimitMinor || totalLimitMinor <= 0) {
      setFeedback({ message: 'Tổng ngân sách phải lớn hơn 0.', tone: 'error' })

      return
    }

    if (totalLimitMinor > 999_999_999_999) {
      setFeedback({ message: 'Tổng ngân sách quá lớn.', tone: 'error' })

      return
    }

    const categoryLimits = toCategoryLimits(categoryLimitInputs)
    const categoryLimitTotal = categoryLimits.reduce(
      (sum, limit) => sum + limit.limitMinor,
      0,
    )

    if (categoryLimitTotal > totalLimitMinor) {
      setFeedback({
        message: 'Tổng hạn mức danh mục không nên vượt tổng ngân sách.',
        tone: 'error',
      })

      return
    }

    try {
      await updateBudgetMutation.mutateAsync({
        id: budget.id,
        payload: buildBudgetMutationRequest({
          categoryLimits,
          currencyCode: budget.currencyCode,
          householdId: budget.householdId ?? undefined,
          mode: 'edit',
          period: budget.period,
          scope: budget.scope,
          totalLimitMinor,
        }),
      })

      impact('light')
      setFeedback({ message: 'Đã cập nhật ngân sách.', tone: 'success' })
      setIsEditing(false)
      await statusQuery.refetch()
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể cập nhật ngân sách lúc này.',
        tone: 'error',
      })
    }
  }

  const handleDelete = async () => {
    if (!budget) return

    const confirmed = window.confirm(
      'Xóa ngân sách này? Budget sẽ biến mất khỏi danh sách active.',
    )

    if (!confirmed) return

    try {
      await deleteBudgetMutation.mutateAsync(budget.id)
      impact('medium')

      navigate(TMA_PATHS.budgets, {
        replace: true,
        state: {
          feedback: {
            message: 'Đã xóa ngân sách.',
            tone: 'success',
          },
        },
      })
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể xóa ngân sách lúc này.',
        tone: 'error',
      })
    }
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

  const progress = status
    ? getBudgetProgress(status.totalActualMinor, status.totalPlannedMinor)
    : null
  const statusCopy = status ? getBudgetStatusCopy(status.totalStatus) : null

  return (
    <TmaPageShell title='Chi tiết ngân sách'>
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
        emptyDescription='Ngân sách này không còn tồn tại hoặc bạn không có quyền truy cập.'
        emptyTitle='Không tìm thấy ngân sách'
        errorDescription='Budget này có thể không còn truy cập được, hoặc phiên đăng nhập hiện tại đã hết hạn.'
        errorTitle='Không tải được ngân sách'
        isEmpty={isBudgetMissing}
        isError={budgetQuery.isError && !budget}
        isLoading={budgetQuery.isLoading && !budget}
        loadingDescription='Thông tin budget và status sẽ hiện ngay sau khi đồng bộ xong.'
        loadingTitle='Đang tải ngân sách'
        retryAction={budgetQuery.refetch}>
        {budget ? (
          <>
            <Card className='grid gap-4 p-5'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <Eyebrow>
                    {getBudgetScopeLabel(budget.scope, household)}
                  </Eyebrow>
                  <h1 className='m-0 mt-1 text-2xl leading-tight font-extrabold text-tma-text-strong'>
                    {formatBudgetPeriodLabel(budget.period)}
                  </h1>
                  <CardDescription className='mt-2'>
                    {budget.categoryLimits.length > 0
                      ? `${budget.categoryLimits.length} danh mục có hạn mức riêng`
                      : 'Ngân sách tổng, chưa chia theo danh mục'}
                  </CardDescription>
                </div>
                <Chip tone={canManage ? 'success' : 'muted'}>
                  {canManage ? 'Có quyền sửa' : 'Chỉ xem'}
                </Chip>
              </div>

              <div className='grid grid-cols-2 gap-2.5'>
                <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
                  <Eyebrow>Limit</Eyebrow>
                  <MoneyLabel className='text-base font-extrabold'>
                    {formatCurrencyMinor(
                      budget.totalLimitMinor,
                      budget.currencyCode,
                    )}
                  </MoneyLabel>
                </div>
                <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
                  <Eyebrow>Danh mục</Eyebrow>
                  <strong className='text-base text-tma-text-strong'>
                    {budget.categoryLimits.length}
                  </strong>
                </div>
              </div>
            </Card>

            <Section>
              <SectionHeader title='Planned vs Actual' />
              <DataState
                errorDescription='Không tải được trạng thái planned vs actual.'
                errorTitle='Status đang lỗi'
                isError={statusQuery.isError && !status}
                isLoading={statusQuery.isLoading && !status}
                loadingDescription='Actual spend và threshold sẽ hiện sau khi API trả dữ liệu.'
                loadingTitle='Đang tải budget status'
                retryAction={statusQuery.refetch}>
                {status ? (
                  <Card className='grid gap-4'>
                    <div className='flex items-center justify-between gap-3'>
                      <div>
                        <Eyebrow>Threshold</Eyebrow>
                        <CardTitle>{statusCopy?.label}</CardTitle>
                      </div>
                      <Chip tone={statusCopy?.tone ?? 'muted'}>
                        {status.totalPercentUsed}%
                      </Chip>
                    </div>

                    <div className='grid grid-cols-3 gap-2'>
                      <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
                        <Eyebrow>Planned</Eyebrow>
                        <MoneyLabel className='text-sm font-bold'>
                          {formatCurrencyMinor(
                            status.totalPlannedMinor,
                            status.currencyCode,
                          )}
                        </MoneyLabel>
                      </div>
                      <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
                        <Eyebrow>Actual</Eyebrow>
                        <MoneyLabel className='text-sm font-bold'>
                          {formatCurrencyMinor(
                            status.totalActualMinor,
                            status.currencyCode,
                          )}
                        </MoneyLabel>
                      </div>
                      <div className='grid gap-1 rounded-[18px] bg-black/[0.04] p-3'>
                        <Eyebrow>Còn lại</Eyebrow>
                        <MoneyLabel
                          className={
                            status.totalRemainingMinor < 0
                              ? 'text-sm font-bold text-[#d93838]'
                              : 'text-sm font-bold'
                          }>
                          {formatCurrencyMinor(
                            status.totalRemainingMinor,
                            status.currencyCode,
                          )}
                        </MoneyLabel>
                      </div>
                    </div>

                    {progress ? (
                      <div className='grid gap-1.5'>
                        <div className='flex items-center justify-between text-sm text-tma-text-muted'>
                          <span>Tiến độ tháng</span>
                          <span>{progress.percentUsed}%</span>
                        </div>
                        <div className='h-2 overflow-hidden rounded-full bg-black/[0.06]'>
                          <div
                            className={
                              progress.isExceeded
                                ? 'h-full rounded-full bg-[#d93838]'
                                : 'h-full rounded-full bg-tma-primary'
                            }
                            style={{ width: `${progress.widthPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </Card>
                ) : null}
              </DataState>
            </Section>

            <Section>
              <SectionHeader title='Theo danh mục' />
              <Card className='grid gap-2'>
                {(status?.categoryStatuses.length
                  ? status.categoryStatuses
                  : budget.categoryLimits.map((limit) => ({
                      actualSpendMinor: 0,
                      categoryKey: limit.categoryKey,
                      percentUsed: 0,
                      plannedLimitMinor: limit.limitMinor,
                      remainingMinor: limit.limitMinor,
                      status: 'ok' as const,
                    }))
                ).map((limit) => {
                  const category = getCategoryPresentation(
                    limit.categoryKey,
                    [categoryByKey.get(limit.categoryKey)].filter(
                      isReferenceCategoryDTO,
                    ),
                  )
                  const categoryProgress = getBudgetProgress(
                    limit.actualSpendMinor,
                    limit.plannedLimitMinor,
                  )

                  return (
                    <article
                      key={limit.categoryKey}
                      className='grid gap-2 rounded-[18px] bg-black/[0.04] p-3'>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='min-w-0'>
                          <h3 className='m-0 truncate text-sm font-bold text-tma-text-strong'>
                            {category.label}
                          </h3>
                          <CardDescription>
                            Actual{' '}
                            {formatCurrencyMinor(
                              limit.actualSpendMinor,
                              budget.currencyCode,
                            )}{' '}
                            / planned{' '}
                            {formatCurrencyMinor(
                              limit.plannedLimitMinor,
                              budget.currencyCode,
                            )}
                          </CardDescription>
                        </div>
                        <Chip tone={statusTone(limit.status)}>
                          {limit.percentUsed}%
                        </Chip>
                      </div>
                      <div className='h-1.5 overflow-hidden rounded-full bg-black/[0.06]'>
                        <div
                          className={
                            categoryProgress.isExceeded
                              ? 'h-full rounded-full bg-[#d93838]'
                              : 'h-full rounded-full bg-tma-primary'
                          }
                          style={{
                            width: `${categoryProgress.widthPercent}%`,
                          }}
                        />
                      </div>
                    </article>
                  )
                })}
                {budget.categoryLimits.length === 0 ? (
                  <CardDescription>
                    Budget này chưa đặt hạn mức danh mục riêng.
                  </CardDescription>
                ) : null}
              </Card>
            </Section>

            {canManage ? (
              <Section>
                <SectionHeader
                  action={
                    !isEditing ? (
                      <Button
                        size='sm'
                        type='button'
                        variant='outline'
                        onClick={() => {
                          setIsEditing(true)
                          setFeedback(null)
                        }}>
                        Sửa
                      </Button>
                    ) : null
                  }
                  title='Quản lý'
                />
                {isEditing ? (
                  <Card>
                    <form className='grid gap-3.5' onSubmit={handleUpdate}>
                      <Field>
                        <FieldLabel>Tháng ngân sách</FieldLabel>
                        <Input disabled value={budget.period} />
                      </Field>
                      <Field>
                        <FieldLabel>Tổng ngân sách</FieldLabel>
                        <Input
                          disabled={updateBudgetMutation.isPending}
                          inputMode='numeric'
                          value={totalLimitInput}
                          onChange={(event) => {
                            setTotalLimitInput(
                              formatAmountInput(event.target.value),
                            )

                            setFeedback(null)
                          }}
                        />
                      </Field>
                      <BudgetCategoryLimitFields
                        disabled={updateBudgetMutation.isPending}
                        inputs={categoryLimitInputs}
                        referenceCategories={expenseCategories}
                        onChange={(next) => {
                          setCategoryLimitInputs(next)
                          setFeedback(null)
                        }}
                      />
                      <div className='flex flex-wrap justify-end gap-2.5'>
                        <Button
                          disabled={updateBudgetMutation.isPending}
                          type='button'
                          variant='ghost'
                          onClick={() => {
                            setIsEditing(false)
                            setFeedback(null)

                            setTotalLimitInput(
                              formatAmountInput(String(budget.totalLimitMinor)),
                            )

                            setCategoryLimitInputs(
                              toCategoryLimitInputs(budget.categoryLimits),
                            )
                          }}>
                          Hủy
                        </Button>
                        <Button
                          disabled={updateBudgetMutation.isPending}
                          type='submit'
                          variant='secondary'>
                          {updateBudgetMutation.isPending
                            ? 'Đang lưu...'
                            : 'Lưu thay đổi'}
                        </Button>
                      </div>
                    </form>
                  </Card>
                ) : (
                  <Card className='grid gap-3'>
                    <Button
                      disabled={deleteBudgetMutation.isPending}
                      type='button'
                      variant='ghost'
                      onClick={handleDelete}>
                      {deleteBudgetMutation.isPending
                        ? 'Đang xóa...'
                        : 'Xóa ngân sách'}
                    </Button>
                  </Card>
                )}
              </Section>
            ) : null}
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
