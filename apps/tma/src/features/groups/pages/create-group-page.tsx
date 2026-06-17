import { type FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Field,
  FieldLabel,
  Input,
  Textarea,
} from '@/components/ui'
import { DatePicker } from '@/components/ui/date-picker'
import {
  NativePicker,
  type NativePickerOption,
} from '@/components/ui/native-picker'
import { useHouseholdsQuery } from '@/features/home/api'
import { getGroupDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'

import { useCreateExpenseGroupMutation } from '../api'
import {
  parseBudgetInputToMinor,
  parseOptionalDateInput,
} from '../presentation'

type GroupPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

const PERSONAL_CONTEXT_VALUE = 'personal'

export const CreateGroupPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const householdsQuery = useHouseholdsQuery()
  const createGroupMutation = useCreateExpenseGroupMutation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [budgetInput, setBudgetInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [contextValue, setContextValue] = useState(PERSONAL_CONTEXT_VALUE)
  const [feedback, setFeedback] = useState<GroupPageFeedback | null>(null)

  const adminHouseholds = useMemo(
    () =>
      (householdsQuery.data?.items ?? []).filter(
        (household) => household.role === 'admin',
      ),
    [householdsQuery.data?.items],
  )
  const contextOptions: NativePickerOption[] = useMemo(
    () => [
      { value: PERSONAL_CONTEXT_VALUE, label: t('groups.contextPersonal') },
      ...adminHouseholds.map((h) => ({ value: h.id, label: h.name })),
    ],
    [adminHouseholds, t],
  )
  const isBusy = createGroupMutation.isPending
  const normalizedName = name.trim()
  const normalizedDescription = description.trim()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedStartDate = parseOptionalDateInput(startDate)
    const parsedEndDate = parseOptionalDateInput(endDate)
    const parsedBudget = parseBudgetInputToMinor(budgetInput)

    if (!normalizedName) {
      setFeedback({
        message: t('groups.createPage.validation.nameRequired'),
        tone: 'error',
      })

      return
    }

    if (normalizedName.length > 200) {
      setFeedback({
        message: t('groups.createPage.validation.nameMaxLength'),
        tone: 'error',
      })

      return
    }

    if (normalizedDescription.length > 1000) {
      setFeedback({
        message: t('groups.createPage.validation.descriptionMaxLength'),
        tone: 'error',
      })

      return
    }

    if (
      parsedStartDate !== undefined &&
      parsedEndDate !== undefined &&
      parsedEndDate < parsedStartDate
    ) {
      setFeedback({
        message: t('groups.createPage.validation.endBeforeStart'),
        tone: 'error',
      })

      return
    }

    if (parsedBudget !== undefined && parsedBudget <= 0) {
      setFeedback({
        message: t('groups.createPage.validation.budgetPositive'),
        tone: 'error',
      })

      return
    }

    if (parsedBudget !== undefined && parsedBudget > 999_999_999_999) {
      setFeedback({
        message: t('groups.createPage.validation.budgetTooLarge'),
        tone: 'error',
      })

      return
    }

    try {
      const created = await createGroupMutation.mutateAsync({
        name: normalizedName,
        ...(normalizedDescription
          ? { description: normalizedDescription }
          : {}),
        ...(parsedStartDate !== undefined
          ? { startDate: parsedStartDate }
          : {}),
        ...(parsedEndDate !== undefined ? { endDate: parsedEndDate } : {}),
        ...(parsedBudget !== undefined ? { eventBudget: parsedBudget } : {}),
        ...(contextValue !== PERSONAL_CONTEXT_VALUE
          ? { householdId: contextValue }
          : {}),
      })

      navigate(getGroupDetailPath(created.id), {
        replace: true,
        state: {
          feedback: {
            message: t('groups.createPage.created'),
            tone: 'success',
          },
        },
      })
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : t('groups.createPage.createError'),
        tone: 'error',
      })
    }
  }

  return (
    <TmaPageShell title={t('groups.createPage.title')}>
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
        <CardTitle className='mb-3'>{t('groups.createPage.header')}</CardTitle>

        <Card>
          <form className='grid gap-3.5' onSubmit={handleSubmit}>
            <Field>
              <FieldLabel>{t('groups.createPage.fieldName')}</FieldLabel>
              <Input
                disabled={isBusy}
                maxLength={200}
                placeholder={t('groups.createPage.namePlaceholder')}
                type='text'
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setFeedback(null)
                }}
              />
            </Field>

            <Field>
              <FieldLabel>{t('groups.createPage.fieldContext')}</FieldLabel>
              <NativePicker
                fullWidth
                aria-label={t('groups.createPage.contextPlaceholder')}
                disabled={isBusy || householdsQuery.isLoading}
                options={contextOptions}
                value={contextValue}
                onChange={(next) => {
                  setContextValue(next)
                  setFeedback(null)
                }}
              />
            </Field>

            <Field>
              <FieldLabel>{t('groups.createPage.fieldDescription')}</FieldLabel>
              <Textarea
                disabled={isBusy}
                maxLength={1000}
                placeholder={t('groups.createPage.descriptionHelp')}
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                  setFeedback(null)
                }}
              />
            </Field>

            <div className='grid gap-3.5'>
              <Field>
                <FieldLabel>{t('groups.createPage.fieldStartDate')}</FieldLabel>
                <DatePicker
                  fullWidth
                  aria-label={t('groups.createPage.startDatePlaceholder')}
                  disabled={isBusy}
                  value={startDate}
                  onChange={(next) => {
                    setStartDate(next)
                    setFeedback(null)
                  }}
                />
              </Field>

              <Field>
                <FieldLabel>{t('groups.createPage.fieldEndDate')}</FieldLabel>
                <DatePicker
                  fullWidth
                  aria-label={t('groups.createPage.endDatePlaceholder')}
                  disabled={isBusy}
                  value={endDate}
                  onChange={(next) => {
                    setEndDate(next)
                    setFeedback(null)
                  }}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>{t('groups.createPage.fieldBudget')}</FieldLabel>
              <Input
                disabled={isBusy}
                inputMode='numeric'
                placeholder={t('groups.createPage.budgetPlaceholder')}
                value={budgetInput}
                onChange={(event) => {
                  setBudgetInput(formatAmountInput(event.target.value))
                  setFeedback(null)
                }}
              />
            </Field>

            <CardDescription>
              {t('groups.createPage.householdNote')}
            </CardDescription>

            <div className='flex flex-wrap justify-end gap-2.5'>
              <Button
                disabled={isBusy}
                type='button'
                variant='ghost'
                onClick={() => navigate(TMA_PATHS.groups)}>
                {t('common.cancel')}
              </Button>

              <Button disabled={isBusy} type='submit' variant='secondary'>
                {isBusy
                  ? t('groups.createPage.submitting')
                  : t('groups.createPage.title')}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </TmaPageShell>
  )
}
