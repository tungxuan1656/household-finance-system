'use client'

import { PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n/t'

import { QuickAddExpenseDialog } from './quick-add-expense-dialog'

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return !!target.closest("input, textarea, select, [contenteditable='true']")
}

export function QuickAddExpenseTrigger() {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (open) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key.toLowerCase() !== 'q') {
        return
      }

      handleOpen()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <>
      <Button type='button' variant='outline' onClick={handleOpen}>
        <PlusIcon data-icon='inline-start' />
        {t('expense.quickAdd.headerOpen')}
      </Button>

      <Button
        aria-label={t('expense.quickAdd.open')}
        className='fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 rounded-full shadow-lg md:right-8 md:bottom-8'
        size='icon-lg'
        type='button'
        onClick={handleOpen}>
        <PlusIcon />
        <span className='sr-only'>{t('expense.quickAdd.open')}</span>
      </Button>

      <QuickAddExpenseDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
