'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  FieldInputController,
  FieldSelectController,
} from '@/components/shared/form'
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
  isSubmitting: boolean
  onSubmit: (values: UpdateHouseholdSettingsFormValues) => Promise<void>
}

export const HouseholdSettingsCard = ({
  household,
  isSubmitting,
  onSubmit,
}: HouseholdSettingsCardProps) => {
  const form = useForm<UpdateHouseholdSettingsFormValues>({
    defaultValues: {
      defaultCurrencyCode: '',
      defaultVisibility: undefined,
      name: '',
      timezone: '',
    },
    resolver: zodResolver(updateHouseholdSettingsSchema),
  })

  useEffect(() => {
    form.reset({
      defaultCurrencyCode: household.defaultCurrencyCode,
      defaultVisibility: household.defaultVisibility,
      name: household.name,
      timezone: household.timezone,
    })
  }, [form, household])

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-col gap-1'>
            <CardTitle>{household.name}</CardTitle>
            <CardDescription>
              {t('app.householdDetail.memberCountPlaceholder')}
            </CardDescription>
          </div>
          <Badge variant='secondary'>{household.role}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className='flex flex-col gap-5'
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values)
          })}>
          <FieldGroup>
            <FieldInputController
              control={form.control}
              description={t(
                'app.householdDetail.fields.householdName.description',
              )}
              id='settings-household-name'
              label={t('app.householdDetail.fields.householdName.label')}
              name='name'
              placeholder={t(
                'app.householdDetail.fields.householdName.placeholder',
              )}
            />

            <FieldInputController
              control={form.control}
              description={t('app.householdDetail.fields.currency.description')}
              id='settings-default-currency-code'
              label={t('app.householdDetail.fields.currency.label')}
              maxLength={3}
              name='defaultCurrencyCode'
              placeholder='USD'
            />

            <FieldInputController
              control={form.control}
              description={t('app.householdDetail.fields.timezone.description')}
              id='settings-timezone'
              label={t('app.householdDetail.fields.timezone.label')}
              name='timezone'
              placeholder={t('app.householdDetail.fields.timezone.placeholder')}
            />

            <FieldSelectController
              control={form.control}
              description={t(
                'app.householdDetail.fields.defaultVisibility.description',
              )}
              id='settings-default-visibility'
              label={t('app.householdDetail.fields.defaultVisibility.label')}
              name='defaultVisibility'
              options={[
                {
                  label: t(
                    'app.householdDetail.fields.defaultVisibility.options.private',
                  ),
                  value: 'private',
                },
                {
                  label: t(
                    'app.householdDetail.fields.defaultVisibility.options.household',
                  ),
                  value: 'household',
                },
              ]}
              onValueChange={(value) =>
                value === 'private' || value === 'household' ? value : undefined
              }
            />
          </FieldGroup>

          <div className='flex justify-end'>
            <Button disabled={isSubmitting} type='submit'>
              {t('app.householdDetail.actions.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
