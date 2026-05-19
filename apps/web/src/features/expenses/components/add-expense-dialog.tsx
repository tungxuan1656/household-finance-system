'use client'

import { XIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useExpenseGroupListQuery } from '@/features/groups/hooks/use-groups'
import { useHouseholdsQuery } from '@/hooks/api/use-households'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { useIsMobile } from '@/hooks/shared/use-mobile'
import { t } from '@/lib/i18n/t'

import { ExpenseEntryForm } from './expense-entry-form'
import {
  filterExpenseEntryCategories,
  mergeExpenseEntryGroups,
} from './expense-entry-options'
import { useExpenseEntryForm } from './use-expense-entry-form'

export type AddExpenseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AddExpenseDialog = ({
  open,
  onOpenChange,
}: AddExpenseDialogProps) => {
  const isMobile = useIsMobile()
  const { data: categoriesResponse } = useReferenceCategoriesQuery()
  const { data: householdsResponse } = useHouseholdsQuery()
  const { data: profile } = useCurrentUserProfileQuery()
  const { data: personalGroupsResponse } = useExpenseGroupListQuery(undefined)
  const {
    amountDisplay,
    errors,
    formState,
    isSubmitting,
    setField,
    titlePlaceholder,
    handleSubmit,
  } = useExpenseEntryForm({
    mode: 'create',
    open,
    lastSourceKey: profile?.quickAddLastSourceKey ?? null,
    onOpenChange,
  })

  const selectedHouseholdId = formState.householdId || undefined
  const { data: householdGroupsResponse } =
    useExpenseGroupListQuery(selectedHouseholdId)

  const categories = useMemo(
    () => filterExpenseEntryCategories(categoriesResponse?.items ?? []),
    [categoriesResponse?.items],
  )

  const households = householdsResponse?.items ?? []

  const groups = useMemo(
    () =>
      mergeExpenseEntryGroups(
        personalGroupsResponse?.items ?? [],
        selectedHouseholdId ? (householdGroupsResponse?.items ?? []) : [],
      ),
    [
      householdGroupsResponse?.items,
      personalGroupsResponse?.items,
      selectedHouseholdId,
    ],
  )

  const submitLabel = isSubmitting
    ? t('expense.submitting')
    : t('expense.addTitle')

  const form = (
    <ExpenseEntryForm
      amountDisplay={amountDisplay}
      categories={categories}
      errors={errors}
      formId='add-expense-form'
      formState={formState}
      groups={groups}
      households={households}
      isSubmitting={isSubmitting}
      setField={setField}
      titlePlaceholder={titlePlaceholder}
      onSubmit={handleSubmit}
    />
  )

  return isMobile ? (
    <Drawer direction='bottom' open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='max-h-screen pb-8'>
        <DrawerHeader className='flex flex-row items-center justify-between'>
          <DrawerTitle className='text-left text-xl font-semibold'>
            {t('expense.addTitle')}
          </DrawerTitle>
          <DrawerClose>
            <div className='rounded-full bg-accent p-2'>
              <XIcon className='size-4 text-muted-foreground' />
            </div>
          </DrawerClose>
        </DrawerHeader>
        {form}
        <DrawerFooter className='flex-row justify-end pb-safe'>
          <Button
            disabled={isSubmitting}
            form='add-expense-form'
            size={'sm'}
            type='submit'>
            {submitLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('expense.addTitle')}</DialogTitle>
          <DialogDescription>
            {t('expense.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        {form}
        <DialogFooter>
          <Button disabled={isSubmitting} form='add-expense-form' type='submit'>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
