import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Card, CardDescription } from '@/components/ui'
import { useHouseholdsQuery } from '@/features/home/api'
import { getGroupDetailPath, TMA_PATHS } from '@/lib/constants/routes'

import { useCreateExpenseGroupMutation } from '../api'
import { CreateGroupForm } from '../components/create-group-form'
import { validateCreateGroupInput } from '../create-group-validation'
import {
  parseBudgetInputToMinor,
  parseOptionalDateInput,
} from '../presentation'

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
  const [feedback, setFeedback] = useState<{
    message: string
    tone: 'error' | 'success'
  } | null>(null)

  const adminHouseholds = useMemo(
    () =>
      (householdsQuery.data?.items ?? []).filter(
        (household) => household.role === 'admin',
      ),
    [householdsQuery.data?.items],
  )
  const contextOptions = useMemo(
    () => [
      { value: PERSONAL_CONTEXT_VALUE, label: t('groups.contextPersonal') },
      ...adminHouseholds.map((h) => ({ value: h.id, label: h.name })),
    ],
    [adminHouseholds, t],
  )
  const isBusy = createGroupMutation.isPending
  const normalizedName = name.trim()
  const normalizedDescription = description.trim()

  const handleSubmit = async () => {
    const parsedStartDate = parseOptionalDateInput(startDate)
    const parsedEndDate = parseOptionalDateInput(endDate)
    const parsedBudget = parseBudgetInputToMinor(budgetInput)

    const validationError = validateCreateGroupInput(
      { budgetInput, description, endDate, name, startDate },
      t,
    )

    if (validationError) {
      setFeedback(validationError)

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

      <CreateGroupForm
        budgetInput={budgetInput}
        contextOptions={contextOptions}
        contextValue={contextValue}
        description={description}
        endDate={endDate}
        isBusy={isBusy}
        isHouseholdsLoading={householdsQuery.isLoading}
        name={name}
        startDate={startDate}
        onBudgetChange={(v) => {
          setBudgetInput(v)
          setFeedback(null)
        }}
        onCancel={() => navigate(TMA_PATHS.groups)}
        onContextChange={(v) => {
          setContextValue(v)
          setFeedback(null)
        }}
        onDescriptionChange={(v) => {
          setDescription(v)
          setFeedback(null)
        }}
        onEndDateChange={(v) => {
          setEndDate(v)
          setFeedback(null)
        }}
        onNameChange={(v) => {
          setName(v)
          setFeedback(null)
        }}
        onStartDateChange={(v) => {
          setStartDate(v)
          setFeedback(null)
        }}
        onSubmit={handleSubmit}
      />
    </TmaPageShell>
  )
}
