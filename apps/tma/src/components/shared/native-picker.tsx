import { forwardRef, useRef } from 'react'

import { ChevronDownIcon } from '@/components/shared/tma-icons'
import { impact } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export type NativePickerOption = {
  label: string
  value: string
}

export type NativePickerSize = 'icon' | 'md' | 'sm'
export type NativePickerVariant =
  | 'danger'
  | 'ghost'
  | 'outline'
  | 'primary'
  | 'secondary'

export interface NativePickerProps {
  'aria-label'?: string
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  id?: string
  name?: string
  onChange: (value: string) => void
  options: NativePickerOption[]
  placeholder?: string
  showIcon?: boolean
  /**
   * @deprecated size now only controls height/typography to match Input. `md` = h-10 text-base, `sm` = h-9 text-sm, `icon` = size-10. Visual variant is Input-like.
   */
  size?: NativePickerSize
  value: string
  /**
   * @deprecated variant is kept for backward compat only; pickers now mimic Input (underline, transparent bg) regardless of variant.
   */
  variant?: NativePickerVariant
}

export const shouldActivateNativeControl = (disabled: boolean): boolean =>
  !disabled

/** @deprecated kept for backward compat, no longer used for styling */
const toGeneratedSize = (size: NativePickerSize): 'default' | 'icon' | 'sm' =>
  size === 'md' ? 'default' : size

/** @deprecated kept for backward compat, no longer used for styling */
const toGeneratedVariant = (
  variant: NativePickerVariant,
): 'default' | 'destructive' | 'ghost' | 'outline' | 'secondary' => {
  if (variant === 'primary') return 'default'
  if (variant === 'danger') return 'destructive'

  return variant
}

void toGeneratedSize
void toGeneratedVariant

export const NativePicker = forwardRef<HTMLSelectElement, NativePickerProps>(
  (
    {
      'aria-label': ariaLabel = 'Chọn',
      'aria-invalid': ariaInvalid,
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
      variant: _variant = 'outline',
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

    const selected = options.find((option) => option.value === value)
    const hasValue = Boolean(selected)
    const display = selected?.label ?? placeholder ?? ''

    // size -> Input-like height/typography; default md matches Input h-10 text-base md:text-sm
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
        <select
          ref={setSelectRef}
          aria-invalid={ariaInvalid}
          aria-label={ariaLabel}
          className='peer absolute inset-0 z-10 size-full cursor-pointer appearance-none border-0 bg-transparent p-0 opacity-0 focus:outline-none disabled:cursor-not-allowed'
          disabled={disabled}
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onClick={() => {
            if (shouldActivateNativeControl(disabled)) impact('light')
          }}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div
          aria-hidden='true'
          aria-invalid={ariaInvalid}
          className={cn(
            // Base Input-like chrome: underline, transparent bg, no uppercase, no rounded — mirrors Input
            'pointer-events-none flex min-w-0 items-center justify-between gap-2 border border-transparent border-b-input bg-transparent px-0 py-1 transition-[color,border-color] outline-none',
            sizeClasses,
            chromeWidthClass,
            // focus: hidden native control is peer + wrapper is group -> highlight underline like Input focus-visible:border-b-ring
            'group-focus-within:border-b-ring group-has-[select:focus-visible]:border-b-ring peer-focus-visible:border-b-ring',
            // invalid
            'aria-invalid:border-b-destructive dark:aria-invalid:border-b-destructive/50',
            disabled && 'opacity-50',
            hasValue
              ? 'font-normal text-foreground'
              : 'font-normal text-muted-foreground',
          )}
          data-disabled={disabled ? '' : undefined}>
          <span
            className={cn(
              'min-w-0 truncate text-left font-normal',
              fullWidth && 'flex-1',
            )}>
            {display}
          </span>
          {showIcon ? (
            <ChevronDownIcon
              aria-hidden='true'
              className='ml-auto size-4 shrink-0 text-muted-foreground'
            />
          ) : null}
        </div>
      </div>
    )
  },
)

NativePicker.displayName = 'NativePicker'
