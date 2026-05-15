'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { FieldInputController } from '@/components/shared/form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import {
  type UpdateHouseholdSettingsFormValues,
  updateHouseholdSettingsSchema,
} from '@/lib/forms/household.schema'
import { t } from '@/lib/i18n/t'
import type { HouseholdDTO } from '@/types/household'

type HouseholdSettingsCardProps = {
  household: HouseholdDTO
  memberCount: number
  isAdmin: boolean
  isSubmitting: boolean
  onSubmit: (values: UpdateHouseholdSettingsFormValues) => Promise<void>
}

export const HouseholdSettingsCard = ({
  household,
  memberCount,
  isAdmin,
  isSubmitting,
  onSubmit,
}: HouseholdSettingsCardProps) => {
  const form = useForm<UpdateHouseholdSettingsFormValues>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(updateHouseholdSettingsSchema),
  })

  useEffect(() => {
    form.reset({
      name: household.name,
    })
  }, [form, household])

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex justify-between font-semibold uppercase'>
          {household.name}
          <Badge className='uppercase' variant='secondary'>
            {household.role}
          </Badge>
        </CardTitle>
        <CardDescription className='font-mono'>
          {t('app.householdDetail.memberCount', { count: memberCount })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAdmin ? (
          <form
            className='flex flex-col gap-5'
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values)
            })}>
            <FieldGroup>
              <FieldInputController
                control={form.control}
                id='settings-household-name'
                label={t('app.householdDetail.fields.householdName.label')}
                name='name'
                placeholder={t(
                  'app.householdDetail.fields.householdName.placeholder',
                )}
              />
            </FieldGroup>

            <div className='flex justify-end'>
              <Button disabled={isSubmitting} size={'sm'} type='submit'>
                {t('app.householdDetail.actions.save')}
              </Button>
            </div>
          </form>
        ) : (
          <p className='text-sm text-muted-foreground'>
            {t('app.householdDetail.memberReadOnly')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
