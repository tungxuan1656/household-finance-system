'use client'

import { useEffect, useMemo, useState } from 'react'

import { Drawer } from '@/components/ui/drawer'
import { useExpenseGroupListQuery } from '@/features/groups/hooks/use-groups'
import { useHouseholdsQuery } from '@/features/households/hooks/use-households'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'

import { AddExpenseDrawerFlow } from './add-expense-drawer-flow'
import { type AddExpenseStep } from './add-expense-flow-helpers'
import {
  type ExpenseEntryCategoryOption,
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
  const { data: categoriesResponse } = useReferenceCategoriesQuery()
  const { data: householdsResponse } = useHouseholdsQuery()
  const { data: profile } = useCurrentUserProfileQuery()
  const { data: personalGroupsResponse } = useExpenseGroupListQuery(undefined)
  const [step, setStep] = useState<AddExpenseStep>(1)
  const {
    amountDisplay,
    errors,
    formState,
    isSubmitting,
    setField,
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
  const filteredCategories = categories
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

  const selectedCategory = useMemo<ExpenseEntryCategoryOption | undefined>(
    () => categories.find((category) => category.key === formState.categoryKey),
    [categories, formState.categoryKey],
  )

  useEffect(() => {
    if (!open) {
      setStep(1)
    }
  }, [open])

  return (
    <Drawer direction='bottom' open={open} onOpenChange={onOpenChange}>
      <AddExpenseDrawerFlow
        amountDisplay={amountDisplay}
        errors={errors}
        filteredCategories={filteredCategories}
        formState={formState}
        groups={groups}
        households={households}
        isSubmitting={isSubmitting}
        selectedCategory={selectedCategory}
        step={step}
        onClose={() => onOpenChange(false)}
        onFieldChange={setField}
        onStepChange={setStep}
        onSubmit={handleSubmit}
      />
    </Drawer>
  )
}
