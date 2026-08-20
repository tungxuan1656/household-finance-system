import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/features/auth/store'
import { useHouseholdsQuery } from '@/features/home/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'
import { impact } from '@/lib/telegram/haptics'

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
          <CardHeader>
            <CardTitle>{t('budgets.detail.invalidIdTitle')}</CardTitle>
            <CardDescription>
              {t('budgets.detail.invalidIdDesc')}
            </CardDescription>
          </CardHeader>
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
        <Card>
          <CardHeader>
            <CardDescription
              className={
                feedback.tone === 'error'
                  ? 'text-destructive'
                  : 'text-emerald-600'
              }>
              {feedback.message}
            </CardDescription>
          </CardHeader>
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
              <section className='grid gap-3'>
                <h2 className='m-0 text-base font-bold'>
                  {t('budgets.detail.sectionManage')}
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('budgets.detail.sectionManage')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className='grid gap-3' onSubmit={handleSubmit}>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor='budget-detail-limit'>
                            {t('budgets.detail.manageLimit')}
                          </FieldLabel>
                          <Input
                            disabled={!isEditing || updateMutation.isPending}
                            id='budget-detail-limit'
                            inputMode='numeric'
                            value={totalLimitInput}
                            onChange={(event) =>
                              setTotalLimitInput(
                                formatAmountInput(event.target.value),
                              )
                            }
                          />
                        </Field>
                      </FieldGroup>

                      {isEditing ? (
                        <div className='flex justify-end gap-2'>
                          <TmaHapticButton
                            aria-busy={updateMutation.isPending}
                            disabled={updateMutation.isPending}
                            type='button'
                            variant='secondary'
                            onClick={() => {
                              setIsEditing(false)

                              setTotalLimitInput(
                                formatAmountInput(
                                  String(budget.totalLimitMinor),
                                ),
                              )
                            }}>
                            {t('common.cancel')}
                          </TmaHapticButton>
                          <TmaHapticButton
                            aria-busy={updateMutation.isPending}
                            disabled={updateMutation.isPending}
                            type='submit'>
                            {updateMutation.isPending
                              ? t('budgets.detail.editing')
                              : t('budgets.detail.save')}
                          </TmaHapticButton>
                        </div>
                      ) : (
                        <div className='flex justify-end gap-2'>
                          <TmaHapticButton
                            type='button'
                            variant='secondary'
                            onClick={() => setIsEditing(true)}>
                            {t('budgets.detail.editAction')}
                          </TmaHapticButton>
                          <TmaHapticButton
                            aria-busy={deleteMutation.isPending}
                            disabled={deleteMutation.isPending}
                            type='button'
                            variant='destructive'
                            onClick={handleDelete}>
                            {deleteMutation.isPending
                              ? t('budgets.detail.deleting')
                              : t('budgets.detail.deleteAction')}
                          </TmaHapticButton>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </section>
            ) : null}
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
