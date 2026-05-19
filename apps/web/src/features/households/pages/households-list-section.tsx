'use client'

import type { CreateHouseholdFormValues } from '@/features/households/lib/forms/household.schema'
import type { HouseholdDTO } from '@/features/households/types/household'

import {
  CreateHouseholdActionCard,
  HouseholdCreateDialog,
  HouseholdSummaryCard,
} from '../components'

type HouseholdsListSectionProps = {
  households: HouseholdDTO[]
  isCreateDialogOpen: boolean
  isCreating: boolean
  onCreateDialogOpenChange: (open: boolean) => void
  onCreateSubmit: (values: CreateHouseholdFormValues) => Promise<boolean>
}

export const HouseholdsListSection = ({
  households,
  isCreateDialogOpen,
  isCreating,
  onCreateDialogOpenChange,
  onCreateSubmit,
}: HouseholdsListSectionProps) => (
  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3'>
    {households.map((household) => (
      <HouseholdSummaryCard key={household.id} household={household} />
    ))}
    <CreateHouseholdActionCard
      onAction={() => onCreateDialogOpenChange(true)}
    />
    <HouseholdCreateDialog
      isOpen={isCreateDialogOpen}
      isSubmitting={isCreating}
      onOpenChange={onCreateDialogOpenChange}
      onSubmit={onCreateSubmit}
    />
  </div>
)
