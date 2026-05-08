'use client'

import type { Control } from 'react-hook-form'

import {
  GroupField,
  HouseholdField,
  PayerField,
} from '@/components/expense/expense-form-fields'
import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'
import type { ExpenseGroupDTO } from '@/types/group'
import type { HouseholdDTO, HouseholdMemberDTO } from '@/types/household'
import type { CurrentUserProfileDTO } from '@/types/profile'

type QuickAddHouseholdFieldsProps = {
  control: Control<ExpenseFormInputValues>
  groups: ExpenseGroupDTO[]
  households: HouseholdDTO[]
  isSubmitting: boolean
  payerOptions: HouseholdMemberDTO[]
  profile?: CurrentUserProfileDTO
  watchedVisibility: ExpenseFormInputValues['visibility']
}

export function QuickAddHouseholdFields({
  control,
  groups,
  households,
  isSubmitting,
  payerOptions,
  profile,
  watchedVisibility,
}: QuickAddHouseholdFieldsProps) {
  return (
    <>
      <HouseholdField
        control={control}
        households={households}
        isSubmitting={isSubmitting}
      />
      <PayerField
        control={control}
        isSubmitting={isSubmitting}
        payerOptions={payerOptions}
        profile={profile}
        watchedVisibility={watchedVisibility}
      />
      <GroupField
        control={control}
        groups={groups}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
