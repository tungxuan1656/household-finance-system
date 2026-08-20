import { forwardRef, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { CalendarIcon } from '@/components/shared/tma-icons'
import { impact } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

const formatDateDisplay = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) return value

  return `${match[3]}/${match[2]}/${match[1]}`
}

export type DatePickerMode = 'date' | 'month'
export type DatePickerSize = 'icon' | 'md' | 'sm'
export type DatePickerVariant =
  | 'danger'
  | 'ghost'
  | 'outline'
  | 'primary'
  | 'secondary'

export interface DatePickerProps {
  'aria-label'?: string
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  id?: string
  max?: string
  min?: string
  mode?: DatePickerMode
  name?: string
  onChange: (value: string) => void
  placeholder?: string
  showIcon?: boolean
  /**
   * @deprecated size now only controls height/typography to match Input. `md` = h-10 text-base, `sm` = h-9 text-sm, `icon` = size-10.
   */
  size?: DatePickerSize
  value: string
  /**
   * @deprecated variant kept for backward compat; visual is now Input-like regardless of variant.
   */
  variant?: DatePickerVariant
}

export { formatDateDisplay }

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      'aria-label': ariaLabel,
      'aria-invalid': ariaInvalid,
      className,
      disabled = false,
      fullWidth = false,
      id,
      max,
      min,
      mode = 'date',
      name,
      onChange,
      placeholder,
      showIcon = true,
      size = 'md',
      value,
      variant: _variant = 'outline',
    },
    forwardedRef,
  ) => {
    const { t } = useTranslation()
    const internalRef = useRef<HTMLInputElement>(null)
    const resolvedAriaLabel = ariaLabel ?? t('datePicker.ariaLabel')
    const resolvedPlaceholder = placeholder ?? t('datePicker.placeholder')

    const setInputRef = (node: HTMLInputElement | null) => {
      internalRef.current = node

      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    const hasValue = value.length > 0
    const monthDisplay = (raw: string): string => {
      const match = /^(\d{4})-(\d{2})$/.exec(raw)
      if (!match) return raw

      return t('datePicker.monthDisplay', {
        month: Number(match[2]),
        year: Number(match[1]),
      })
    }
    const display = hasValue
      ? mode === 'month'
        ? monthDisplay(value)
        : formatDateDisplay(value)
      : resolvedPlaceholder

    const sizeClasses =
      size === 'sm'
        ? 'h-9 text-sm'
        : size === 'icon'
          ? 'size-10 justify-center p-0 text-sm'
          : 'h-10 text-base md:text-sm'

    const chromeWidthClass =
      size === 'icon'
        ? fullWidth
          ? 'w-full'
          : 'w-10'
        : fullWidth
          ? 'w-full'
          : 'w-auto'

    return (
      <div
        className={cn(
          'group relative inline-flex',
          fullWidth && 'w-full',
          className,
        )}>
        <input
          ref={setInputRef}
          readOnly
          aria-invalid={ariaInvalid}
          aria-label={resolvedAriaLabel}
          className='peer absolute inset-0 z-10 size-full cursor-pointer appearance-none border-0 bg-transparent p-0 opacity-0 focus:outline-none disabled:cursor-not-allowed'
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          name={name}
          type={mode === 'month' ? 'month' : 'date'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onClick={() => {
            if (!disabled) impact('light')
          }}
        />
        <div
          aria-hidden='true'
          aria-invalid={ariaInvalid}
          className={cn(
            'pointer-events-none flex min-w-0 items-center justify-between gap-2 border border-transparent border-b-input bg-transparent px-0 py-1 transition-[color,border-color] outline-none',
            sizeClasses,
            chromeWidthClass,
            'group-focus-within:border-b-ring group-has-[input:focus-visible]:border-b-ring peer-focus-visible:border-b-ring',
            'aria-invalid:border-b-destructive dark:aria-invalid:border-b-destructive/50',
            disabled && 'opacity-50',
            hasValue
              ? 'font-normal text-foreground'
              : 'font-normal text-muted-foreground',
          )}
          data-disabled={disabled ? '' : undefined}>
          <span
            className={cn(
              'min-w-0 truncate text-left font-normal tabular-nums',
              fullWidth && 'flex-1',
            )}>
            {display}
          </span>
          {showIcon ? (
            <CalendarIcon
              aria-hidden='true'
              className='ml-auto size-4 shrink-0 text-muted-foreground'
            />
          ) : null}
        </div>
      </div>
    )
  },
)

DatePicker.displayName = 'DatePicker'
