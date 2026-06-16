import { forwardRef, useRef } from 'react'

import { ChevronDownIcon } from '@/components/shared/tma-icons'
import { impact } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

import { Button, type ButtonSize, type ButtonVariant } from './button'

export type NativePickerOption = {
  label: string
  value: string
}

export interface NativePickerProps {
  'aria-label'?: string
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  id?: string
  name?: string
  onChange: (value: string) => void
  options: NativePickerOption[]
  placeholder?: string
  showIcon?: boolean
  size?: ButtonSize
  value: string
  variant?: ButtonVariant
}

export const NativePicker = forwardRef<HTMLSelectElement, NativePickerProps>(
  (
    {
      'aria-label': ariaLabel = 'Chọn',
      className,
      disabled = false,
      fullWidth = false,
      id,
      name,
      onChange,
      options,
      placeholder,
      showIcon = true,
      size = 'md',
      value,
      variant = 'outline',
    },
    forwardedRef,
  ) => {
    const internalRef = useRef<HTMLSelectElement>(null)

    const setSelectRef = (node: HTMLSelectElement | null) => {
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

    const selected = options.find((option) => option.value === value)
    const hasValue = Boolean(selected)
    const display = selected?.label ?? placeholder ?? ''
    const textSizeClass = size === 'sm' ? 'text-xs' : 'text-sm'

    return (
      <div
        className={cn(
          'relative inline-flex',
          fullWidth && 'w-full',
          className,
        )}>
        <select
          ref={setSelectRef}
          aria-label={ariaLabel}
          className='absolute inset-0 z-10 size-full cursor-pointer appearance-none border-0 bg-transparent p-0 opacity-0'
          disabled={disabled}
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onClick={handleClick}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
              'min-w-0 truncate text-left font-bold',
              fullWidth && 'flex-1',
              textSizeClass,
            )}>
            {display}
          </span>
          {showIcon ? (
            <ChevronDownIcon
              aria-hidden='true'
              className='ml-auto size-4 shrink-0'
            />
          ) : null}
        </Button>
      </div>
    )
  },
)

NativePicker.displayName = 'NativePicker'
