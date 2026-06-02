'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { XIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  type CreateHouseholdFormValues,
  createHouseholdSchema,
} from '@/features/households/lib/forms/household.schema'
import { useIsMobile } from '@/hooks/shared/use-mobile'
import { t } from '@/lib/i18n/t'

type HouseholdCreateDialogProps = {
  isOpen: boolean
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateHouseholdFormValues) => Promise<boolean>
}

export const HouseholdCreateDialog = ({
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: HouseholdCreateDialogProps) => {
  const isMobile = useIsMobile()
  const form = useForm<CreateHouseholdFormValues>({
    defaultValues: { name: '' },
    resolver: zodResolver(createHouseholdSchema),
  })

  const formFields = (
    <FieldGroup>
      <Controller
        control={form.control}
        name='name'
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='household-name'>
              {t('app.households.fields.householdName.label')}
            </FieldLabel>
            <FieldContent>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id='household-name'
                placeholder={t(
                  'app.households.fields.householdName.placeholder',
                )}
                size={'sm'}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </FieldContent>
          </Field>
        )}
      />
    </FieldGroup>
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    const wasSuccessful = await onSubmit(values)
    if (wasSuccessful) form.reset({ name: '' })
  })

  if (isMobile) {
    return (
      <Drawer direction='bottom' open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className='mx-auto grid w-full max-w-md grid-rows-[auto_1fr] overflow-hidden'>
          <DrawerHeader className='text-left'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0 flex-1'>
                <DrawerTitle>{t('app.households.create.title')}</DrawerTitle>
                <DrawerDescription>
                  {t('app.households.create.description')}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  aria-label={t('common.actions.close')}
                  size='icon'
                  type='button'
                  variant='ghost'
                  onClick={() => onOpenChange(false)}>
                  <XIcon className='size-4' />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <form
            className='flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pb-5'
            onSubmit={handleSubmit}>
            {formFields}
            <DialogFooter className='mt-auto border-t border-border/60 bg-popover/95 px-0 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]'>
              <Button
                size={'sm'}
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}>
                {t('common.actions.cancel')}
              </Button>
              <Button disabled={isSubmitting} size={'sm'} type='submit'>
                {isSubmitting
                  ? t('app.households.actions.creating')
                  : t('app.households.actions.create')}
              </Button>
            </DialogFooter>
          </form>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('app.households.create.title')}</DialogTitle>
          <DialogDescription>
            {t('app.households.create.description')}
          </DialogDescription>
        </DialogHeader>
        <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
          {formFields}
          <DialogFooter className='flex-row justify-end'>
            <Button
              size={'sm'}
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button disabled={isSubmitting} size={'sm'} type='submit'>
              {isSubmitting
                ? t('app.households.actions.creating')
                : t('app.households.actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
