'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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
} from '@/lib/forms/household.schema'
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
  const form = useForm<CreateHouseholdFormValues>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(createHouseholdSchema),
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('app.households.create.title')}</DialogTitle>
          <DialogDescription>
            {t('app.households.create.description')}
          </DialogDescription>
        </DialogHeader>
        <form
          className='flex flex-col gap-5'
          onSubmit={form.handleSubmit(async (values) => {
            const wasSuccessful = await onSubmit(values)

            if (wasSuccessful) {
              form.reset({
                name: '',
              })
            }
          })}>
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
                      className='h-10 text-sm'
                      id='household-name'
                      placeholder={t(
                        'app.households.fields.householdName.placeholder',
                      )}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
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
