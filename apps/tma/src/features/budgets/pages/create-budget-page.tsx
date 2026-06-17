import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  DatePicker,
  Field,
  FieldLabel,
  Input,
  NativePicker,
} from '@/components/ui'
import { useHouseholdsQuery } from '@/features/home/api'
import { getBudgetDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'
import { getCurrentPeriod } from '@/lib/period'

import { useCreateBudgetMutation } from '../api'
import {
  BudgetMutationError,
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
  const { t } = useTranslation()
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

  const isPersonal = targetValue === PERSONAL_TARGET_VALUE
  const isBusy = createBudgetMutation.isPending
  const isHouseholdMissing = !isPersonal && !targetValue
  const targetOptions = useMemo(
    () => [
      { label: t('budgets.filterPersonal'), value: PERSONAL_TARGET_VALUE },
      ...adminHouseholds.map((household) => ({
        label: household.name,
        value: household.id,
      })),
    ],
    [adminHouseholds, t],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const totalLimitMinor = parseBudgetAmountInputToMinor(totalLimitInput)

    if (!isValidBudgetPeriod(period)) {
      setFeedback({
        message: t('budgets.validation.invalidPeriod'),
        tone: 'error',
      })

      return
    }

    if (!totalLimitMinor || totalLimitMinor <= 0) {
      setFeedback({
        message: t('budgets.validation.amountPositive'),
        tone: 'error',
      })

      return
    }

    if (totalLimitMinor > 999_999_999_999) {
      setFeedback({
        message: t('budgets.validation.amountTooLarge'),
        tone: 'error',
      })

      return
    }

    if (!isPersonal && isHouseholdMissing) {
      setFeedback({
        message: t('budgets.validation.householdRequired'),
        tone: 'error',
      })

      return
    }

    try {
      const created = await createBudgetMutation.mutateAsync(
        buildBudgetMutationRequest({
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
            message: t('budgets.createPage.created'),
            tone: 'success',
          },
        },
      })
    } catch (error) {
      if (error instanceof BudgetMutationError) {
        setFeedback({
          message: t(`budgets.errors.${error.code}`),
          tone: 'error',
        })
      } else {
        setFeedback({
          message: t('budgets.createPage.createError'),
          tone: 'error',
        })
      }
    }
  }

  return (
    <TmaPageShell title={t('budgets.createPage.title')}>
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
        <CardTitle className='mb-3'>{t('budgets.createPage.header')}</CardTitle>

        <Card>
          <form className='grid gap-3.5' onSubmit={handleSubmit}>
            <Field>
              <FieldLabel>{t('budgets.createPage.fieldScope')}</FieldLabel>
              <NativePicker
                fullWidth
                aria-label={t('budgets.createPage.scopePlaceholder')}
                disabled={isBusy || householdsQuery.isLoading}
                options={targetOptions}
                value={targetValue}
                onChange={(next) => {
                  setTargetValue(next)
                  setFeedback(null)
                }}
              />
            </Field>

            <Field>
              <FieldLabel>{t('budgets.createPage.fieldPeriod')}</FieldLabel>
              <DatePicker
                fullWidth
                aria-label={t('budgets.createPage.periodPlaceholder')}
                disabled={isBusy}
                mode='month'
                value={period}
                onChange={(next) => {
                  setPeriod(next)
                  setFeedback(null)
                }}
              />
            </Field>

            <Field>
              <FieldLabel>{t('budgets.createPage.fieldAmount')}</FieldLabel>
              <Input
                disabled={isBusy}
                inputMode='numeric'
                placeholder={t('budgets.createPage.amountPlaceholder')}
                value={totalLimitInput}
                onChange={(event) => {
                  setTotalLimitInput(formatAmountInput(event.target.value))
                  setFeedback(null)
                }}
              />
            </Field>

            <div className='flex flex-wrap justify-end gap-2.5'>
              <Button
                disabled={isBusy}
                type='button'
                variant='ghost'
                onClick={() => navigate(TMA_PATHS.budgets)}>
                {t('common.cancel')}
              </Button>
              <Button disabled={isBusy} type='submit' variant='secondary'>
                {isBusy
                  ? t('budgets.createPage.submitting')
                  : t('budgets.createPage.title')}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </TmaPageShell>
  )
}

export { CreateBudgetPage }
