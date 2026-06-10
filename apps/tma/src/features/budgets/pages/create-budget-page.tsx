import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Eyebrow,
  Field,
  FieldLabel,
  Input,
} from '@/components/ui'
import {
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import { getBudgetDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'
import { getCurrentPeriod } from '@/lib/period'
import { cn } from '@/lib/utils'

import { useCreateBudgetMutation } from '../api'
import {
  BudgetCategoryLimitFields,
  type CategoryLimitInputMap,
  getExpenseBudgetCategories,
} from '../components/budget-category-limit-fields'
import {
  buildBudgetMutationRequest,
  isValidBudgetPeriod,
  parseBudgetAmountInputToMinor,
} from '../presentation'
import type { BudgetCategoryLimitDTO, CreateBudgetRequest } from '../types'

type BudgetFeedback = {
  message: string
  tone: 'error' | 'success'
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

export const CreateBudgetPage = () => {
  const navigate = useNavigate()
  const householdsQuery = useHouseholdsQuery()
  const categoriesQuery = useReferenceCategoriesQuery()
  const createBudgetMutation = useCreateBudgetMutation()
  const [householdId, setHouseholdId] = useState('')
  const [period, setPeriod] = useState(getCurrentPeriod())
  const [totalLimitInput, setTotalLimitInput] = useState('')
  const [categoryLimitInputs, setCategoryLimitInputs] =
    useState<CategoryLimitInputMap>({})
  const [feedback, setFeedback] = useState<BudgetFeedback | null>(null)

  const adminHouseholds = useMemo(
    () =>
      (householdsQuery.data?.items ?? []).filter(
        (household) => household.role === 'admin',
      ),
    [householdsQuery.data?.items],
  )
  const expenseCategories = getExpenseBudgetCategories(
    categoriesQuery.data?.items ?? [],
  )
  const isBusy = createBudgetMutation.isPending

  useEffect(() => {
    if (!householdId && adminHouseholds[0]) {
      setHouseholdId(adminHouseholds[0].id)
    }
  }, [adminHouseholds, householdId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const totalLimitMinor = parseBudgetAmountInputToMinor(totalLimitInput)

    if (!householdId) {
      setFeedback({
        message: 'Bạn cần quyền admin trong household để tạo ngân sách.',
        tone: 'error',
      })

      return
    }

    if (!isValidBudgetPeriod(period)) {
      setFeedback({
        message: 'Kỳ ngân sách phải có dạng YYYY-MM.',
        tone: 'error',
      })

      return
    }

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
      const created = await createBudgetMutation.mutateAsync(
        buildBudgetMutationRequest({
          categoryLimits,
          householdId,
          mode: 'create',
          period,
          totalLimitMinor,
        }) as CreateBudgetRequest,
      )

      navigate(getBudgetDetailPath(created.id), {
        replace: true,
        state: {
          feedback: {
            message: 'Đã tạo ngân sách thành công.',
            tone: 'success',
          },
        },
      })
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể tạo ngân sách lúc này.',
        tone: 'error',
      })
    }
  }

  return (
    <TmaPageShell title='Tạo ngân sách'>
      <Card className='grid gap-2 p-5'>
        <Eyebrow>Monthly budget</Eyebrow>
        <strong className='text-2xl font-extrabold text-tma-text-strong'>
          Ngân sách household
        </strong>
        <CardDescription>
          Budget API hiện quản lý theo household và theo tháng. Group budget nằm
          trong tính năng Group.
        </CardDescription>
      </Card>

      {feedback ? (
        <Card
          className={
            feedback.tone === 'error'
              ? 'mt-3 border-[#d93838]/20 bg-[#ffeded]/90'
              : 'mt-3 border-tma-positive/20 bg-tma-positive/10'
          }>
          <CardDescription
            className={
              feedback.tone === 'error' ? 'text-[#d93838]' : 'text-[#2f9b44]'
            }>
            {feedback.message}
          </CardDescription>
        </Card>
      ) : null}

      <section className='mt-6'>
        <div className='mb-3'>
          <Eyebrow>Thiết lập</Eyebrow>
          <CardTitle>Ngân sách mới</CardTitle>
        </div>

        <Card>
          <form className='grid gap-3.5' onSubmit={handleSubmit}>
            <Field>
              <FieldLabel>Household</FieldLabel>
              <select
                className={cn(
                  'min-h-14 w-full rounded-[18px] border border-tma-line bg-black/[0.04] px-4 text-base text-tma-text-strong transition outline-none focus:border-tma-primary/30 focus:ring-4 focus:ring-tma-primary/10 disabled:opacity-70',
                )}
                disabled={isBusy || householdsQuery.isLoading}
                value={householdId}
                onChange={(event) => {
                  setHouseholdId(event.target.value)
                  setFeedback(null)
                }}>
                {adminHouseholds.length === 0 ? (
                  <option value=''>Không có household admin</option>
                ) : null}
                {adminHouseholds.map((household) => (
                  <option key={household.id} value={household.id}>
                    {household.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel>Tháng ngân sách</FieldLabel>
              <Input
                disabled={isBusy}
                type='month'
                value={period}
                onChange={(event) => {
                  setPeriod(event.target.value)
                  setFeedback(null)
                }}
              />
            </Field>

            <Field>
              <FieldLabel>Tổng ngân sách</FieldLabel>
              <Input
                disabled={isBusy}
                inputMode='numeric'
                placeholder='Ví dụ: 12.000.000'
                value={totalLimitInput}
                onChange={(event) => {
                  setTotalLimitInput(formatAmountInput(event.target.value))
                  setFeedback(null)
                }}
              />
            </Field>

            <BudgetCategoryLimitFields
              disabled={isBusy || categoriesQuery.isLoading}
              inputs={categoryLimitInputs}
              referenceCategories={expenseCategories}
              onChange={(next) => {
                setCategoryLimitInputs(next)
                setFeedback(null)
              }}
            />

            <CardDescription>
              Chỉ household admin mới tạo hoặc sửa ngân sách. Hạn mức danh mục
              dùng catalog expense hiện có.
            </CardDescription>

            <div className='flex flex-wrap justify-end gap-2.5'>
              <Button
                disabled={isBusy}
                type='button'
                variant='ghost'
                onClick={() => navigate(TMA_PATHS.budgets)}>
                Hủy
              </Button>
              <Button disabled={isBusy} type='submit' variant='secondary'>
                {isBusy ? 'Đang tạo...' : 'Tạo ngân sách'}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </TmaPageShell>
  )
}
