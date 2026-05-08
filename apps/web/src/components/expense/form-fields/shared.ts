'use client'

import type { Control } from 'react-hook-form'

import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'

export type FieldProps = {
  control: Control<ExpenseFormInputValues>
  isSubmitting: boolean
  inputRef?: (node: HTMLInputElement | null) => void
}
