'use client'

import * as React from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  trigger?: React.ReactNode
  triggerClassName?: string
} & Omit<
  React.ComponentProps<typeof AlertDialogContent>,
  'children' | 'onEscapeKeyDown'
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
      triggerClassName,
      trigger,
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

    const handleCancelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      void handleCancel()
    }

    const handleConfirm = async () => {
      if (isConfirmDisabled) {
        return
      }

      try {
        setIsSubmitting(true)
        await onConfirm()
        setIsOpen(false)
      } catch {
        // Keep the alert open so callers can surface retryable errors nearby.
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleConfirmClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      void handleConfirm()
    }

    const handleOpenChange = (nextOpen: boolean) => {
      if (isConfirmBusy && !nextOpen) {
        return
      }

      if (!nextOpen) {
        void onCancel?.()
      }

      setIsOpen(nextOpen)
    }

    const preventDismissWhileBusy = (event: Event) => {
      if (isConfirmBusy) {
        event.preventDefault()
      }
    }

    return (
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild className={triggerClassName}>
          {trigger}
        </AlertDialogTrigger>
        <AlertDialogContent
          onEscapeKeyDown={preventDismissWhileBusy}
          {...dialogContentProps}>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description ? (
              <AlertDialogDescription>{description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          {children}
          <AlertDialogFooter className='flex-row justify-end'>
            <AlertDialogCancel
              className='flex-1'
              disabled={isConfirmBusy}
              size={'sm'}
              type='button'
              onClick={handleCancelClick}>
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              className='flex-1'
              disabled={isConfirmDisabled}
              size={'sm'}
              type='button'
              variant={variant}
              onClick={handleConfirmClick}>
              {isConfirmBusy ? t('common.actions.processing') : confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
)

ConfirmDialog.displayName = 'ConfirmDialog'
