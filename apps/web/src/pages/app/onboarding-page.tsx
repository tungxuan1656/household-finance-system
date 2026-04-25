import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PATHS } from '@/lib/constants/paths'
import {
  type CreateHouseholdFormValues,
  createHouseholdSchema,
} from '@/lib/forms/household.schema'
import { t } from '@/lib/i18n'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

function OnboardingPage() {
  const navigate = useNavigate()
  const isLoading = useHouseholdStore.use.isLoading()
  const form = useForm<CreateHouseholdFormValues>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(createHouseholdSchema),
  })

  const onSubmit = async (values: CreateHouseholdFormValues) => {
    try {
      await householdActions.createHousehold(values)

      toast.success(t('app.onboarding.feedback.createSuccess'))
      navigate(PATHS.HOUSEHOLDS, { replace: true })
    } catch {
      toast.error(t('app.onboarding.feedback.createFailed'))
    }
  }

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <header className='mb-6 space-y-2'>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('app.onboarding.title')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t('app.onboarding.description')}
        </p>
      </header>

      <form
        className='rounded-none border border-border/70 bg-background/70 p-4 backdrop-blur sm:p-5'
        onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name='name'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='household-name'>
                  {t('app.onboarding.fields.householdName.label')}
                </FieldLabel>
                <FieldContent>
                  <FieldDescription>
                    {t('app.onboarding.fields.householdName.description')}
                  </FieldDescription>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id='household-name'
                    placeholder={t(
                      'app.onboarding.fields.householdName.placeholder',
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

        <div className='mt-5 flex items-center justify-end gap-3'>
          <Button disabled={isLoading} type='submit'>
            {isLoading
              ? t('app.onboarding.actions.creating')
              : t('app.onboarding.actions.create')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export { OnboardingPage }
