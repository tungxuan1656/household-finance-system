'use client'

import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { t } from '@/lib/i18n/t'
import { getSourceLabel } from '@/lib/reference-data/labels'
import { SOURCE_KEYS, type SourceKey } from '@/types/reference-data'

type SourcePickerProps = {
  value: SourceKey
  onValueChange: (value: SourceKey) => void
  disabled?: boolean
}

export const SourcePicker = ({
  value,
  onValueChange,
  disabled = false,
}: SourcePickerProps) => (
  <NativeSelect
    aria-label={t('app.expenseReference.sourcePicker.ariaLabel')}
    disabled={disabled}
    value={value}
    onChange={(event) => {
      onValueChange(event.target.value as SourceKey)
    }}>
    {SOURCE_KEYS.map((sourceKey) => (
      <NativeSelectOption key={sourceKey} value={sourceKey}>
        {getSourceLabel(sourceKey)}
      </NativeSelectOption>
    ))}
  </NativeSelect>
)
