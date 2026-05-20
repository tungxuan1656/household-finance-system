import type { ReactNode } from 'react'

import { Field } from '@/components/ui/field'
import { FieldLabel } from '@/components/ui/field'
import { cn } from '@/utils/cn'

// ---------------------------------------------------------------------------
// Class name constants — import these at call sites for consistent styling
// of inputs and selects rendered inside a FieldRow.
// ---------------------------------------------------------------------------

/** Base class for the Field wrapper in a FieldRow layout. */
export const FIELD_ROW_BASE_CLASS =
  'flex-row items-center gap-2 rounded-2xl border border-border px-3 py-1'

/** Class for the label+icon slot of a FieldRow. */
export const FIELD_ROW_LABEL_CLASS =
  'flex w-28! shrink-0 flex-row items-center gap-2 sm:w-32!'

/** Class for the control slot of a FieldRow. */
export const FIELD_ROW_CONTROL_CLASS =
  'flex min-w-0 w-auto flex-1 flex-row justify-end'

/** Apply to NativeSelect's labelClassName for inline-right appearance inside a FieldRow. */
export const FIELD_ROW_SELECT_CLASS =
  'border-none bg-transparent text-sm text-right ring-0!'

/** Apply to Input's className for inline-right appearance inside a FieldRow. */
export const FIELD_ROW_INPUT_CLASS =
  'w-full border-none bg-transparent text-right ring-0!'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type FieldRowProps = {
  /** The accessible label text shown on the left side. */
  label: string
  /** Optional Lucide icon (or any node) shown before the label. */
  icon?: ReactNode
  /** The `htmlFor`value wired to FieldLabel. */
  htmlFor: string
  /** The control(s) rendered on the right side. */
  children: ReactNode
  /** Extra class names merged onto the outer Field element. */
  className?: string
  /** Extra class names merged onto the label+icon container div. */
  labelClassName?: string
  /** Extra class names merged onto the control div. */
  controlClassName?: string
}

/**
 * FieldRow — a shared, domain-free presentational component.
 *
 * Renders a single-line row with an icon+label on the left and a
 * control (Input, NativeSelect, etc.) on the right. Designed for
 * compact form dialogs on mobile and desktop.
 *
 * Use FIELD_ROW_SELECT_CLASS / FIELD_ROW_INPUT_CLASS from this module
 * on the control element to achieve the matching right-aligned style.
 */
export const FieldRow = ({
  label,
  icon,
  htmlFor,
  children,
  className,
  labelClassName,
  controlClassName,
}: FieldRowProps) => (
  <Field className={cn(FIELD_ROW_BASE_CLASS, className)}>
    <div className={cn(FIELD_ROW_LABEL_CLASS, labelClassName)}>
      {icon}
      <FieldLabel className='font-normal' htmlFor={htmlFor}>
        {label}
      </FieldLabel>
    </div>
    <div className={cn(FIELD_ROW_CONTROL_CLASS, controlClassName)}>
      {children}
    </div>
  </Field>
)
