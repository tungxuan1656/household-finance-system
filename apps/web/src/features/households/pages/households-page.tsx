'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/ui/page-shell'
import type { CreateHouseholdFormValues } from '@/features/households/lib/forms/household.schema'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

import { HouseholdsListSection } from './households-list-section'

function HouseholdsPage() {
  const households = useHouseholdStore.use.households()
  const isLoading = useHouseholdStore.use.isLoading()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [listLoadError, setListLoadError] = useState<string | null>(null)
  const shouldShowLoadingState =
    isInitialLoading && isLoading && households.length === 0
  const shouldShowBlockingError =
    !shouldShowLoadingState && listLoadError && households.length === 0
  const loadHouseholds = async () => {
    try {
      setListLoadError(null)
      await householdActions.fetchHouseholds()
    } catch (loadError) {
      setListLoadError(
        loadError instanceof Error
          ? loadError.message
          : t('app.households.feedback.loadFailed'),
      )
    }
  }

  useEffect(() => {
    let isMounted = true

    void loadHouseholds().finally(() => {
      if (isMounted) setIsInitialLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const onSubmit = async (values: CreateHouseholdFormValues) => {
    setIsCreating(true)
    try {
      await householdActions.createHousehold(values)
      setIsCreateDialogOpen(false)
      toast.success(t('app.households.feedback.createSuccess'))

      return true
    } catch {
      toast.error(t('app.households.feedback.createFailed'))

      return false
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <PageShell title={t('app.households.title')}>
      <DataState
        action={
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setIsInitialLoading(true)

              void loadHouseholds().finally(() => {
                setIsInitialLoading(false)
              })
            }}>
            {t('app.households.actions.retry')}
          </Button>
        }
        errorDescription={listLoadError ?? undefined}
        isError={Boolean(shouldShowBlockingError)}
        isLoading={shouldShowLoadingState}
        title={t('app.households.title')}>
        <HouseholdsListSection
          households={households}
          isCreateDialogOpen={isCreateDialogOpen}
          isCreating={isCreating}
          onCreateDialogOpenChange={setIsCreateDialogOpen}
          onCreateSubmit={onSubmit}
        />
      </DataState>
    </PageShell>
  )
}

export { HouseholdsPage }
