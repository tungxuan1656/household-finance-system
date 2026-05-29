'use client'

import { HomeIcon } from 'lucide-react'

import { FIELD_ROW_SELECT_CLASS, FieldRow } from '@/components/shared/form'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { t } from '@/lib/i18n/t'

type InsightsFilterProps = {
  value: string | null
  onChange: (value: string | null) => void
  households: Array<{ id: string; name: string }>
}

export function InsightsFilter({
  value,
  onChange,
  households,
}: InsightsFilterProps) {
  return (
    <FieldRow
      htmlFor='insights-household-filter'
      icon={<HomeIcon className='size-4' />}
      label={t('insights.filter.scope')}>
      <NativeSelect
        className='w-full'
        id='insights-household-filter'
        labelClassName={FIELD_ROW_SELECT_CLASS}
        size='sm'
        value={value ?? ''}
        onChange={(event) => {
          const raw = event.target.value

          onChange(raw === '' ? null : raw)
        }}>
        <NativeSelectOption value=''>
          {t('insights.filter.personal')}
        </NativeSelectOption>
        {Array.isArray(households) &&
          households.map((household) => (
            <NativeSelectOption key={household.id} value={household.id}>
              {household.name}
            </NativeSelectOption>
          ))}
      </NativeSelect>
    </FieldRow>
  )
}
