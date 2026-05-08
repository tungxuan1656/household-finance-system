'use client'

import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n/t'

import type { QuickAddSubmitError } from './quick-add-defaults'

type QuickAddSubmitErrorProps = {
  error: QuickAddSubmitError | null
  isSaving: boolean
  onSaveAsPrivate: () => void
}

export function QuickAddSubmitError({
  error,
  isSaving,
  onSaveAsPrivate,
}: QuickAddSubmitErrorProps) {
  if (!error) {
    return null
  }

  return (
    <div className='rounded-md border border-border bg-muted/50 p-3 text-sm'>
      <div>{error.message}</div>
      <div className='text-muted-foreground'>{error.hint}</div>
      {error.kind === 'permission' ? (
        <Button
          className='mt-3'
          disabled={isSaving}
          type='button'
          variant='outline'
          onClick={onSaveAsPrivate}>
          {t('expense.quickAdd.saveAsPrivate')}
        </Button>
      ) : null}
    </div>
  )
}
