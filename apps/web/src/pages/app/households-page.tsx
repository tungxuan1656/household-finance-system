import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import {
  type CreateHouseholdFormValues,
  createHouseholdSchema,
} from '@/lib/forms/household.schema'
import { t } from '@/lib/i18n'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

function HouseholdsPage() {
  const households = useHouseholdStore.use.households()
  const isLoading = useHouseholdStore.use.isLoading()
  const error = useHouseholdStore.use.error()
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false)

  const form = useForm<CreateHouseholdFormValues>({
    defaultValues: {
      defaultCurrencyCode: 'USD',
      name: '',
    },
    resolver: zodResolver(createHouseholdSchema),
  })

  useEffect(() => {
    void householdActions.fetchHouseholds()
  }, [])

  const onSubmit = async (values: CreateHouseholdFormValues) => {
    try {
      await householdActions.createHousehold(values)

      form.reset({
        defaultCurrencyCode: 'USD',
        name: '',
      })

      setIsCreateFormVisible(false)
      toast.success(t('app.households.feedback.createSuccess'))
    } catch {
      toast.error(t('app.households.feedback.createFailed'))
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('app.households.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('app.households.description')}
          </p>
        </div>
        <Button
          type='button'
          variant='outline'
          onClick={() => setIsCreateFormVisible((value) => !value)}>
          <Plus data-icon='inline-start' />
          {t('app.households.actions.create')}
        </Button>
      </header>

      {isCreateFormVisible ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('app.households.create.title')}</CardTitle>
            <CardDescription>
              {t('app.households.create.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className='flex flex-col gap-5'
              onSubmit={form.handleSubmit(onSubmit)}>
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
                        <FieldDescription>
                          {t('app.households.fields.householdName.description')}
                        </FieldDescription>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
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

                <Controller
                  control={form.control}
                  name='defaultCurrencyCode'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='household-currency'>
                        {t('app.households.fields.currency.label')}
                      </FieldLabel>
                      <FieldContent>
                        <FieldDescription>
                          {t('app.households.fields.currency.description')}
                        </FieldDescription>
                        <NativeSelect
                          aria-invalid={fieldState.invalid}
                          id='household-currency'
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }>
                          <option value='VND'>VND</option>
                          <option value='USD'>USD</option>
                          <option value='EUR'>EUR</option>
                        </NativeSelect>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
              </FieldGroup>

              <div className='flex items-center justify-end gap-2'>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => setIsCreateFormVisible(false)}>
                  {t('common.actions.cancel')}
                </Button>
                <Button disabled={isLoading} type='submit'>
                  {isLoading
                    ? t('app.households.actions.creating')
                    : t('app.households.actions.create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Card>
          <CardContent className='pt-1 text-sm text-muted-foreground'>
            {t('app.households.loading')}
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && error ? (
        <Card>
          <CardContent className='flex items-center justify-between gap-2 pt-1'>
            <p className='text-sm text-destructive'>{error}</p>
            <Button
              type='button'
              variant='outline'
              onClick={() => void householdActions.fetchHouseholds()}>
              {t('app.households.actions.retry')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && households.length === 0 ? (
        <Empty className='border'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <span aria-hidden='true'>▣</span>
            </EmptyMedia>
            <EmptyTitle>{t('app.households.empty.title')}</EmptyTitle>
            <EmptyDescription>
              {t('app.households.empty.description')}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type='button' onClick={() => setIsCreateFormVisible(true)}>
              {t('app.households.actions.create')}
            </Button>
          </EmptyContent>
        </Empty>
      ) : null}

      {!isLoading && !error && households.length > 0 ? (
        <div className='flex flex-col gap-3'>
          {households.map((household) => (
            <Card key={household.id}>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex flex-col gap-1'>
                    <CardTitle>{household.name}</CardTitle>
                    <CardDescription>
                      {household.defaultCurrencyCode}
                    </CardDescription>
                  </div>
                  <Badge variant='secondary'>{household.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className='flex items-center justify-between gap-3'>
                <p className='text-sm text-muted-foreground'>
                  {household.slug}
                </p>
                <Button asChild variant='outline'>
                  <Link to={`/households/${household.id}`}>
                    {t('app.households.actions.viewDetail')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export { HouseholdsPage }
