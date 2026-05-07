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
  const error = useHouseholdStore.use.error()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    void householdActions.fetchHouseholds()
  }, [])

  const onSubmit = async (values: CreateHouseholdFormValues) => {
    try {
      await householdActions.createHousehold(values)

      setIsCreateDialogOpen(false)
      toast.success(t('app.households.feedback.createSuccess'))

      return true
    } catch {
      toast.error(t('app.households.feedback.createFailed'))

      return false
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('app.households.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('app.households.description')}
          </p>
        </div>
        <HouseholdCreateDialog
          isOpen={isCreateDialogOpen}
          isSubmitting={isLoading}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={onSubmit}
        />
      </header>

      {isLoading ? <HouseholdsLoadingState /> : null}

      {!isLoading && error ? (
        <Card>
          <CardContent className='flex flex-wrap items-center justify-between gap-2 pt-1'>
            <p className='text-sm text-destructive' role='alert'>
              {error}
            </p>
            <Button
              type='button'
              variant='outline'
              onClick={() => void householdActions.fetchHouseholds()}>
              {t('app.households.actions.retry')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && households.length === 0 ? (
        <Empty className='border'>
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
            <Button type='button' onClick={() => setIsCreateDialogOpen(true)}>
              {t('app.households.actions.create')}
            </Button>
          </EmptyContent>
        </Empty>
      ) : null}

      {!isLoading && !error && households.length > 0 ? (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {households.map((household) => (
            <HouseholdSummaryCard key={household.id} household={household} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export { HouseholdsPage }
