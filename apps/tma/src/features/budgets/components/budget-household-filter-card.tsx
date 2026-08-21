import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  NativePicker,
  type NativePickerOption,
} from '@/components/shared/native-picker'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type { HouseholdDTO } from '@/features/home/types'

type BudgetHouseholdFilterCardProps = {
  households: HouseholdDTO[]
  selectedHouseholdId: string
  onChange: (next: string) => void
  isLoading: boolean
}

export const BudgetHouseholdFilterCard = ({
  households,
  selectedHouseholdId,
  onChange,
  isLoading,
}: BudgetHouseholdFilterCardProps) => {
  const { t } = useTranslation()
  const selectedHousehold = households.find((h) => h.id === selectedHouseholdId)

  const householdOptions: NativePickerOption[] = useMemo(() => {
    if (households.length === 0) {
      return [{ value: '', label: t('budgets.householdEmptyOption') }]
    }

    return households.map((h) => ({ value: h.id, label: h.name }))
  }, [households, t])

  return (
    <Card>
      <CardHeader className='gap-1'>
        <CardTitle className='text-sm'>{t('budgets.householdLabel')}</CardTitle>
        {selectedHousehold?.role !== 'admin' ? (
          <CardDescription>{t('budgets.householdViewOnly')}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <FieldGroup className='gap-4'>
          <Field>
            <FieldLabel htmlFor='budget-household-filter'>
              {t('budgets.householdLabel')}
            </FieldLabel>
            <NativePicker
              fullWidth
              aria-label={t('budgets.chooseHousehold')}
              disabled={isLoading || households.length === 0}
              id='budget-household-filter'
              options={householdOptions}
              value={selectedHouseholdId}
              onChange={onChange}
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
