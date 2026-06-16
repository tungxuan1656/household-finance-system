import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  DatePicker,
  Eyebrow,
  Field,
  FieldLabel,
  Input,
} from '@/components/ui'
import { useHouseholdsQuery } from '@/features/home/api'
import { getBudgetDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'
import { getCurrentPeriod } from '@/lib/period'
import { cn } from '@/lib/utils'

import { useCreateBudgetMutation } from '../api'
import {
  buildBudgetMutationRequest,
  isValidBudgetPeriod,
  parseBudgetAmountInputToMinor,
} from '../presentation'
import type { CreateBudgetRequest } from '../types'

type BudgetFeedback = {
  message: string
  tone: 'error' | 'success'
}

const DEFAULT_CURRENCY_CODE = 'VND'
const PERSONAL_TARGET_VALUE = 'personal'

const CreateBudgetPage = () => {
  const navigate = useNavigate()
  const householdsQuery = useHouseholdsQuery()
  const createBudgetMutation = useCreateBudgetMutation()
  const [targetValue, setTargetValue] = useState<string>(PERSONAL_TARGET_VALUE)
  const [period, setPeriod] = useState(getCurrentPeriod())
  const [totalLimitInput, setTotalLimitInput] = useState('')
  const [feedback, setFeedback] = useState<BudgetFeedback | null>(null)

  const adminHouseholds = useMemo(
    () =>
      (householdsQuery.data?.items ?? []).filter(
        (household) => household.role === 'admin',
      ),
    [householdsQuery.data?.items],
  )

  useEffect(() => {
    if (targetValue === PERSONAL_TARGET_VALUE) {
      return
    }

    const stillValid = adminHouseholds.some(
      (household) => household.id === targetValue,
    )

    if (!stillValid) {
      setTargetValue(PERSONAL_TARGET_VALUE)
    }
  }, [adminHouseholds, targetValue])

  useEffect(() => {
    if (targetValue !== PERSONAL_TARGET_VALUE) {
      return
    }

    const first = adminHouseholds[0]

    if (first) {
      setTargetValue(first.id)
    }
  }, [adminHouseholds, targetValue])

  const isPersonal = targetValue === PERSONAL_TARGET_VALUE
  const isBusy = createBudgetMutation.isPending
  const isHouseholdMissing = !isPersonal && !targetValue
  const targetOptions = useMemo(
    () => [
      { label: 'Cá nhân', value: PERSONAL_TARGET_VALUE },
      ...adminHouseholds.map((household) => ({
        label: household.name,
        value: household.id,
      })),
    ],
    [adminHouseholds],
  )
  const selectedHousehold = useMemo(
    () =>
      isPersonal
        ? undefined
        : adminHouseholds.find((household) => household.id === targetValue),
    [adminHouseholds, isPersonal, targetValue],
  )
  const heroTitle = isPersonal
    ? 'Ngân sách cá nhân'
    : `Ngân sách ${selectedHousehold?.name ?? ''}`.trim()
  const heroDescription = isPersonal
    ? 'Budget cá nhân dùng VND làm mã tiền tệ mặc định và quản lý theo tháng.'
    : 'Budget household lấy mã tiền tệ từ household và quản lý theo tháng. Chỉ admin mới tạo được.'
  const helperCopy = isPersonal
    ? 'Ngân sách cá nhân dùng VND. Chỉ đặt tổng ngân sách tháng.'
    : 'Chỉ household admin mới tạo hoặc sửa ngân sách. Chỉ đặt tổng ngân sách tháng.'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const totalLimitMinor = parseBudgetAmountInputToMinor(totalLimitInput)

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

    if (!isPersonal && isHouseholdMissing) {
      setFeedback({
        message: 'Bạn cần chọn household hợp lệ để tạo ngân sách.',
        tone: 'error',
      })

      return
    }

    try {
      const created = await createBudgetMutation.mutateAsync(
        buildBudgetMutationRequest({
          categoryLimits: [],
          currencyCode: DEFAULT_CURRENCY_CODE,
          householdId: isPersonal ? undefined : targetValue,
          mode: 'create',
          period,
          scope: isPersonal ? 'personal' : 'household',
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
          {heroTitle}
        </strong>
        <CardDescription>{heroDescription}</CardDescription>
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
              <FieldLabel>Phạm vi ngân sách</FieldLabel>
              <select
                className={cn(
                  'min-h-14 w-full rounded-[18px] border border-tma-line bg-black/[0.04] px-4 text-base text-tma-text-strong transition outline-none focus:border-tma-primary/30 focus:ring-4 focus:ring-tma-primary/10 disabled:opacity-70',
                )}
                disabled={isBusy || householdsQuery.isLoading}
                value={targetValue}
                onChange={(event) => {
                  setTargetValue(event.target.value)
                  setFeedback(null)
                }}>
                {targetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel>Tháng ngân sách</FieldLabel>
              <DatePicker
                aria-label='Chọn tháng ngân sách'
                disabled={isBusy}
                fullWidth
                mode='month'
                value={period}
                onChange={(next) => {
                  setPeriod(next)
                  setFeedback(null)
                }}
              />
            </Field>

            <Field>
              <FieldLabel>Tổng ngân sách (VND)</FieldLabel>
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

            <CardDescription>{helperCopy}</CardDescription>

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

export { CreateBudgetPage }
