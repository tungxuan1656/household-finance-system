'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { t } from '@/lib/i18n/t'

export type ConfirmDialogHandle = {
  open: () => void
  close: () => void
}

export type ConfirmDialogProps = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  confirmDisabled?: boolean
  confirmLoading?: boolean
  onConfirm: () => Promise<void> | void
  onCancel?: () => Promise<void> | void
  children?: React.ReactNode
} & Omit<
  React.ComponentProps<typeof DialogContent>,
  'children' | 'onInteractOutside' | 'onEscapeKeyDown'
>

export const ConfirmDialog = React.forwardRef<
  ConfirmDialogHandle,
  ConfirmDialogProps
>(
  (
    {
      title,
      description,
      confirmLabel = t('common.actions.confirm'),
      cancelLabel = t('common.actions.cancel'),
      variant = 'default',
      confirmDisabled = false,
      confirmLoading = false,
      onConfirm,
      onCancel,
      children,
      ...dialogContentProps
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const isConfirmBusy = isSubmitting || confirmLoading
    const isConfirmDisabled = confirmDisabled || isConfirmBusy

    React.useImperativeHandle(
      ref,
      () => ({
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }),
      [],
    )

    const handleCancel = async () => {
      if (isConfirmBusy) {
        return
      }

      await onCancel?.()
      setIsOpen(false)
    }

    const handleConfirm = async () => {
      if (isConfirmDisabled) {
        return
      }

      try {
        setIsSubmitting(true)
        await onConfirm()
        setIsOpen(false)
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleOpenChange = (nextOpen: boolean) => {
      if (isConfirmBusy && !nextOpen) {
        return
      }

      setIsOpen(nextOpen)
    }

    const preventDismissWhileBusy = (event: Event) => {
      if (isConfirmBusy) {
        event.preventDefault()
      }
    }

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          onEscapeKeyDown={preventDismissWhileBusy}
          onInteractOutside={preventDismissWhileBusy}
          {...dialogContentProps}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          {children}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                disabled={isConfirmBusy}
                type='button'
                variant='outline'
                onClick={handleCancel}>
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button
              disabled={isConfirmDisabled}
              type='button'
              variant={variant}
              onClick={handleConfirm}>
              {isConfirmBusy ? t('common.actions.processing') : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
)

ConfirmDialog.displayName = 'ConfirmDialog'
