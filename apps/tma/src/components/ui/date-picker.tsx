import { forwardRef, useRef } from 'react'

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

export interface DatePickerProps {
  'aria-label'?: string
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  id?: string
  max?: string
  min?: string
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
      'aria-label': ariaLabel = 'Chọn ngày',
      className,
      disabled = false,
      fullWidth = false,
      id,
      max,
      min,
      name,
      onChange,
      placeholder = 'Chọn ngày',
      showIcon = true,
      size = 'md',
      value,
      variant = 'outline',
    },
    forwardedRef,
  ) => {
    const internalRef = useRef<HTMLInputElement>(null)

    const setInputRef = (node: HTMLInputElement | null) => {
      internalRef.current = node

      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    }

    const openPicker = () => {
      impact('light')

      const input = internalRef.current

      if (!input) {
        return
      }

      if (typeof input.showPicker === 'function') {
        input.showPicker()
      } else {
        input.click()
      }

      input.focus()
    }

    const hasValue = value.length > 0
    const display = hasValue ? formatDateDisplay(value) : placeholder
    const textSizeClass = size === 'sm' ? 'text-xs' : 'text-sm'

    return (
      <div
        className={cn(
          'relative inline-flex',
          fullWidth && 'w-full',
          className,
        )}>
        <Button
          aria-label={ariaLabel}
          className={cn(
            fullWidth && 'w-full',
            !hasValue && 'font-normal text-tma-text-muted',
          )}
          disabled={disabled}
          size={size}
          type='button'
          variant={variant}
          onClick={openPicker}>
          {showIcon ? (
            <CalendarIcon aria-hidden='true' className='size-4 shrink-0' />
          ) : null}
          <span
            className={cn(
              'font-mono font-bold [font-variant-numeric:tabular-nums]',
              textSizeClass,
            )}>
            {display}
          </span>
        </Button>
        <input
          ref={setInputRef}
          readOnly
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 h-full w-full cursor-pointer opacity-0'
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          name={name}
          tabIndex={-1}
          type='date'
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    )
  },
)

DatePicker.displayName = 'DatePicker'
