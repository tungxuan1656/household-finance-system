'use client'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'

type GroupPickerProps = {
  groups: ExpenseGroupDTO[]
  value: string[]
  onValueChange: (value: string[]) => void
  disabled?: boolean
  id?: string
}

export const GroupPicker = ({
  groups,
  value,
  onValueChange,
  disabled = false,
  id,
}: GroupPickerProps) => {
  return (
    <Combobox
      multiple
      id={id}
      itemToStringLabel={(groupId) =>
        groups.find((g) => g.id === groupId)?.name ?? groupId
      }
      items={groups.map((g) => g.id)}
      value={value}
      onValueChange={(nextValue) => {
        onValueChange((nextValue as string[]) ?? [])
      }}>
      <ComboboxChips
        aria-invalid={false}
        aria-label={t('expense.groupPicker.ariaLabel')}
        className='min-h-10 w-full'>
        {value.map((groupId) => {
          const group = groups.find((g) => g.id === groupId)

          return (
            <ComboboxChip key={groupId}>{group?.name ?? groupId}</ComboboxChip>
          )
        })}
        <ComboboxChipsInput
          disabled={disabled}
          placeholder={
            value.length === 0 ? t('expense.groupPicker.placeholder') : ''
          }
        />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>{t('expense.groupPicker.empty')}</ComboboxEmpty>
        <ComboboxList>
          {(groupId) => {
            const group = groups.find((g) => g.id === groupId)

            return (
              <ComboboxItem key={groupId} value={groupId}>
                <span>{group?.name ?? groupId}</span>
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
