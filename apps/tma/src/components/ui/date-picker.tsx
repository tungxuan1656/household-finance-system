import { forwardRef, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { CalendarIcon } from '@/components/shared/tma-icons'
import { impact } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

import { Button, type ButtonSize, type ButtonVariant } from './button'

const formatDateDisplay = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return value
  }

  return `${match[3]}/${match[2]}/${match[1]}`
}

export type DatePickerMode = 'date' | 'month'

export interface DatePickerProps {
  'aria-label'?: string
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
  size?: ButtonSize
  value: string
  variant?: ButtonVariant
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      'aria-label': ariaLabel,
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
      variant = 'outline',
    },
    forwardedRef,
  ) => {
    const { t } = useTranslation()

    const resolvedAriaLabel = ariaLabel ?? t('datePicker.ariaLabel')
    const resolvedPlaceholder = placeholder ?? t('datePicker.placeholder')

    const internalRef = useRef<HTMLInputElement>(null)

    const setInputRef = (node: HTMLInputElement | null) => {
      internalRef.current = node

      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    }

    const handleClick = () => {
      impact('light')
    }

    const hasValue = value.length > 0

    const monthDisplay = (raw: string): string => {
      const match = /^(\d{4})-(\d{2})$/.exec(raw)

      if (!match) {
        return raw
      }

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
    const textSizeClass = size === 'sm' ? 'text-xs' : 'text-sm'

    return (
      <div
        className={cn(
          'relative inline-flex',
          fullWidth && 'w-full',
          className,
        )}>
        <input
          ref={setInputRef}
          readOnly
          aria-label={resolvedAriaLabel}
          className='absolute inset-0 z-10 size-full cursor-pointer appearance-none border-0 bg-transparent p-0 opacity-0'
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          name={name}
          type={mode === 'month' ? 'month' : 'date'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onClick={handleClick}
        />
        <Button
          aria-hidden='true'
          className={cn(
            'pointer-events-none',
            fullWidth && 'w-full overflow-hidden',
            !hasValue && 'font-normal text-tma-text-muted',
          )}
          disabled={disabled}
          size={size}
          tabIndex={-1}
          type='button'
          variant={variant}>
          <span
            className={cn(
              'min-w-0 truncate text-left font-mono font-bold [font-variant-numeric:tabular-nums]',
              fullWidth && 'flex-1',
              textSizeClass,
            )}>
            {display}
          </span>
          {showIcon ? (
            <CalendarIcon
              aria-hidden='true'
              className='ml-auto size-4 shrink-0'
            />
          ) : null}
        </Button>
      </div>
    )
  },
)

DatePicker.displayName = 'DatePicker'
