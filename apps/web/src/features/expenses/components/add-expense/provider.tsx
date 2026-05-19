'use client'

import { PlusIcon } from 'lucide-react'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n/t'
import { isEditableTarget } from '@/utils/dom/is-editable-target'

import { AddExpenseDialog } from '../add-expense-dialog'

type AddExpenseDialogContextValue = {
  closeDialog: () => void
  open: boolean
  openDialog: () => void
  setOpen: (open: boolean) => void
}

const AddExpenseDialogContext =
  createContext<AddExpenseDialogContextValue | null>(null)

export function AddExpenseDialogProvider({
  children,
}: {
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  const value = useMemo<AddExpenseDialogContextValue>(
    () => ({
      closeDialog: () => setOpen(false),
      open,
      openDialog: () => setOpen(true),
      setOpen,
    }),
    [open],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (open || isEditableTarget(event.target)) {
        return
      }

      if (event.key.toLowerCase() === 'q') {
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <AddExpenseDialogContext.Provider value={value}>
      {children}

      <Button
        aria-label={t('expense.quickAdd.open')}
        className='fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 rounded-full shadow-lg md:right-8 md:bottom-8'
        size='icon-lg'
        type='button'
        onClick={() => setOpen(true)}>
        <PlusIcon />
        <span className='sr-only'>{t('expense.quickAdd.open')}</span>
      </Button>

      <AddExpenseDialog open={open} onOpenChange={setOpen} />
    </AddExpenseDialogContext.Provider>
  )
}

export function useAddExpenseDialog() {
  const context = useContext(AddExpenseDialogContext)

  if (!context) {
    throw new Error(
      'useAddExpenseDialog must be used within AddExpenseDialogProvider',
    )
  }

  return context
}
