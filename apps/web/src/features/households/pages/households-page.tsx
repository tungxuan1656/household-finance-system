'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { DataState } from '@/components/shared/data-state'
import {
  PageContainer,
  PageContent,
  PageHeader,
} from '@/components/shared/page'
import { useCreateHouseholdMutation } from '@/features/households/hooks/use-household-mutations'
import { useHouseholdsQuery } from '@/features/households/hooks/use-households'
import type { CreateHouseholdFormValues } from '@/features/households/lib/forms/household.schema'
import { t } from '@/lib/i18n/t'

import { HouseholdsListSection } from './households-list-section'

function HouseholdsPage() {
  const { data, isLoading, error, refetch } = useHouseholdsQuery()
  const createHouseholdMutation = useCreateHouseholdMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const households = data?.items ?? []

  useEffect(() => {
    if (!isLoading && !error) {
      setIsInitialLoading(false)
    }
  }, [isLoading, error])

  const onSubmit = async (values: CreateHouseholdFormValues) => {
    setIsCreating(true)
    try {
      await createHouseholdMutation.mutateAsync(values)
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
    <PageContainer>
      <PageHeader title={t('app.households.title')} />
      <PageContent>
        <DataState
          errorDescription={error?.message ?? undefined}
          isError={Boolean(error) && households.length === 0}
          isLoading={isInitialLoading}
          retryAction={() => void refetch()}>
          <HouseholdsListSection
            households={households}
            isCreateDialogOpen={isCreateDialogOpen}
            isCreating={isCreating}
            onCreateDialogOpenChange={setIsCreateDialogOpen}
            onCreateSubmit={onSubmit}
          />
        </DataState>
      </PageContent>
    </PageContainer>
  )
}

export { HouseholdsPage }
