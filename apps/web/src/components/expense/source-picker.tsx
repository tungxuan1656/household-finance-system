'use client'

import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { t } from '@/lib/i18n/t'
import { getSourceLabel } from '@/lib/reference-data/labels'
import { SOURCE_KEYS, type SourceKey } from '@/types/reference-data'

type SourcePickerProps = {
  id?: string
  value: SourceKey | undefined
  onValueChange: (value: SourceKey) => void
  disabled?: boolean
}

export const SourcePicker = ({
  id,
  value,
  onValueChange,
  disabled = false,
}: SourcePickerProps) => (
  <NativeSelect
    aria-label={t('app.expenseReference.sourcePicker.ariaLabel')}
    disabled={disabled}
    id={id}
    value={value ?? ''}
    onChange={(event) => {
      const val = event.target.value
      if (val) {
        onValueChange(val as SourceKey)
      }
    }}>
    <NativeSelectOption value=''>
      {t('app.expenseReference.sourcePicker.placeholder')}
    </NativeSelectOption>
    {SOURCE_KEYS.map((sourceKey) => (
      <NativeSelectOption key={sourceKey} value={sourceKey}>
        {getSourceLabel(sourceKey)}
      </NativeSelectOption>
    ))}
  </NativeSelect>
)
