'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  HouseholdCreateDialog,
  HouseholdsLoadingState,
  HouseholdSummaryCard,
} from '@/components/household'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { CreateHouseholdFormValues } from '@/lib/forms/household.schema'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

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
          : 'Load households failed',
      )
    }
  }

  useEffect(() => {
    let isMounted = true

    void loadHouseholds().finally(() => {
      if (isMounted) {
        setIsInitialLoading(false)
      }
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
    <div className='flex flex-col gap-6'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-xl tracking-tight md:text-2xl'>
            {t('app.households.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('app.households.description')}
          </p>
        </div>
        <HouseholdCreateDialog
          isOpen={isCreateDialogOpen}
          isSubmitting={isCreating}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={onSubmit}
        />
      </header>

      {shouldShowLoadingState ? <HouseholdsLoadingState /> : null}

      {shouldShowBlockingError ? (
        <Card>
          <CardContent className='flex flex-wrap items-center justify-between gap-2 pt-4'>
            <p className='text-sm text-destructive' role='alert'>
              {listLoadError}
            </p>
            <Button
              size='xl'
              type='button'
              variant='outline'
              onClick={() => {
                setIsInitialLoading(true)

                void loadHouseholds().finally(() => {
                  setIsInitialLoading(false)
                })
              }}>
              {t('app.households.actions.retry')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!shouldShowLoadingState &&
      !shouldShowBlockingError &&
      households.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <span aria-hidden='true'>▣</span>
            </EmptyMedia>
            <EmptyTitle>{t('app.households.empty.title')}</EmptyTitle>
            <EmptyDescription>
              {t('app.households.empty.description')}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              size='xl'
              type='button'
              onClick={() => setIsCreateDialogOpen(true)}>
              {t('app.households.actions.create')}
            </Button>
          </EmptyContent>
        </Empty>
      ) : null}

      {!shouldShowLoadingState && households.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3'>
          {households.map((household) => (
            <HouseholdSummaryCard key={household.id} household={household} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export { HouseholdsPage }
