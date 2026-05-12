'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type EmptyStateProps = {
  onAddFirstExpense: () => void
}

function EmptyState({ onAddFirstExpense }: EmptyStateProps) {
  return (
    <div className='mx-auto max-w-md rounded-2xl border bg-card p-8 text-center'>
      <h2 className='mb-2 text-xl font-semibold'>Welcome to Expense Tracker</h2>
      <p className='mx-auto mb-6 max-w-sm text-sm text-muted-foreground'>
        Start tracking your spending to see insights and stay on budget.
      </p>
      <Button size='lg' onClick={onAddFirstExpense}>
        <Plus className='mr-1.5 size-5' />
        Add Your First Expense
      </Button>
    </div>
  )
}

export type { EmptyStateProps }
export { EmptyState }
