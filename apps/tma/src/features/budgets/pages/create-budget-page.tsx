import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DatePicker } from '@/components/shared/date-picker'
import { NativePicker } from '@/components/shared/native-picker'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageFooter, TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
import type { BudgetFeedback, CreateBudgetRequest } from '../types'

const DEFAULT_CURRENCY_CODE = 'VND'
const PERSONAL_TARGET_VALUE = 'personal'

// ── dumb feedback (no outer margin, parent gap owns spacing) ──

function BudgetCreateFeedback({ feedback }: { feedback: BudgetFeedback }) {
  return (
    <Card size='sm'>
      <CardHeader>
        <CardDescription
          className={
            feedback.tone === 'error' ? 'text-destructive' : 'text-emerald-600'
          }>
          {feedback.message}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

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
    <TmaPageShell
      contentClassName='flex flex-col gap-4'
      footer={
        <TmaPageFooter>
          <TmaHapticButton
            aria-busy={isBusy}
            disabled={isBusy}
            type='button'
            variant='secondary'
            onClick={() => navigate(TMA_PATHS.budgets)}>
            {t('common.cancel')}
          </TmaHapticButton>
          <TmaHapticButton
            aria-busy={isBusy}
            disabled={isBusy}
            form='create-budget-form'
            type='submit'>
            {isBusy
              ? t('budgets.createPage.submitting')
              : t('budgets.createPage.title')}
          </TmaHapticButton>
        </TmaPageFooter>
      }
      title={t('budgets.createPage.title')}
      onRefresh={async () => {
        await householdsQuery.refetch()
      }}>
      {feedback ? <BudgetCreateFeedback feedback={feedback} /> : null}

      <Card size='sm'>
        <CardHeader>
          <CardTitle>{t('budgets.createPage.header')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-4'
            id='create-budget-form'
            onSubmit={handleSubmit}>
            <FieldGroup className='gap-4'>
              <Field>
                <FieldLabel htmlFor='create-budget-scope'>
                  {t('budgets.createPage.fieldScope')}
                </FieldLabel>
                <NativePicker
                  fullWidth
                  aria-label={t('budgets.createPage.scopePlaceholder')}
                  disabled={isBusy || householdsQuery.isLoading}
                  id='create-budget-scope'
                  options={targetOptions}
                  value={targetValue}
                  onChange={(next) => {
                    setTargetValue(next)
                    setFeedback(null)
                  }}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='create-budget-period'>
                  {t('budgets.createPage.fieldPeriod')}
                </FieldLabel>
                <DatePicker
                  fullWidth
                  aria-label={t('budgets.createPage.periodPlaceholder')}
                  disabled={isBusy}
                  id='create-budget-period'
                  mode='month'
                  value={period}
                  onChange={(next) => {
                    setPeriod(next)
                    setFeedback(null)
                  }}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='create-budget-amount'>
                  {t('budgets.createPage.fieldAmount')}
                </FieldLabel>
                <Input
                  disabled={isBusy}
                  id='create-budget-amount'
                  inputMode='numeric'
                  placeholder={t('budgets.createPage.amountPlaceholder')}
                  value={totalLimitInput}
                  onChange={(event) => {
                    setTotalLimitInput(formatAmountInput(event.target.value))
                    setFeedback(null)
                  }}
                />
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}

export { CreateBudgetPage }
