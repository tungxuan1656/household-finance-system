import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  DataState,
  Field,
  FieldLabel,
  Input,
  Section,
  SectionHeader,
} from '@/components/ui'
import { useAuthStore } from '@/features/auth/store'
import { useHouseholdsQuery } from '@/features/home/api'
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
import { BudgetHeroCard } from '../components/budget-hero-card'
import { BudgetProgressSection } from '../components/budget-progress-section'
import {
  type BudgetMutationFormValues,
  buildBudgetMutationRequest,
  getBudgetProgress,
  parseBudgetAmountInputToMinor,
} from '../presentation'
import type { BudgetFeedback } from '../types/feedback'

export const BudgetDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
      setFeedback({ message: t('budgets.detail.updated'), tone: 'success' })
      setIsEditing(false)
      await statusQuery.refetch()
    } catch {
      setFeedback({ message: t('budgets.detail.updateError'), tone: 'error' })
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(t('budgets.detail.deleteConfirm'))
    if (!confirmed) return

    try {
      await deleteMutation.mutateAsync(budget!.id)
      impact('medium')

      navigate(TMA_PATHS.budgets, {
        replace: true,
        state: {
          feedback: { message: t('budgets.detail.deleted'), tone: 'success' },
        },
      })
    } catch {
      setFeedback({ message: t('budgets.detail.deleteError'), tone: 'error' })
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
      <TmaPageShell title={t('budgets.detail.title')}>
        <Card>
          <CardTitle>{t('budgets.detail.invalidIdTitle')}</CardTitle>
          <CardDescription>{t('budgets.detail.invalidIdDesc')}</CardDescription>
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
    <TmaPageShell title={t('budgets.detail.title')}>
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
        emptyDescription={t('budgets.detail.notFoundDesc')}
        emptyTitle={t('budgets.detail.notFoundTitle')}
        errorDescription={t('budgets.detail.loadErrorDesc')}
        errorTitle={t('budgets.detail.loadError')}
        isEmpty={isBudgetMissing}
        isError={detailQuery.isError && !budget}
        isLoading={detailQuery.isLoading && !budget}
        loadingDescription={t('budgets.detail.loadingDesc')}
        loadingTitle={t('budgets.detail.loading')}
        retryAction={detailQuery.refetch}>
        {budget ? (
          <>
            <BudgetHeroCard
              budget={budget}
              household={household ?? undefined}
              status={status ?? undefined}
              t={t}
            />

            {status && progress ? (
              <BudgetProgressSection
                isOver={isOver}
                progress={progress}
                status={status}
                t={t}
              />
            ) : null}

            {canEdit ? (
              <Section>
                <SectionHeader title={t('budgets.detail.sectionManage')} />
                <Card>
                  <form className='grid gap-3.5' onSubmit={handleSubmit}>
                    <Field>
                      <FieldLabel>{t('budgets.detail.manageLimit')}</FieldLabel>
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
                          {t('common.cancel')}
                        </Button>
                        <Button
                          disabled={updateMutation.isPending}
                          type='submit'
                          variant='secondary'>
                          {updateMutation.isPending
                            ? t('budgets.detail.editing')
                            : t('budgets.detail.save')}
                        </Button>
                      </div>
                    ) : (
                      <div className='flex justify-end gap-2'>
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={() => setIsEditing(true)}>
                          {t('budgets.detail.editAction')}
                        </Button>
                        <Button
                          disabled={deleteMutation.isPending}
                          type='button'
                          variant='danger'
                          onClick={handleDelete}>
                          {deleteMutation.isPending
                            ? t('budgets.detail.deleting')
                            : t('budgets.detail.deleteAction')}
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
